import express from 'express';
import db from '../db';

const router = express.Router();

/**
 * CONTACTS
 */

// GET all contacts for user with filters
router.get('/contacts', async (req: any, res) => {
    try {
        const { area_id, tag_id, search } = req.query;
        const userId = req.user.id;

        let query = db('contacts')
            .where('contacts.user_id', userId)
            .select('contacts.*')
            .orderBy('contacts.name', 'asc');

        if (area_id) {
            query = query
                .join('contact_life_areas', 'contacts.id', 'contact_life_areas.contact_id')
                .where('contact_life_areas.area_id', area_id);
        }

        if (tag_id) {
            query = query
                .join('contact_tag_map', 'contacts.id', 'contact_tag_map.contact_id')
                .where('contact_tag_map.tag_id', tag_id);
        }

        if (search) {
            query = query.where(function () {
                this.where('name', 'like', `%${search}%`)
                    .orWhere('email', 'like', `%${search}%`)
                    .orWhere('phone', 'like', `%${search}%`);
            });
        }

        const contacts = await query;

        // Fetch tags and areas for each contact
        const enrichedContacts = await Promise.all(contacts.map(async (contact) => {
            const tags = await db('contact_tags')
                .join('contact_tag_map', 'contact_tags.id', 'contact_tag_map.tag_id')
                .where('contact_tag_map.contact_id', contact.id)
                .select('contact_tags.*');

            const areas = await db('life_areas')
                .join('contact_life_areas', 'life_areas.id', 'contact_life_areas.area_id')
                .where('contact_life_areas.contact_id', contact.id)
                .select('life_areas.*');

            return { ...contact, tags, areas };
        }));

        res.json(enrichedContacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// POST create contact
router.post('/contacts', async (req: any, res) => {
    const { name, email, phone, bio, avatar, area_ids, tag_ids } = req.body;
    const userId = req.user.id;

    try {
        const [newContact] = await db.transaction(async (trx) => {
            const [contact] = await trx('contacts')
                .insert({
                    user_id: userId,
                    name,
                    email,
                    phone,
                    bio,
                    avatar,
                })
                .returning('*');

            if (area_ids && Array.isArray(area_ids)) {
                const areaMappings = area_ids.map(area_id => ({
                    contact_id: contact.id,
                    area_id
                }));
                await trx('contact_life_areas').insert(areaMappings);
            }

            if (tag_ids && Array.isArray(tag_ids)) {
                const tagMappings = tag_ids.map(tag_id => ({
                    contact_id: contact.id,
                    tag_id
                }));
                await trx('contact_tag_map').insert(tagMappings);
            }

            return [contact];
        });

        res.status(201).json(newContact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

// PUT update contact
router.put('/contacts/:id', async (req: any, res) => {
    const { id } = req.params;
    const { name, email, phone, bio, avatar, area_ids, tag_ids } = req.body;
    const userId = req.user.id;

    try {
        const [updatedContact] = await db.transaction(async (trx) => {
            const [contact] = await trx('contacts')
                .where({ id, user_id: userId })
                .update({
                    name,
                    email,
                    phone,
                    bio,
                    avatar,
                    updated_at: db.fn.now()
                })
                .returning('*');

            if (!contact) return [];

            // Update area mappings
            await trx('contact_life_areas').where('contact_id', id).del();
            if (area_ids && Array.isArray(area_ids)) {
                await trx('contact_life_areas').insert(area_ids.map(area_id => ({
                    contact_id: id,
                    area_id
                })));
            }

            // Update tag mappings
            await trx('contact_tag_map').where('contact_id', id).del();
            if (tag_ids && Array.isArray(tag_ids)) {
                await trx('contact_tag_map').insert(tag_ids.map(tag_id => ({
                    contact_id: id,
                    tag_id
                })));
            }

            return [contact];
        });

        if (!updatedContact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(updatedContact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// DELETE contact
router.delete('/contacts/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deletedCount = await db('contacts')
            .where({ id, user_id: userId })
            .del();

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

/**
 * TAGS
 */

router.get('/tags', async (req: any, res) => {
    try {
        const tags = await db('contact_tags').where('user_id', req.user.id);
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

router.post('/tags', async (req: any, res) => {
    const { name, color } = req.body;
    try {
        const [newTag] = await db('contact_tags')
            .insert({
                user_id: req.user.id,
                name,
                color: color || '#4A90E2'
            })
            .returning('*');
        res.status(201).json(newTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

/**
 * REMINDERS
 */

router.get('/reminders', async (req: any, res) => {
    try {
        const reminders = await db('contact_reminders')
            .join('contacts', 'contact_reminders.contact_id', 'contacts.id')
            .where('contacts.user_id', req.user.id)
            .select('contact_reminders.*', 'contacts.name as contact_name')
            .orderBy('remind_at', 'asc');
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

router.post('/reminders', async (req: any, res) => {
    const { contact_id, message, remind_at } = req.body;
    try {
        // Verify contact belongs to user
        const contact = await db('contacts').where({ id: contact_id, user_id: req.user.id }).first();
        if (!contact) {
            return res.status(403).json({ error: 'Unauthorized contact access' });
        }

        const [newReminder] = await db('contact_reminders')
            .insert({
                contact_id,
                message,
                remind_at,
                status: 'pending'
            })
            .returning('*');
        res.status(201).json(newReminder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
});

export default router;
