import fs from 'fs';
import path from 'path';
// import { env } from '@xenova/transformers';
import db from '../db';
const pdf = require('pdf-parse');
const cosineSimilarity = require('cosine-similarity');

// Dynamic import for transformers to avoid issues in some Node environments
let pipeline: any = null;

async function getPipeline() {
    if (!pipeline) {
        // env.localModelPath = './models';
        // env.allowRemoteModels = true;
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
    }
    return pipeline;
}

let extractor: any = null;

async function getExtractor() {
    if (!extractor) {
        const pipe = await getPipeline();
        extractor = await pipe('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

export async function processFile(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (ext === '.md' || ext === '.txt') {
            text = fs.readFileSync(filePath, 'utf8');
        } else {
            return; // Unsupported file type
        }

        const chunks = chunkText(text, 500, 50); // 500 words per chunk, 50 overlap
        const extract = await getExtractor();

        for (const chunk of chunks) {
            const output = await extract(chunk, { pooling: 'mean', normalize: true });
            const embeddingArray = Array.from(output.data);

            await db('vault_chunks').insert({
                file_name: path.basename(filePath),
                content: chunk,
                embedding: JSON.stringify(embeddingArray)
            });
        }
    } catch (e) {
        console.error(`Error processing file ${filePath}:`, e);
    }
}

export async function embedAndSaveText(sourceName: string, text: string) {
    try {
        const chunks = chunkText(text, 500, 50); // 500 words per chunk, 50 overlap
        const extract = await getExtractor();

        for (const chunk of chunks) {
            const output = await extract(chunk, { pooling: 'mean', normalize: true });
            const embeddingArray = Array.from(output.data);

            await db('vault_chunks').insert({
                file_name: sourceName,
                content: chunk,
                embedding: JSON.stringify(embeddingArray)
            });
        }
    } catch (e) {
        console.error(`Error embedding text for ${sourceName}:`, e);
    }
}

export async function indexFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) throw new Error('Folder does not exist');

    // Simple recursive walk
    const walk = (dir: string): string[] => {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                results.push(file);
            }
        });
        return results;
    };

    const files = walk(folderPath);
    for (const file of files) {
        await processFile(file);
    }
}

export async function searchVault(query: string, k: number = 3) {
    const extract = await getExtractor();
    const output = await extract(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(output.data);

    // Fetch all chunks from SQLite
    const rows = await db('vault_chunks').select('*');
    
    // Calculate similarities in JS
    const results = rows.map(row => {
        const chunkEmbedding = JSON.parse(row.embedding);
        const sim = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return {
            file_name: row.file_name,
            content: row.content,
            similarity: sim
        };
    });

    // Sort by descending similarity and pick top K
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, k);
}

// Helper to chunk text
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    return chunks;
}
