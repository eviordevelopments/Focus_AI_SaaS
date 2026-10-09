import express from 'express';
import OpenAI from 'openai';
import db from '../db';

const router = express.Router();

// Initialize OpenAI client for OpenRouter
// Note: Requires OPENROUTER_API_KEY in .env
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || 'mock-key', // Fallback for dev if not set, will fail actual calls
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Focus AI",
    }
});

router.post('/chat', async (req, res) => {
    try {
        // Set headers immediately so we can stream progress
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Extract full conversation history
        const { messages: history, model, mode, agentConfig, conversationId } = req.body;

        // 1. Fetch user context
        const user = await db('users').first();
        const recentSessions = await db('sessions').orderBy('start_time', 'desc').limit(3);
        const recentHealth = await db('health_entries').orderBy('date', 'desc').limit(1);

        // 2. Retrieve Global Context (RAG)
        const lastUserMsg = history && history.length > 0 ? history[history.length - 1].content : '';
        let retrievedContext = '';
        try {
            const { searchVault } = await import('../services/vaultService');
            if (lastUserMsg) {
                const results = await searchVault(lastUserMsg, 3);
                if (results.length > 0) {
                    retrievedContext = '\n[SYSTEM: RETRIEVED MEMORY CONTEXT FROM USER VAULT]\n' + 
                        results.map((r: any) => `- ${r.content}`).join('\n') + '\n';
                }
            }
        } catch (e) {
            console.error('Failed to retrieve vault context', e);
        }

        // 3. Build System Prompt
        const agentName = agentConfig?.agentName || 'Focus AI';
        const role = agentConfig?.role || 'productivity coach and second brain agent';
        const customPrompt = agentConfig?.systemPrompt ? `\n[CUSTOM INSTRUCTIONS]:\n${agentConfig.systemPrompt}\n` : '';
        const tone = agentConfig?.tone ? `\nTone: ${agentConfig.tone}\n` : '';

        let systemPrompt = `You are ${agentName}, a ${role}. 
    Your goal is to help the user stay focused, manage burnout, and learn effectively.
    ${retrievedContext}
    ${customPrompt}${tone}
    CAPABILITIES & FORMATTING:
    - ALWAYS format equations and mathematical notation using LaTeX:
      - Use single dollar signs ($) for inline math (e.g. $E = mc^2$)
      - Use double dollar signs ($$) for block math equations.
    - ALWAYS output all code (whether Python, Javascript, etc.) inside markdown code cells (using triple backticks).
    - You can render markdown tables naturally.
    - You can render interactive charts (bar, line, pie) by outputting a JSON block with the language "chart".
    CRITICAL: The chart block must be STRICT, valid JSON. DO NOT include any comments (no //) or trailing commas.
    Example format for charts:
    \`\`\`chart
    {
      "type": "bar",
      "title": "My Chart Title",
      "xAxis": "name",
      "series": ["value1", "value2"],
      "data": [
        {"name": "A", "value1": 40, "value2": 24},
        {"name": "B", "value1": 30, "value2": 13}
      ]
    }
    \`\`\`
    
    Context:
    User Name: ${user?.name || 'User'}
    `;

        if (mode === 'research') {
            systemPrompt += `\n[INSTRUCCIÓN CRÍTICA DE MODO RESEARCH]: Para todas tus respuestas, debes utilizar citas parentéticas (Ej: Apellido, Año) dentro del texto. Además, SIEMPRE debes incluir una sección final llamada "Referencias" con las fuentes utilizadas en formato estricto APA 7ma edición.\n`;
        }

        if (mode === 'math') {
            systemPrompt += `\n\n[MATH MODE ENABLED]: You are an expert mathematician and advanced calculus professor. When given a math problem:
1. Break down the solution into clear, logical steps.
2. Show all your work, explaining the theorems, rules (e.g. Chain Rule, L'Hopital's, Integration by Parts), and properties you apply.
3. ALWAYS format your mathematical formulas using LaTeX. Use $$...$$ for block equations and $...$ for inline equations.
4. Conclude with a clear, highlighted final answer.`;
        } else if (mode === 'study') {
            systemPrompt += `\n\n[STUDY MODE INSTRUCTIONS]: You are in an interactive study session. 
When teaching or testing knowledge:
1. If asked for a "mapa mental", "mind map", "esquema visual", or diagram, YOU MUST output it using a Markdown code block with the language "mermaid", like this:
\`\`\`mermaid
mindmap
  root((Tema))
    Subtema
      Idea
\`\`\`
CRITICAL: DO NOT ever generate plain text ASCII trees (like using \`|\` or \`-\` to draw branches). You must ALWAYS use a \`\`\`mermaid\`\`\` code block.
2. If appropriate, offer to generate a short 3-question quiz.
3. Output the quiz exactly in this JSON format inside a Markdown code block:
\`\`\`quiz
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option text",
      "explanation": "Why this is correct"
    }
  ]
}
\`\`\`
4. If asked to generate flashcards, use exactly this JSON format:
\`\`\`flashcards
{
  "title": "Deck Title",
  "cards": [
    {
      "front": "Front of card",
      "back": "Back of card"
    }
  ]
}
\`\`\`
Always output math and formulas in LaTeX blocks.`;
        }

        if (recentHealth && recentHealth.length > 0) {
            systemPrompt += `Recent Health: Mood ${recentHealth[0].mood}/10, Stress ${recentHealth[0].stress}/10.\n`;
        }

        if (recentSessions && recentSessions.length > 0) {
            systemPrompt += `Recent Sessions: Last one was ${recentSessions[0].type} for ${recentSessions[0].actual_minutes} mins.\n`;
        }

        // --- WEB SEARCH INTERCEPTION ---
        let lastUserText = "";
        if (history && history.length > 0) {
            const lastMsg = history[history.length - 1];
            if (lastMsg.role === 'user') {
                if (typeof lastMsg.content === 'string') {
                    lastUserText = lastMsg.content;
                } else if (Array.isArray(lastMsg.content)) {
                    lastUserText = lastMsg.content.find((c: any) => c.type === 'text')?.text || "";
                }
            }
        }

        // --- VAULT RAG SEARCH ---
        if (mode === 'research' && lastUserText.length > 3) {
            try {
                res.write(`data: ${JSON.stringify({ status: 'searching_vault' })}\n\n`);
                const { searchVault } = require('../services/vaultService');
                const vaultResults = await searchVault(lastUserText, 3);
                
                if (vaultResults && vaultResults.length > 0) {
                    const vaultContext = vaultResults.map((r: any) => `[File: ${r.file_name}]\n${r.content}`).join('\n\n');
                    systemPrompt += `\n\n[LOCAL VAULT CONTEXT]: The user has a local knowledge base. Use the following context retrieved from their files to answer the query:\n${vaultContext}\n`;
                    
                    const urls = vaultResults.map((r: any) => ({ title: r.file_name, url: 'local-vault', source: 'Local Vault' }));
                    res.write(`data: ${JSON.stringify({ sources: urls })}\n\n`);
                }
            } catch (e) {
                console.error("Vault Search Failed:", e);
                // Non-fatal, just continue
            }
        }
        // -------------------------

        // --- WEB SEARCH INTERCEPTION ---
        const keywordSearch = /busca(r| en internet|la web)?|search( the web)?|google|noticia|hoy|clima|investiga|dime sobre|quien es|que es/i.test(lastUserText);
        const needsSearch = (mode === 'research') || keywordSearch;
        
        if (needsSearch && lastUserText.length > 3) {
            try {
                console.log("Triggering Web Search for:", lastUserText);
                res.write(`data: ${JSON.stringify({ status: 'searching' })}\n\n`);
                
                const API_KEY = 'MJS83LLI3STD4U0KTT67TPS8MROVCNZ6VXJ95K6VUAFE6Y2JXX4JUV217DEJ0PVJTY0Q62I37Q4N542W';
                const searchQuery = mode === 'research' ? `${lastUserText} -site:wikipedia.org -site:es.wikipedia.org` : lastUserText;
                const sbRes = await fetch(`https://app.scrapingbee.com/api/v1/store/google?api_key=${API_KEY}&search=${encodeURIComponent(searchQuery)}`);
                const sbData = await sbRes.json();
                
                if (sbData.organic_results && sbData.organic_results.length > 0) {
                    const topResults = sbData.organic_results.slice(0, 3);
                    const urls = topResults.map((r: any) => ({ title: r.title, url: r.url, source: 'Google Search' }));
                    res.write(`data: ${JSON.stringify({ sources: urls })}\n\n`);
                    
                    const topText = topResults.map((r: any) => `- ${r.title}: ${r.description} (${r.url})`).join('\n');
                    systemPrompt += `\n\n[CRITICAL SYSTEM MESSAGE]: You DO have internet access for this request! The system has silently searched the web for you. DO NOT apologize or say you cannot browse the internet. Use the following live Google search results to answer the user's query comprehensively:\n\n${topText}\n\nEnsure you cite these sources using parenthetical citations and include an APA 7 reference list at the end.`;
                }
            } catch (e) {
                console.error("Search Failed:", e);
                res.write(`data: ${JSON.stringify({ status: 'search_failed' })}\n\n`);
                systemPrompt += `\n\n[SYSTEM NOTE]: You attempted to search the web, but the search engine API is currently unavailable. Let the user know you couldn't fetch live data.`;
            }
        }
        // ---------------------------------

        if (process.env.OPENROUTER_API_KEY) {
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...(history || []).map((msg: any) => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];

            // Ensure we pass the configuration parameters to the OpenAI client
            const stream = await openai.chat.completions.create({
                model: model || "openrouter/auto",
                messages: apiMessages,
                stream: true,
                temperature: agentConfig?.temperature ?? 0.7,
                top_p: agentConfig?.topP ?? 1.0,
                max_tokens: agentConfig?.maxTokens ?? 2000
            });

            let fullAssistantResponse = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullAssistantResponse += content;
                    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
            }

            // Save to DB and embed to vault
            try {
                let currentConversationId = conversationId;
                if (!currentConversationId) {
                    const [newConv] = await db('conversations').insert({
                        title: lastUserMsg ? lastUserMsg.substring(0, 50) : 'Nueva conversación',
                        agent_id: agentConfig?.id || null,
                        mode: mode || 'normal'
                    }).returning('id');
                    currentConversationId = newConv.id || newConv;
                    
                    // Send conversation ID back to client so it can persist it
                    res.write(`data: ${JSON.stringify({ conversationId: currentConversationId })}\n\n`);
                }

                if (lastUserMsg) {
                    await db('chat_messages').insert({ conversation_id: currentConversationId, role: 'user', content: lastUserMsg });
                }
                if (fullAssistantResponse) {
                    await db('chat_messages').insert({ conversation_id: currentConversationId, role: 'assistant', content: fullAssistantResponse });
                }

                // Sync to RAG vault
                const { embedAndSaveText } = await import('../services/vaultService');
                const combinedMemory = `User: ${lastUserMsg}\nAgent (${agentName}): ${fullAssistantResponse}`;
                await embedAndSaveText(`Conversation-${currentConversationId}`, combinedMemory);
                
            } catch (saveError) {
                console.error('Failed to save memory', saveError);
            }

            res.write(`data: [DONE]\n\n`);
            res.end();
        } else {
            // Mock Response if no key
            console.log("No OPENROUTER_API_KEY found. Returning mock response.");
            
            const words = "I'm Focus AI. I can't connect to my brain right now (Missing API Key), but I'm here to help you focus! Try adding your OPENROUTER_API_KEY to the .env file.".split(" ");
            
            for (const word of words) {
                res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        }

    } catch (error) {
        console.error('AI Chat Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate response' });
        } else {
            res.write(`data: ${JSON.stringify({ text: "\n\n[SYSTEM ERROR]: Generation failed. It looks like your OpenRouter API key has insufficient credits or strict limits. Please check your OpenRouter dashboard." })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
        }
    }
});


import multer from 'multer';

// Use memory storage for audio chunks
const upload = multer({ storage: multer.memoryStorage() });

let transcriber: any = null;

router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        
        // Dynamically import transformers to avoid blocking startup
        const { pipeline } = await import('@xenova/transformers');

        // Ensure transcriber is loaded (whisper-tiny is ~40MB, loads fast)
        if (!transcriber) {
            console.log('Loading local Whisper model for Speech-to-Text...');
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
            console.log('Whisper model loaded.');
        }

        // The file buffer contains the raw Float32Array bytes sent from the frontend
        const buffer = req.file.buffer;
        
        // Convert Node Buffer to Float32Array
        // Buffer is little-endian floats if generated by frontend's float32Array.buffer
        const float32Array = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);

        console.log(`Transcribing audio chunk of length: ${float32Array.length} samples...`);

        // Transcribe
        const result = await transcriber(float32Array, {
            language: 'spanish',
            task: 'transcribe'
        });

        console.log('Transcription result:', result.text);
        res.json({ text: result.text.trim() });
    } catch (e) {
        console.error("Transcription error:", e);
        res.status(500).json({ error: 'Transcription failed' });
    }
});

export default router;
