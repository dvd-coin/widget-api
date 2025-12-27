(function() {
    'use strict';
    
    // ==================== LANGUAGE CONFIGURATIONS ====================
    const LANGUAGE_CONFIG = {
        'en-US': {
            name: '🇺🇸 English',
            voiceFemale: 'en-US-Neural2-F',
            voiceMale: 'en-US-Neural2-J',
            welcomeMessage: 'Hi! How can I help you today?'
        },
        'tr-TR': {
            name: '🇹🇷 Türkçe',
            voiceFemale: 'tr-TR-Wavenet-E',
            voiceMale: 'tr-TR-Wavenet-B',
            welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?'
        },
        'es-ES': {
            name: '🇪🇸 Español',
            voiceFemale: 'es-ES-Neural2-F',
            voiceMale: 'es-ES-Neural2-B',
            welcomeMessage: '¡Hola! ¿Cómo puedo ayudarte hoy?'
        },
        'fr-FR': {
            name: '🇫🇷 Français',
            voiceFemale: 'fr-FR-Neural2-A',
            voiceMale: 'fr-FR-Neural2-B',
            welcomeMessage: 'Bonjour! Comment puis-je vous aider aujourd\'hui?'
        },
        'de-DE': {
            name: '🇩🇪 Deutsch',
            voiceFemale: 'de-DE-Neural2-F',
            voiceMale: 'de-DE-Neural2-B',
            welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?'
        },
        'pt-BR': {
            name: '🇧🇷 Português',
            voiceFemale: 'pt-BR-Neural2-A',
            voiceMale: 'pt-BR-Neural2-B',
            welcomeMessage: 'Olá! Como posso ajudá-lo hoje?'
        },
        'it-IT': {
            name: '🇮🇹 Italiano',
            voiceFemale: 'it-IT-Neural2-A',
            voiceMale: 'it-IT-Neural2-C',
            welcomeMessage: 'Ciao! Come posso aiutarti oggi?'
        },
        'ja-JP': {
            name: '🇯🇵 日本語',
            voiceFemale: 'ja-JP-Neural2-B',
            voiceMale: 'ja-JP-Neural2-C',
            welcomeMessage: 'こんにちは！今日はどのようにお手伝いできますか？'
        },
        'ko-KR': {
            name: '🇰🇷 한국어',
            voiceFemale: 'ko-KR-Neural2-A',
            voiceMale: 'ko-KR-Neural2-C',
            welcomeMessage: '안녕하세요! 오늘 어떻게 도와드릴까요?'
        },
        'zh-CN': {
            name: '🇨🇳 中文',
            voiceFemale: 'zh-CN-XiaoxiaoNeural',
            voiceMale: 'zh-CN-YunxiNeural',
            welcomeMessage: '你好！今天我能帮你什么？'
        }
    };
    
    // ==================== AUTO DETECT LANGUAGE ====================
    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en-US';
        
        // Direct match
        if (LANGUAGE_CONFIG[browserLang]) {
            return browserLang;
        }
        
        // Match language prefix (e.g., "en" from "en-GB")
        const langPrefix = browserLang.split('-')[0];
        for (const lang in LANGUAGE_CONFIG) {
            if (lang.startsWith(langPrefix)) {
                return lang;
            }
        }
        
        // Default to English
        return 'en-US';
    }
    
    // ==================== CONFIG ====================
    const CONFIG = {
        API_URL: 'https://widget-api-production-10ee.up.railway.app',
        CUSTOMER_KEY: 'dvdcoin-demo',
        theme: '#2c3e50',
        
        // Auto-detect language on first load
        language: detectLanguage(),
        
        // AI Personality Settings
        aiPersonality: 'marketer',
        customPersonality: '',
        
        // Voice Settings
        voiceGender: 'female',
        ttsSpeakingRate: 1.05, // Natural conversation speed
        ttsVolumeGain: 10.0, // Slightly lower for natural sound
        
        // Upload Authentication
        uploadUsername: 'admin',
        uploadPassword: 'admin123'
    };
    
    // Get language-specific settings
    function getLanguageSettings() {
        return LANGUAGE_CONFIG[CONFIG.language] || LANGUAGE_CONFIG['en-US'];
    }

    // AI Personalities
    const PERSONALITIES = {
        marketer: 'You are an enthusiastic marketing consultant. Be persuasive, ask engaging questions, create excitement, and encourage action. Keep responses to 3-4 sentences. IMPORTANT: Always respond in the EXACT SAME LANGUAGE that the user writes in. If user writes in Turkish, respond completely in Turkish. If user writes in English, respond completely in English. CRITICAL: DO NOT USE EMOJIS OR SYMBOLS (!, ?, etc.) excessively. Write naturally like a professional person speaking - use periods and occasional question marks, but avoid !!! or multiple symbols. Your responses will be spoken aloud, so write conversationally.',
        educator: 'You are a patient educator. Explain step-by-step, use examples, ask questions to check understanding, and encourage learning. Keep responses clear and supportive (3-4 sentences). IMPORTANT: Always respond in the EXACT SAME LANGUAGE that the user writes in. If user writes in Turkish, respond completely in Turkish. If user writes in English, respond completely in English. CRITICAL: DO NOT USE EMOJIS OR SYMBOLS excessively. Write naturally like a teacher speaking - clear, calm, professional. Your responses will be spoken aloud.',
        support: 'You are a friendly customer support specialist. Be empathetic, solution-focused, and reassuring. Acknowledge concerns and provide clear help. Keep responses helpful and concise (3-4 sentences). IMPORTANT: Always respond in the EXACT SAME LANGUAGE that the user writes in. If user writes in Turkish, respond completely in Turkish. If user writes in English, respond completely in English. CRITICAL: DO NOT USE EMOJIS OR SYMBOLS. Write naturally like a professional call center agent - warm, helpful, human. Your responses will be spoken aloud.',
        technical: 'You are a technical expert. Provide precise, accurate information with technical details when needed. Be direct and professional. Keep responses informative and concise (3-4 sentences). IMPORTANT: Always respond in the EXACT SAME LANGUAGE that the user writes in. If user writes in Turkish, respond completely in Turkish. If user writes in English, respond completely in English. CRITICAL: DO NOT USE EMOJIS OR SYMBOLS. Write naturally like a professional expert speaking - clear, precise, human. Your responses will be spoken aloud.',
        custom: ''
    };
    
    // ==================== CSS ====================
    const CSS = `
        .dvd-widget-btn {
            position: fixed;
            right: 20px;
            bottom: 100px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            z-index: 999998;
            transition: all 0.3s;
        }
        
        .dvd-widget-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(44,62,80,0.6);
        }
        
        .dvd-chat-panel {
            display: none;
            position: fixed;
            right: 20px;
            bottom: 100px;
            width: 90%;
            max-width: 380px;
            height: 90vh;
            max-height: 600px;
            background: #2c3e50;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
        }
        
        .dvd-chat-header {
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
        }
        
        .dvd-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .dvd-header-title {
            font-weight: 600;
            font-size: 16px;
        }
        
        .dvd-header-status {
            font-size: 11px;
            opacity: 0.9;
        }
        
        .dvd-header-right {
            display: flex;
            gap: 8px;
        }
        
        .dvd-settings-btn,
        .dvd-close-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .dvd-settings-btn:hover,
        .dvd-close-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }
        
        .dvd-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #34495e;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .dvd-message {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 16px;
            line-height: 1.4;
            font-size: 14px;
            word-wrap: break-word;
            animation: dvd-message-in 0.3s ease-out;
        }
        
        @keyframes dvd-message-in {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .dvd-message.user {
            align-self: flex-end;
            background: ${CONFIG.theme};
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .dvd-message.ai {
            align-self: flex-start;
            background: #ecf0f1;
            color: #2c3e50;
            border: 1px solid #bdc3c7;
            border-bottom-left-radius: 4px;
        }
        
        .dvd-typing {
            align-self: flex-start;
            padding: 10px 14px;
            background: #ecf0f1;
            border-radius: 16px;
            border-bottom-left-radius: 4px;
            display: none;
            border: 1px solid #bdc3c7;
        }
        
        .dvd-typing.show {
            display: flex;
            gap: 4px;
            animation: dvd-message-in 0.3s ease-out;
        }
        
        .dvd-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${CONFIG.theme};
            animation: dvd-typing-bounce 1.4s infinite;
        }
        
        .dvd-typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .dvd-typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes dvd-typing-bounce {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-8px);
            }
        }
        
        .dvd-input-area {
            padding: 12px;
            background: #2c3e50;
            border-top: 1px solid #1a252f;
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        .dvd-mic-btn {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        
        .dvd-mic-btn:hover {
            transform: scale(1.1);
        }
        
        .dvd-mic-btn.listening {
            background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
            animation: dvd-mic-pulse 1s ease-in-out infinite;
        }
        
        @keyframes dvd-mic-pulse {
            0%, 100% {
                box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
            }
            50% {
                box-shadow: 0 0 0 10px rgba(39, 174, 96, 0);
            }
        }
        
        .dvd-input {
            flex: 1;
            padding: 10px 14px;
            border: 2px solid #1a252f;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            font-family: inherit;
            background: #34495e;
            color: white;
        }
        
        .dvd-input::placeholder {
            color: #95a5a6;
        }
        
        .dvd-input:focus {
            border-color: #ecf0f1;
        }
        
        .dvd-send-btn {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        
        .dvd-send-btn:hover {
            transform: scale(1.1);
        }
        
        .dvd-send-btn:active {
            transform: scale(0.95);
        }
        
        .dvd-settings-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000000;
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .dvd-settings-header {
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .dvd-settings-content {
            padding: 20px;
        }
        
        .dvd-section {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .dvd-section:last-child {
            border-bottom: none;
        }
        
        .dvd-section label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
        
        .dvd-section input {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            margin-bottom: 10px;
        }
        
        .dvd-section input:focus {
            border-color: ${CONFIG.theme};
        }
        
        .dvd-unlock-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .dvd-unlock-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .dvd-file-input {
            display: none;
        }
        
        .dvd-upload-btn {
            width: 100%;
            padding: 12px;
            background: #f8f9fa;
            border: 2px dashed #ccc;
            border-radius: 8px;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s;
            font-size: 14px;
            color: #666;
        }
        
        .dvd-upload-btn:hover {
            border-color: ${CONFIG.theme};
            background: #f0f0f0;
        }
        
        .dvd-uploaded-files {
            margin-top: 12px;
            font-size: 13px;
            color: #666;
        }
        
        .dvd-file-item {
            padding: 8px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dvd-remove-file {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .dvd-select {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            background: white;
            cursor: pointer;
        }
        
        .dvd-select:focus {
            border-color: ${CONFIG.theme};
        }
        
        .dvd-custom-input {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
            resize: vertical;
            min-height: 80px;
            margin-top: 10px;
        }
        
        .dvd-custom-input:focus {
            border-color: ${CONFIG.theme};
        }
        
        .dvd-settings-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999999;
        }
        
        @media (max-width: 768px) {
            .dvd-chat-panel {
                width: calc(100% - 20px);
                height: calc(100% - 120px);
                max-width: none;
                max-height: none;
                right: 10px;
                bottom: 10px;
                border-radius: 12px;
            }
            
            .dvd-widget-btn {
                right: 10px;
                bottom: 80px;
            }
            
            .dvd-message {
                font-size: 13px;
                max-width: 90%;
            }
            
            .dvd-input {
                font-size: 16px;
            }
            
            .dvd-settings-modal {
                width: calc(100% - 40px);
            }
        }
        
        @media (max-width: 480px) {
            .dvd-header-title {
                font-size: 14px;
            }
            
            .dvd-header-status {
                font-size: 10px;
            }
            
            .dvd-mic-btn,
            .dvd-send-btn {
                width: 36px;
                height: 36px;
                font-size: 16px;
            }
            
            .dvd-input {
                font-size: 16px;
                padding: 8px 12px;
            }
        }
    `;
    
    // ==================== HTML ====================
    function generateHTML() {
        const langSettings = getLanguageSettings();
        
        // Generate language options
        let languageOptions = '';
        for (const lang in LANGUAGE_CONFIG) {
            const selected = lang === CONFIG.language ? 'selected' : '';
            languageOptions += `<option value="${lang}" ${selected}>${LANGUAGE_CONFIG[lang].name}</option>`;
        }
        
        return `
        <div id="dvd-widget-root">
            <button class="dvd-widget-btn" id="dvdWidgetBtn" aria-label="Open chat">
                💬
            </button>
            
            <div class="dvd-chat-panel" id="dvdChatPanel">
                <div class="dvd-chat-header">
                    <div class="dvd-header-left">
                        <div>
                            <div class="dvd-header-title">AI Assistant</div>
                            <div class="dvd-header-status" id="dvdStatus">Online</div>
                        </div>
                    </div>
                    <div class="dvd-header-right">
                        <button class="dvd-settings-btn" id="dvdSettingsBtn" aria-label="Settings">
                            ⚙️
                        </button>
                        <button class="dvd-close-btn" id="dvdCloseBtn" aria-label="Close chat">
                            ✕
                        </button>
                    </div>
                </div>
                
                <div class="dvd-messages" id="dvdMessages">
                    <div class="dvd-message ai">${langSettings.welcomeMessage}</div>
                </div>
                
                <div class="dvd-typing" id="dvdTyping">
                    <div class="dvd-typing-dot"></div>
                    <div class="dvd-typing-dot"></div>
                    <div class="dvd-typing-dot"></div>
                </div>
                
                <div class="dvd-input-area">
                    <button class="dvd-mic-btn" id="dvdMicBtn" aria-label="Voice input">
                        🎤
                    </button>
                    <input 
                        type="text" 
                        class="dvd-input" 
                        id="dvdInput" 
                        placeholder="Type your message..."
                        autocomplete="off"
                    >
                    <button class="dvd-send-btn" id="dvdSendBtn" aria-label="Send message">
                        ➤
                    </button>
                </div>
            </div>
            
            <div class="dvd-settings-overlay" id="dvdSettingsOverlay"></div>
            <div class="dvd-settings-modal" id="dvdSettingsModal">
                <div class="dvd-settings-header">
                    <span>⚙️ Settings</span>
                    <button class="dvd-close-btn" id="dvdCloseSettings">✕</button>
                </div>
                <div class="dvd-settings-content">
                    
                    <div class="dvd-section">
                        <label>🌍 Language (Auto-detected):</label>
                        <select id="dvdLanguageSelect" class="dvd-select">
                            ${languageOptions}
                        </select>
                        <div style="font-size: 11px; color: #666; margin-top: 6px;">
                            Voice & text will update automatically
                        </div>
                    </div>
                    
                    <div class="dvd-section">
                        <label>🔊 Voice Gender:</label>
                        <select id="dvdVoiceGender" class="dvd-select">
                            <option value="female">👩 Female</option>
                            <option value="male">👨 Male</option>
                        </select>
                    </div>
                    
                    <div class="dvd-section">
                        <label>🤖 AI Character:</label>
                        <select id="dvdPersonalitySelect" class="dvd-select">
                            <option value="marketer">💼 Marketing Expert</option>
                            <option value="educator">👨‍🏫 Patient Educator</option>
                            <option value="support">🤝 Support Specialist</option>
                            <option value="technical">💻 Technical Expert</option>
                            <option value="custom">✏️ Custom Character</option>
                        </select>
                        
                        <textarea 
                            id="dvdCustomPersonality" 
                            class="dvd-custom-input" 
                            placeholder="Describe how AI should behave"
                            style="display: none;"
                        ></textarea>
                        
                        <button class="dvd-unlock-btn" id="dvdSaveSettingsBtn" style="margin-top: 10px;">Save Settings</button>
                    </div>
                    
                    <div class="dvd-section">
                        <label>📁 Upload Company Knowledge:</label>
                        <input type="file" id="dvdFileInput" class="dvd-file-input" accept=".pdf,.txt" multiple>
                        <div class="dvd-upload-btn" id="dvdUploadBtn">
                            📁 Choose Files (PDF, TXT)
                        </div>
                        <div class="dvd-uploaded-files" id="dvdUploadedFiles"></div>
                        <div style="font-size: 11px; color: #666; margin-top: 6px;">
                            Protected by password
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <audio id="dvdTTSAudio" style="display:none;"></audio>
        </div>
    `;
    }
    
    // ==================== STATE ====================
    let chatHistory = [];
    let recognition = null;
    let isListening = false;
    let audioContext = null;
    let audioSource = null;
    let isSpeaking = false;
    
    // ==================== INIT ====================
    function initWidget() {
        console.log('🌍 Auto-detected language:', CONFIG.language);
        
        // Inject CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = CSS;
        document.head.appendChild(styleElement);
        
        // Inject HTML
        const widgetContainer = document.createElement('div');
        widgetContainer.innerHTML = generateHTML();
        document.body.appendChild(widgetContainer);
        
        // Setup
        setupEventListeners();
        initChatHistory();
        
        console.log('✅ AI Widget initialized');
    }
    
    // ==================== CHAT HISTORY ====================
    function initChatHistory() {
        let systemPrompt = PERSONALITIES[CONFIG.aiPersonality];
        if (CONFIG.aiPersonality === 'custom' && CONFIG.customPersonality) {
            systemPrompt = CONFIG.customPersonality;
        }
        
        chatHistory = [
            { role: 'system', content: systemPrompt }
        ];
        
        loadKnowledgeFromBackend();
    }
    
    // ==================== LOAD KNOWLEDGE ====================
    async function loadKnowledgeFromBackend() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/get-knowledge`, {
                method: 'GET',
                headers: {
                    'x-customer-key': CONFIG.CUSTOMER_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.knowledge && data.knowledge.trim()) {
                    window.uploadedKnowledge = data.knowledge;
                    console.log('✅ Loaded knowledge:', data.knowledgeLength, 'chars');
                }
            }
        } catch (error) {
            console.error('Failed to load knowledge:', error);
        }
    }
    
    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        document.getElementById('dvdWidgetBtn').addEventListener('click', openChat);
        document.getElementById('dvdCloseBtn').addEventListener('click', closeChat);
        document.getElementById('dvdSendBtn').addEventListener('click', () => sendMessage(false));
        document.getElementById('dvdMicBtn').addEventListener('click', toggleMic);
        document.getElementById('dvdSettingsBtn').addEventListener('click', openSettings);
        document.getElementById('dvdCloseSettings').addEventListener('click', closeSettings);
        document.getElementById('dvdSettingsOverlay').addEventListener('click', closeSettings);
        document.getElementById('dvdUploadBtn').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show popup for credentials
            const username = prompt('Enter username:');
            if (!username) {
                console.log('Upload cancelled - no username');
                return;
            }
            
            const password = prompt('Enter password:');
            if (!password) {
                console.log('Upload cancelled - no password');
                return;
            }
            
            // Check credentials
            if (username !== CONFIG.uploadUsername || password !== CONFIG.uploadPassword) {
                alert('Incorrect username or password!');
                console.log('Upload failed - wrong credentials');
                return;
            }
            
            console.log('Credentials correct - opening file picker');
            
            // Store password temporarily for upload
            window._tempUploadPassword = password;
            
            // Open file picker
            setTimeout(() => {
                document.getElementById('dvdFileInput').click();
            }, 100);
        });
        document.getElementById('dvdFileInput').addEventListener('change', handleFileUpload);
        
        // Language change
        document.getElementById('dvdLanguageSelect').addEventListener('change', function() {
            CONFIG.language = this.value;
            console.log('Language changed to:', this.value);
            updateWelcomeMessage();
            
            // Reinitialize speech recognition with new language
            if (recognition) {
                recognition.lang = CONFIG.language;
                console.log('🎤 Speech recognition language updated to:', CONFIG.language);
            }
        });
        
        // Voice gender change
        document.getElementById('dvdVoiceGender').addEventListener('change', function() {
            CONFIG.voiceGender = this.value;
        });
        
        // Personality change
        document.getElementById('dvdPersonalitySelect').addEventListener('change', function() {
            CONFIG.aiPersonality = this.value;
            const customInput = document.getElementById('dvdCustomPersonality');
            if (this.value === 'custom') {
                customInput.style.display = 'block';
            } else {
                customInput.style.display = 'none';
            }
        });
        
        // Save settings
        document.getElementById('dvdSaveSettingsBtn').addEventListener('click', function() {
            if (CONFIG.aiPersonality === 'custom') {
                const customText = document.getElementById('dvdCustomPersonality').value.trim();
                if (!customText) {
                    alert('Please describe your custom AI character!');
                    return;
                }
                CONFIG.customPersonality = customText;
            }
            
            initChatHistory();
            alert('Settings saved! Chat restarted with new settings.');
        });
        
        const input = document.getElementById('dvdInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(false);
        });
    }
    
    function updateWelcomeMessage() {
        const langSettings = getLanguageSettings();
        const welcomeMsg = document.querySelector('.dvd-message.ai');
        if (welcomeMsg) {
            welcomeMsg.textContent = langSettings.welcomeMessage;
        }
    }
    
    function openChat() {
        document.getElementById('dvdChatPanel').style.display = 'flex';
        document.getElementById('dvdInput').focus();
    }
    
    function closeChat() {
        document.getElementById('dvdChatPanel').style.display = 'none';
        
        // Stop any playing TTS audio
        stopTTS();
    }
    
    // Stop TTS playback
    function stopTTS() {
        const audio = document.getElementById('dvdTTSAudio');
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
        isSpeaking = false;
        updateStatus('Online');
    }
    
    function openSettings() {
        document.getElementById('dvdLanguageSelect').value = CONFIG.language;
        document.getElementById('dvdVoiceGender').value = CONFIG.voiceGender;
        document.getElementById('dvdPersonalitySelect').value = CONFIG.aiPersonality;
        
        if (CONFIG.aiPersonality === 'custom') {
            document.getElementById('dvdCustomPersonality').style.display = 'block';
            document.getElementById('dvdCustomPersonality').value = CONFIG.customPersonality;
        }
        
        document.getElementById('dvdSettingsModal').style.display = 'block';
        document.getElementById('dvdSettingsOverlay').style.display = 'block';
    }
    
    function closeSettings() {
        document.getElementById('dvdSettingsModal').style.display = 'none';
        document.getElementById('dvdSettingsOverlay').style.display = 'none';
    }
    
    async function handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Get password from temporary storage
        const password = window._tempUploadPassword;
        if (!password) {
            alert('Authentication error. Please try again.');
            return;
        }
        
        const uploadedFilesDiv = document.getElementById('dvdUploadedFiles');
        uploadedFilesDiv.innerHTML = '<div style="color: #666; font-size: 12px;">📤 Uploading...</div>';
        
        let combinedKnowledge = '';
        
        for (const file of files) {
            try {
                const text = await readFile(file);
                combinedKnowledge += `\n\n--- ${file.name} ---\n${text}`;
            } catch (err) {
                console.error('File read error:', err);
                uploadedFilesDiv.innerHTML = '<div style="color: #e74c3c; font-size: 12px;">❌ Error reading file</div>';
                return;
            }
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/upload-knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-customer-key': CONFIG.CUSTOMER_KEY
                },
                body: JSON.stringify({
                    knowledge: combinedKnowledge,
                    adminPassword: password
                })
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            window.uploadedKnowledge = combinedKnowledge;
            
            uploadedFilesDiv.innerHTML = `
                <div style="color: #27ae60; font-size: 12px; margin-bottom: 8px;">
                    ✅ Uploaded ${result.knowledgeLength} characters
                </div>
                <div style="color: #666; font-size: 11px;">
                    All visitors will now see this knowledge!
                </div>
            `;
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'dvd-file-item';
                fileItem.innerHTML = `
                    <span>📄 ${file.name}</span>
                    <button class="dvd-remove-file" onclick="window.dvdRemoveAllFiles()">Remove All</button>
                `;
                uploadedFilesDiv.appendChild(fileItem);
            });
            
            // Clear temporary password
            delete window._tempUploadPassword;
            
            console.log('✅ Knowledge uploaded:', result.knowledgeLength, 'chars');
            
        } catch (err) {
            console.error('Upload error:', err);
            uploadedFilesDiv.innerHTML = '<div style="color: #e74c3c; font-size: 12px;">❌ Upload failed</div>';
        }
    }
    
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    window.dvdRemoveAllFiles = async function() {
        const password = prompt('Enter password to remove knowledge:');
        
        if (!password) return;
        
        if (password !== CONFIG.uploadPassword) {
            alert('Incorrect password!');
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/upload-knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-customer-key': CONFIG.CUSTOMER_KEY
                },
                body: JSON.stringify({
                    knowledge: '',
                    adminPassword: password
                })
            });
            
            if (response.ok) {
                window.uploadedKnowledge = '';
                document.getElementById('dvdUploadedFiles').innerHTML = '<div style="color: #666; font-size: 12px;">✅ Knowledge removed</div>';
                document.getElementById('dvdFileInput').value = '';
                console.log('🗑️ Knowledge cleared');
            }
        } catch (error) {
            console.error('Remove error:', error);
            alert('Failed to remove knowledge');
        }
    };
    
    // ==================== SEND MESSAGE ====================
    async function sendMessage(useTTS = false) {
        const input = document.getElementById('dvdInput');
        const message = input.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        input.value = '';
        
        showTyping(true);
        
        const response = await getAIResponse(message);
        
        showTyping(false);
        
        addMessage('ai', response);
        
        if (useTTS) {
            playTTS(response);
        }
    }
    
    function addMessage(type, text) {
        const messagesContainer = document.getElementById('dvdMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `dvd-message ${type}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function showTyping(show) {
        const typing = document.getElementById('dvdTyping');
        if (show) {
            typing.classList.add('show');
        } else {
            typing.classList.remove('show');
        }
    }
    
    // ==================== AI API ====================
    async function getAIResponse(userMessage) {
        chatHistory.push({ role: 'user', content: userMessage });
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerKey: CONFIG.CUSTOMER_KEY,
                    messages: chatHistory
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API error');
            }
            
            const data = await response.json();
            const aiMessage = data.choices[0].message.content.trim();
            chatHistory.push({ role: 'assistant', content: aiMessage });
            
            return aiMessage;
        } catch (error) {
            console.error('AI Error:', error);
            return "I'm having connection issues. Please try again!";
        }
    }
    
    // ==================== CLEAN TEXT FOR TTS ====================
    function cleanTextForTTS(text) {
        // Remove emojis
        text = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
        
        // Remove extra symbols and markdown
        text = text.replace(/[*_~`#]/g, '');
        
        // Remove excessive punctuation (keep single ! and ?)
        text = text.replace(/!{2,}/g, '!');
        text = text.replace(/\?{2,}/g, '?');
        text = text.replace(/\.{2,}/g, '.');
        
        // Remove URLs
        text = text.replace(/https?:\/\/[^\s]+/g, '');
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    // ==================== CREATE SSML FOR NATURAL SPEECH ====================
    function createNaturalSSML(text) {
        // Clean text first
        text = cleanTextForTTS(text);
        
        // Split into sentences for natural pauses
        const sentences = text.split(/([.!?]+)/g).filter(s => s.trim());
        
        let ssml = '<speak>';
        
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (!sentence) continue;
            
            // Skip pure punctuation
            if (/^[.!?]+$/.test(sentence)) continue;
            
            // Add prosody for natural human-like speech
            // Slightly varied pitch and rate for each sentence
            const pitchVariations = ['+0.5st', '+0st', '-0.5st', '+1st', '-1st'];
            const pitch = pitchVariations[i % pitchVariations.length];
            
            // Add emphasis on important words (questions, exclamations)
            if (sentence.includes('?')) {
                ssml += `<prosody pitch="${pitch}" rate="0.95">${sentence}</prosody>`;
            } else if (sentence.includes('!')) {
                ssml += `<prosody pitch="+1st" rate="1.0"><emphasis level="moderate">${sentence}</emphasis></prosody>`;
            } else {
                ssml += `<prosody pitch="${pitch}" rate="1.0">${sentence}</prosody>`;
            }
            
            // Add natural pause between sentences
            if (i < sentences.length - 1) {
                ssml += '<break time="400ms"/>';
            }
        }
        
        ssml += '</speak>';
        
        return ssml;
    }
    
    // ==================== TTS ====================
    async function playTTS(text) {
        try {
            const langSettings = getLanguageSettings();
            const selectedVoice = CONFIG.voiceGender === 'male' ? langSettings.voiceMale : langSettings.voiceFemale;
            const selectedGender = CONFIG.voiceGender === 'male' ? 'MALE' : 'FEMALE';
            
            // Create natural SSML
            const ssml = createNaturalSSML(text);
            
            console.log('🎤 TTS SSML:', ssml);
            
            const response = await fetch(`${CONFIG.API_URL}/api/tts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerKey: CONFIG.CUSTOMER_KEY,
                    input: { ssml: ssml }, // ← SSML instead of text
                    voice: {
                        languageCode: CONFIG.language,
                        name: selectedVoice,
                        ssmlGender: selectedGender
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        pitch: 0, // Natural pitch
                        speakingRate: 1.05, // Slightly faster for natural conversation
                        volumeGainDb: CONFIG.ttsVolumeGain
                    }
                })
            });
            
            if (!response.ok) {
                console.error('TTS API Error:', response.status);
                return;
            }
            
            const data = await response.json();
            const audioBytes = atob(data.audioContent || '');
            const arr = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                arr[i] = audioBytes.charCodeAt(i);
            }
            
            const blob = new Blob([arr], { type: 'audio/mp3' });
            const audio = document.getElementById('dvdTTSAudio');
            audio.src = URL.createObjectURL(blob);
            
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            if (!audioSource) {
                audioSource = audioContext.createMediaElementSource(audio);
                audioSource.connect(audioContext.destination);
            }
            
            isSpeaking = true;
            updateStatus('Speaking...');
            
            audio.onended = () => {
                isSpeaking = false;
                updateStatus('Online');
            };
            
            await audio.play();
            
        } catch (error) {
            console.error('TTS Error:', error);
            isSpeaking = false;
            updateStatus('Online');
        }
    }
    
    function updateStatus(status) {
        const statusElement = document.getElementById('dvdStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    // ==================== SPEECH RECOGNITION ====================
    function toggleMic() {
        if (!recognition) {
            initSpeechRecognition();
        }
        
        if (!recognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
    
    function initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('⚠️ Speech recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = CONFIG.language;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('🎤 Heard:', transcript);
            document.getElementById('dvdInput').value = transcript;
            stopListening();
            sendMessage(true);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            stopListening();
        };
        
        recognition.onend = () => {
            stopListening();
        };
    }
    
    function startListening() {
        const micBtn = document.getElementById('dvdMicBtn');
        const input = document.getElementById('dvdInput');
        
        // Stop any playing TTS before listening
        stopTTS();
        
        isListening = true;
        micBtn.classList.add('listening');
        input.placeholder = '🎤 Listening...';
        updateStatus('Listening...');
        
        try {
            recognition.start();
            console.log('🎤 Started listening');
        } catch (err) {
            console.error('Recognition error:', err);
            stopListening();
        }
    }
    
    function stopListening() {
        const micBtn = document.getElementById('dvdMicBtn');
        const input = document.getElementById('dvdInput');
        
        isListening = false;
        micBtn.classList.remove('listening');
        input.placeholder = 'Type your message...';
        updateStatus('Online');
        
        if (recognition) {
            try {
                recognition.stop();
            } catch (err) {
                // Already stopped
            }
        }
    }
    
    
    // ==================== AUTO-INIT ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
    
})();
