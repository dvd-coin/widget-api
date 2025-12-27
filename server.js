const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const CUSTOMERS = {
    'dvdcoin-demo': {
        name: 'DVD Coin (Demo)',
        limit: 10000,
        used: 0,
        active: true,
        knowledge: ''
    }
};

function checkCustomer(req, res, next) {
    const customerKey = req.body.customerKey || req.headers['x-customer-key'];
    
    if (!customerKey) {
        return res.status(401).json({ error: 'Customer key required' });
    }
    
    const customer = CUSTOMERS[customerKey];
    
    if (!customer) {
        return res.status(403).json({ error: 'Invalid customer key' });
    }
    
    if (!customer.active) {
        return res.status(403).json({ error: 'Customer account inactive' });
    }
    
    if (customer.used >= customer.limit) {
        return res.status(429).json({ error: 'Monthly limit exceeded' });
    }
    
    req.customer = customer;
    req.customerKey = customerKey;
    next();
}

app.post('/api/chat', checkCustomer, async (req, res) => {
    try {
        const { messages } = req.body;
        
        let messagesWithKnowledge = [...messages];
        if (req.customer.knowledge && req.customer.knowledge.trim()) {
            messagesWithKnowledge.splice(1, 0, {
                role: 'system',
                content: `IMPORTANT COMPANY KNOWLEDGE:\n\n${req.customer.knowledge}`
            });
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messagesWithKnowledge,
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        const result = await response.json();
        CUSTOMERS[req.customerKey].used++;
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/tts', checkCustomer, async (req, res) => {
    try {
        const { input, voice, audioConfig } = req.body;
        
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input, voice, audioConfig })
            }
        );
        
        const result = await response.json();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upload-knowledge', checkCustomer, async (req, res) => {
    try {
        const { knowledge, adminPassword } = req.body;
        
        if (!adminPassword) {
            return res.status(401).json({ error: 'Admin password required' });
        }
        
        CUSTOMERS[req.customerKey].knowledge = knowledge;
        
        res.json({ 
            success: true,
            knowledgeLength: knowledge.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/get-knowledge', checkCustomer, async (req, res) => {
    try {
        res.json({ 
            knowledge: CUSTOMERS[req.customerKey].knowledge || '',
            knowledgeLength: (CUSTOMERS[req.customerKey].knowledge || '').length
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
