import { Router } from 'express';
import { indexFolder } from '../services/vaultService';

const router = Router();

router.post('/index', async (req, res) => {
    const { folderPath } = req.body;
    
    if (!folderPath) {
        return res.status(400).json({ error: 'folderPath is required' });
    }

    try {
        // Run index process in the background
        indexFolder(folderPath).then(() => {
            console.log('Vault indexing completed successfully.');
        }).catch(err => {
            console.error('Vault indexing failed:', err);
        });

        res.json({ status: 'Indexing started', folder: folderPath });
    } catch (e) {
        res.status(500).json({ error: 'Failed to start indexing' });
    }
});

export default router;
