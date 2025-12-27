const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== CUSTOMER DATABASE ====================
// Her müşteri için ayrı key ve limit
const CUSTOMERS = {
    'dvdcoin-demo': {
        name: 'DVD Coin (Demo)',
        limit: 10000,
        used: 0,
        active: true
    },
    'customer-test': {
        name: 'Test Customer',
        limit: 1000,
        used: 0,
        active: true
    }
    // Buraya yeni müşteriler ekleyebilirsin
};

// ==================== CUSTOMER CHECK MIDDLEWARE ====================
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
        return res.status(429).json({ error: 'Monthly limit exceeded. Please upgrade your plan.' });
    }
    
    req.customer = customer;
    req.customerKey = customerKey;
    next();
}

// ==================== CHAT ENDPOINT ====================
app.post('/api/chat', checkCustomer, async (req, res) => {
    try {
        const { messages } = req.body;
        
        console.log(`[${req.customerKey}] Chat request - Messages: ${messages.length}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error('OpenAI API error');
        }
        
        const result = await response.json();
        
        // Kullanımı kaydet
        CUSTOMERS[req.customerKey].used++;
        
        console.log(`[${req.customerKey}] Chat success - Usage: ${CUSTOMERS[req.customerKey].used}/${CUSTOMERS[req.customerKey].limit}`);
        
        res.json(result);
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== TTS ENDPOINT ====================
app.post('/api/tts', checkCustomer, async (req, res) => {
    try {
        const { input, voice, audioConfig } = req.body;
        
        console.log(`[${req.customerKey}] TTS request`);
        
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: input,
                    voice: voice,
                    audioConfig: audioConfig
                })
            }
        );
        
        if (!response.ok) {
            throw new Error('Google TTS API error');
        }
        
        const result = await response.json();
        
        console.log(`[${req.customerKey}] TTS success`);
        
        res.json(result);
        
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== USAGE STATS ENDPOINT ====================
app.get('/api/stats/:customerKey', (req, res) => {
    const customer = CUSTOMERS[req.params.customerKey];
    
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
        name: customer.name,
        used: customer.used,
        limit: customer.limit,
        remaining: customer.limit - customer.used,
        active: customer.active
    });
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        customers: Object.keys(CUSTOMERS).length
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Widget API Server running on port ${PORT}`);
    console.log(`📊 Active customers: ${Object.keys(CUSTOMERS).length}`);
    console.log(`✅ Ready to serve requests!`);
});
