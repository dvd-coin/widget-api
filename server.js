const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== POSTGRESQL CONNECTION ====================
// Railway otomatik olarak DATABASE_URL environment variable'ını ekler
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// ==================== DATABASE INITIALIZATION ====================
async function initDatabase() {
    try {
        // Create customers table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                customer_key VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                allowed_domain VARCHAR(255),
                limit_count INTEGER DEFAULT 10000,
                used_count INTEGER DEFAULT 0,
                active BOOLEAN DEFAULT true,
                knowledge TEXT DEFAULT '',
                search_api_key TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database tables initialized');
        
        // Insert default customers if they don't exist
        await insertDefaultCustomers();
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

async function insertDefaultCustomers() {
    const defaultCustomers = [
        {
            customer_key: 'dvdcoin-demo',
            name: 'DVD Coin (Demo)',
            allowed_domain: 'dvdcoin.io',
            limit_count: 10000
        },
        {
            customer_key: 'customer-test',
            name: 'Test Customer',
            allowed_domain: 'localhost',
            limit_count: 1000
        }
    ];
    
    for (const customer of defaultCustomers) {
        try {
            await pool.query(`
                INSERT INTO customers (customer_key, name, allowed_domain, limit_count)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (customer_key) DO NOTHING
            `, [customer.customer_key, customer.name, customer.allowed_domain, customer.limit_count]);
            
            console.log(`✅ Customer initialized: ${customer.customer_key}`);
        } catch (error) {
            console.error(`Error initializing customer ${customer.customer_key}:`, error);
        }
    }
}

// Initialize database on startup
initDatabase();

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-customer-key'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for large PDFs
app.options('*', cors());

// ==================== CUSTOMER CHECK MIDDLEWARE ====================
async function checkCustomer(req, res, next) {
    const customerKey = req.body.customerKey || req.headers['x-customer-key'];
    
    if (!customerKey) {
        return res.status(401).json({ error: 'Customer key required' });
    }
    
    try {
        // Get customer from database
        const result = await pool.query(
            'SELECT * FROM customers WHERE customer_key = $1',
            [customerKey]
        );
        
        if (result.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid customer key' });
        }
        
        const customer = result.rows[0];
        
        if (!customer.active) {
            return res.status(403).json({ error: 'Customer account inactive' });
        }
        
        if (customer.used_count >= customer.limit_count) {
            return res.status(429).json({ error: 'Monthly limit exceeded. Please upgrade your plan.' });
        }
        
        // Domain check
        if (customer.allowed_domain) {
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
            
            const allowed = customer.allowed_domain;
            const isAllowed = requestDomain === allowed || 
                             requestDomain === 'www.' + allowed ||
                             requestDomain.endsWith('.' + allowed) ||
                             (allowed === 'localhost' && (requestDomain === 'localhost' || requestDomain === '127.0.0.1'));
            
            if (!isAllowed && requestDomain !== '') {
                console.log(`[${customerKey}] ❌ Domain not allowed: ${requestDomain}`);
                return res.status(403).json({ 
                    error: 'Domain not authorized',
                    domain: requestDomain
                });
            }
            
            console.log(`[${customerKey}] ✅ Domain authorized: ${requestDomain}`);
        }
        
        req.customer = customer;
        req.customerKey = customerKey;
        next();
        
    } catch (error) {
        console.error('Customer check error:', error);
        res.status(500).json({ error: 'Database error' });
    }
}

// ==================== CHAT ENDPOINT ====================
app.post('/api/chat', checkCustomer, async (req, res) => {
    try {
        const { messages } = req.body;
        
        console.log(`[${req.customerKey}] Chat request - Messages: ${messages.length}`);
        
        // Add customer knowledge if exists
        let messagesWithKnowledge = [...messages];
        if (req.customer.knowledge && req.customer.knowledge.trim()) {
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
        
        // Increment usage counter in database
        await pool.query(
            'UPDATE customers SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP WHERE customer_key = $1',
            [req.customerKey]
        );
        
        // Update local customer object
        req.customer.used_count++;
        
        console.log(`[${req.customerKey}] Chat success - Usage: ${req.customer.used_count}/${req.customer.limit_count}`);
        
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
        
        console.log(`[${req.customerKey}] TTS request - Voice:`, voice?.name);
        
        if (!process.env.GOOGLE_TTS_KEY) {
            console.error('GOOGLE_TTS_KEY not set in environment!');
            return res.status(500).json({ error: 'TTS service not configured' });
        }
        
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
            const errorData = await response.text();
            console.error(`[${req.customerKey}] Google TTS API error:`, response.status, errorData);
            return res.status(500).json({ 
                error: 'Google TTS API error',
                details: errorData
            });
        }
        
        const result = await response.json();
        
        console.log(`[${req.customerKey}] TTS success`);
        
        res.json(result);
        
    } catch (error) {
        console.error(`[${req.customerKey}] TTS error:`, error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== UPLOAD KNOWLEDGE ENDPOINT ====================
app.post('/api/upload-knowledge', checkCustomer, async (req, res) => {
    try {
        const { knowledge, adminPassword } = req.body;
        
        if (!adminPassword) {
            return res.status(401).json({ error: 'Admin password required' });
        }
        
        console.log(`[${req.customerKey}] Knowledge upload request - ${knowledge.length} chars`);
        
        // Save knowledge to database (PERMANENT STORAGE!)
        await pool.query(
            'UPDATE customers SET knowledge = $1, updated_at = CURRENT_TIMESTAMP WHERE customer_key = $2',
            [knowledge, req.customerKey]
        );
        
        console.log(`[${req.customerKey}] ✅ Knowledge saved to database (PERMANENT)`);
        
        res.json({ 
            success: true, 
            message: 'Knowledge uploaded successfully and saved permanently',
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
        const result = await pool.query(
            'SELECT knowledge FROM customers WHERE customer_key = $1',
            [req.customerKey]
        );
        
        const knowledge = result.rows[0]?.knowledge || '';
        
        res.json({ 
            knowledge: knowledge,
            knowledgeLength: knowledge.length
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
        
        if (!req.customer.search_api_key || req.customer.search_api_key.trim() === '') {
            return res.status(400).json({ 
                error: 'Real-time search is not available. Please add a search API key.',
                available: false
            });
        }
        
        console.log(`[${req.customerKey}] Search request: ${query}`);
        
        res.json({
            available: true,
            message: 'Search feature configured',
            query: query
        });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== USAGE STATS ENDPOINT ====================
app.get('/api/stats/:customerKey', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM customers WHERE customer_key = $1',
            [req.params.customerKey]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const customer = result.rows[0];
        
        res.json({
            name: customer.name,
            used: customer.used_count,
            limit: customer.limit_count,
            remaining: customer.limit_count - customer.used_count,
            active: customer.active,
            knowledgeSize: customer.knowledge?.length || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN: ADD CUSTOMER ====================
app.post('/api/admin/add-customer', async (req, res) => {
    try {
        const { adminKey, customerKey, name, allowedDomain, limit } = req.body;
        
        // Simple admin key check (you can change this)
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Invalid admin key' });
        }
        
        await pool.query(`
            INSERT INTO customers (customer_key, name, allowed_domain, limit_count)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (customer_key) DO UPDATE
            SET name = $2, allowed_domain = $3, limit_count = $4
        `, [customerKey, name, allowedDomain, limit]);
        
        console.log(`✅ Customer added/updated: ${customerKey}`);
        
        res.json({ success: true, message: 'Customer added successfully' });
        
    } catch (error) {
        console.error('Add customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM customers');
        const customerCount = result.rows[0].count;
        
        res.json({ 
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            customers: parseInt(customerCount)
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: error.message
        });
    }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Widget API Server running on port ${PORT}`);
    console.log(`📊 Database: PostgreSQL (Railway)`);
    console.log(`✅ Ready to serve requests!`);
});
