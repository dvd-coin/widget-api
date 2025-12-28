const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-customer-key'],
    credentials: true
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// ==================== CUSTOMER DATABASE ====================
// Her müşteri için ayrı key ve limit
// searchApiKey'i Railway'den eklemek için:
// 1. CUSTOMERS objesi içinde ilgili customer'ın searchApiKey'ini güncelle
// 2. Deploy et
// Örnek: 'dvdcoin-demo': { ..., searchApiKey: 'your-api-key-here' }
const CUSTOMERS = {
    'dvdcoin-demo': {
        name: 'DVD Coin (Demo)',
        allowedDomain: 'dvdcoin.io',
        limit: 10000,
        used: 0,
        active: true,
        knowledge: '', // ← COMPANY KNOWLEDGE (PDF/TXT içeriği)
        searchApiKey: '' // ← REAL-TIME SEARCH API KEY (Railway'den ekle)
    },
    'customer-test': {
        name: 'Test Customer',
        allowedDomain: 'localhost',
        limit: 1000,
        used: 0,
        active: true,
        knowledge: '',
        searchApiKey: ''
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
    
    // ==================== DOMAIN CHECK ====================
    if (customer.allowedDomain) {
        const origin = req.headers.origin || req.headers.referer || '';
        let requestDomain = '';
        
        try {
            if (origin) {
                const url = new URL(origin);
                requestDomain = url.hostname;
            }
        } catch (e) {
            console.log('Could not parse origin');
        }
        
        // Check domain
        const allowed = customer.allowedDomain;
        const isAllowed = requestDomain === allowed || 
                         requestDomain === 'www.' + allowed ||
                         requestDomain.endsWith('.' + allowed) ||
                         (allowed === 'localhost' && (requestDomain === 'localhost' || requestDomain === '127.0.0.1'));
        
        if (!isAllowed && requestDomain !== '') {
            console.log(`[${customerKey}] ❌ Domain not allowed: ${requestDomain}`);
            console.log(`[${customerKey}] ✅ Allowed domain: ${allowed}`);
            return res.status(403).json({ 
                error: 'Domain not authorized',
                domain: requestDomain
            });
        }
        
        console.log(`[${customerKey}] ✅ Domain authorized: ${requestDomain}`);
    }

    req.customerKey = customerKey;
    next();
}

// ==================== CHAT ENDPOINT ====================
app.post('/api/chat', checkCustomer, async (req, res) => {
    try {
        const { messages } = req.body;
        
        console.log(`[${req.customerKey}] Chat request - Messages: ${messages.length}`);
        
        // Müşterinin knowledge'ını ekle (varsa)
        let messagesWithKnowledge = [...messages];
        if (req.customer.knowledge && req.customer.knowledge.trim()) {
            // System prompt'tan sonra, user mesajlarından önce knowledge ekle
            messagesWithKnowledge.splice(1, 0, {
                role: 'system',
                content: `IMPORTANT COMPANY KNOWLEDGE - Use this to answer questions:\n\n${req.customer.knowledge}`
            });
            console.log(`[${req.customerKey}] Added knowledge (${req.customer.knowledge.length} chars)`);
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

// ==================== UPLOAD KNOWLEDGE ENDPOINT ====================
app.post('/api/upload-knowledge', checkCustomer, async (req, res) => {
    try {
        const { knowledge, adminPassword } = req.body;
        
        // Admin password kontrolü (her müşteri kendi widget password'ünü kullanır)
        if (!adminPassword) {
            return res.status(401).json({ error: 'Admin password required' });
        }
        
        console.log(`[${req.customerKey}] Knowledge upload request - ${knowledge.length} chars`);
        
        // Knowledge'ı kaydet
        CUSTOMERS[req.customerKey].knowledge = knowledge;
        
        console.log(`[${req.customerKey}] Knowledge updated successfully`);
        
        res.json({ 
            success: true, 
            message: 'Knowledge uploaded successfully',
            knowledgeLength: knowledge.length
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== GET KNOWLEDGE ENDPOINT ====================
app.get('/api/get-knowledge', checkCustomer, async (req, res) => {
    try {
        res.json({ 
            knowledge: CUSTOMERS[req.customerKey].knowledge || '',
            knowledgeLength: (CUSTOMERS[req.customerKey].knowledge || '').length
        });
    } catch (error) {
        console.error('Get knowledge error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== WEB SEARCH ENDPOINT ====================
app.post('/api/search', checkCustomer, async (req, res) => {
    try {
        const { query } = req.body;
        
        // Check if customer has search API key
        if (!req.customer.searchApiKey || req.customer.searchApiKey.trim() === '') {
            return res.status(400).json({ 
                error: 'Real-time search is not available. Please add a search API key to your Railway configuration.',
                available: false
            });
        }
        
        console.log(`[${req.customerKey}] Search request: ${query}`);
        
        // Example: Brave Search API (you can replace with any search API)
        // For now, just return a message
        res.json({
            available: true,
            message: 'Search feature is configured. Add your preferred search API implementation here.',
            query: query
        });
        
    } catch (error) {
        console.error('Search error:', error);
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
