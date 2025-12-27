(function() {
    'use strict';
    
    // ==================== CONFIG ====================
    const CONFIG = {
        API_URL: 'https://widget-api.railway.app', // Railway URL'ini buraya yazacaksın
        CUSTOMER_KEY: 'dvdcoin-demo', // Her müşteri için farklı
        theme: '#2c3e50', // Dark gray theme
        language: 'en-US',
        welcomeMessage: 'Hi! How can I help you today?',
        systemPrompt: 'You are a helpful AI assistant. Be friendly and concise (2-3 sentences max).',
        ttsVoice: 'en-US-Chirp3-HD-Achernar',
        ttsSpeakingRate: 1.1,
        ttsVolumeGain: 12.0,
        settingsPassword: 'admin123' // Change this password
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
        
        /* Settings Modal */
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
            overflow: hidden;
        }
        
        .dvd-settings-header {
            background: linear-gradient(135deg, ${CONFIG.theme} 0%, #1a252f 100%);
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dvd-settings-content {
            padding: 20px;
        }
        
        .dvd-password-section,
        .dvd-upload-section {
            margin-bottom: 20px;
        }
        
        .dvd-password-section label,
        .dvd-upload-section label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
        
        .dvd-password-section input {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
        }
        
        .dvd-password-section input:focus {
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
        
        .dvd-upload-section {
            display: none;
        }
        
        .dvd-upload-section.unlocked {
            display: block;
        }
        
        .dvd-change-password-section {
            display: none;
            margin-bottom: 20px;
        }
        
        .dvd-change-password-section.unlocked {
            display: block;
        }
        
        .dvd-change-password-section input {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            margin-bottom: 10px;
        }
        
        .dvd-change-password-section input:focus {
            border-color: ${CONFIG.theme};
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
        
        /* Mobile Responsive */
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
                width: 50px;
                height: 50px;
            }
            
            .dvd-message {
                font-size: 13px;
                max-width: 90%;
            }
            
            .dvd-input {
                font-size: 16px; /* Prevent zoom on iOS */
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
    const HTML = `
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
                    <div class="dvd-message ai">${CONFIG.welcomeMessage}</div>
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
            
            <!-- Settings Modal -->
            <div class="dvd-settings-overlay" id="dvdSettingsOverlay"></div>
            <div class="dvd-settings-modal" id="dvdSettingsModal">
                <div class="dvd-settings-header">
                    <span>⚙️ Settings</span>
                    <button class="dvd-close-btn" id="dvdCloseSettings">✕</button>
                </div>
                <div class="dvd-settings-content">
                    <div class="dvd-password-section" id="dvdPasswordSection">
                        <label>Admin Password:</label>
                        <input type="password" id="dvdPasswordInput" placeholder="Enter password...">
                        <button class="dvd-unlock-btn" id="dvdUnlockBtn">Unlock</button>
                    </div>
                    
                    <div class="dvd-upload-section" id="dvdUploadSection">
                        <label>Upload Company Knowledge:</label>
                        <input type="file" id="dvdFileInput" class="dvd-file-input" accept=".pdf,.txt" multiple>
                        <div class="dvd-upload-btn" id="dvdUploadBtn">
                            📁 Choose Files (PDF, TXT)
                        </div>
                        <div class="dvd-uploaded-files" id="dvdUploadedFiles"></div>
                    </div>
                    
                    <div class="dvd-change-password-section" id="dvdChangePasswordSection">
                        <label>Change Password:</label>
                        <input type="password" id="dvdNewPassword" placeholder="Enter new password...">
                        <input type="password" id="dvdConfirmPassword" placeholder="Confirm new password...">
                        <button class="dvd-unlock-btn" id="dvdChangePasswordBtn">Change Password</button>
                    </div>
                </div>
            </div>
            
            <audio id="dvdTTSAudio" style="display:none;"></audio>
        </div>
    `;
    
    // ==================== STATE ====================
    let chatHistory = [];
    let recognition = null;
    let isListening = false;
    let audioContext = null;
    let audioSource = null;
    let isSpeaking = false;
    
    // ==================== INIT ====================
    function initWidget() {
        // Inject CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = CSS;
        document.head.appendChild(styleElement);
        
        // Inject HTML
        const widgetContainer = document.createElement('div');
        widgetContainer.innerHTML = HTML;
        document.body.appendChild(widgetContainer);
        
        // Setup
        setupEventListeners();
        initChatHistory();
        
        console.log('✅ AI Widget initialized');
    }
    
    // ==================== CHAT HISTORY ====================
    function initChatHistory() {
        chatHistory = [
            { role: 'system', content: CONFIG.systemPrompt }
        ];
        
        // Backend'den knowledge yükle
        loadKnowledgeFromBackend();
    }
    
    // ==================== LOAD KNOWLEDGE FROM BACKEND ====================
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
                    console.log('✅ Loaded knowledge from backend:', data.knowledgeLength, 'characters');
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
        document.getElementById('dvdUnlockBtn').addEventListener('click', unlockSettings);
        document.getElementById('dvdChangePasswordBtn').addEventListener('click', changePassword);
        document.getElementById('dvdUploadBtn').addEventListener('click', () => {
            document.getElementById('dvdFileInput').click();
        });
        document.getElementById('dvdFileInput').addEventListener('change', handleFileUpload);
        
        const input = document.getElementById('dvdInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(false);
        });
        
        const passwordInput = document.getElementById('dvdPasswordInput');
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') unlockSettings();
        });
    }
    
    function openChat() {
        document.getElementById('dvdChatPanel').style.display = 'flex';
        document.getElementById('dvdInput').focus();
    }
    
    function closeChat() {
        document.getElementById('dvdChatPanel').style.display = 'none';
    }
    
    function openSettings() {
        // Reset to password screen every time
        document.getElementById('dvdPasswordSection').style.display = 'block';
        document.getElementById('dvdUploadSection').classList.remove('unlocked');
        document.getElementById('dvdChangePasswordSection').classList.remove('unlocked');
        document.getElementById('dvdPasswordInput').value = '';
        
        document.getElementById('dvdSettingsModal').style.display = 'block';
        document.getElementById('dvdSettingsOverlay').style.display = 'block';
    }
    
    function closeSettings() {
        document.getElementById('dvdSettingsModal').style.display = 'none';
        document.getElementById('dvdSettingsOverlay').style.display = 'none';
    }
    
    function unlockSettings() {
        const password = document.getElementById('dvdPasswordInput').value;
        if (password === CONFIG.settingsPassword) {
            document.getElementById('dvdPasswordSection').style.display = 'none';
            document.getElementById('dvdUploadSection').classList.add('unlocked');
            document.getElementById('dvdChangePasswordSection').classList.add('unlocked');
        } else {
            alert('Incorrect password!');
        }
    }
    
    function changePassword() {
        const newPassword = document.getElementById('dvdNewPassword').value;
        const confirmPassword = document.getElementById('dvdConfirmPassword').value;
        
        if (!newPassword || !confirmPassword) {
            alert('Please fill in both password fields!');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        
        // Update password
        CONFIG.settingsPassword = newPassword;
        
        // Clear fields
        document.getElementById('dvdNewPassword').value = '';
        document.getElementById('dvdConfirmPassword').value = '';
        
        alert('Password changed successfully!');
        console.log('🔒 Password updated');
    }
    
    async function handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const uploadedFilesDiv = document.getElementById('dvdUploadedFiles');
        uploadedFilesDiv.innerHTML = '<div style="color: #666; font-size: 12px;">📤 Uploading...</div>';
        
        let combinedKnowledge = '';
        
        // Read all files
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
        
        // Upload to backend
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/upload-knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-customer-key': CONFIG.CUSTOMER_KEY
                },
                body: JSON.stringify({
                    knowledge: combinedKnowledge,
                    adminPassword: CONFIG.settingsPassword
                })
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            
            // Success!
            window.uploadedKnowledge = combinedKnowledge;
            
            uploadedFilesDiv.innerHTML = `
                <div style="color: #27ae60; font-size: 12px; margin-bottom: 8px;">
                    ✅ Uploaded ${result.knowledgeLength} characters
                </div>
                <div style="color: #666; font-size: 11px;">
                    All visitors will now see this knowledge!
                </div>
            `;
            
            // Show file names
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'dvd-file-item';
                fileItem.innerHTML = `
                    <span>📄 ${file.name}</span>
                    <button class="dvd-remove-file" onclick="window.dvdRemoveAllFiles()">Remove All</button>
                `;
                uploadedFilesDiv.appendChild(fileItem);
            });
            
            console.log('✅ Knowledge uploaded to backend:', result.knowledgeLength, 'characters');
            
        } catch (err) {
            console.error('Upload error:', err);
            uploadedFilesDiv.innerHTML = '<div style="color: #e74c3c; font-size: 12px;">❌ Upload failed. Please try again.</div>';
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
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/upload-knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-customer-key': CONFIG.CUSTOMER_KEY
                },
                body: JSON.stringify({
                    knowledge: '',
                    adminPassword: CONFIG.settingsPassword
                })
            });
            
            if (response.ok) {
                window.uploadedKnowledge = '';
                document.getElementById('dvdUploadedFiles').innerHTML = '<div style="color: #666; font-size: 12px;">✅ Knowledge removed from backend</div>';
                document.getElementById('dvdFileInput').value = '';
                console.log('🗑️ Knowledge cleared from backend');
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
        
        // Add user message
        addMessage('user', message);
        input.value = '';
        
        // Show typing
        showTyping(true);
        
        // Get AI response
        const response = await getAIResponse(message);
        
        // Hide typing
        showTyping(false);
        
        // Add AI message
        addMessage('ai', response);
        
        // Play TTS only if requested (from mic)
        if (useTTS) {
            await playTTS(response);
        }
    }
    
    function addMessage(type, text) {
        const messagesContainer = document.getElementById('dvdMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `dvd-message ${type}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
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
            // Backend otomatik olarak knowledge ekleyecek
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
    
    // ==================== TTS ====================
    async function playTTS(text) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/tts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerKey: CONFIG.CUSTOMER_KEY,
                    input: { text: text },
                    voice: {
                        languageCode: CONFIG.language,
                        name: CONFIG.ttsVoice,
                        ssmlGender: 'FEMALE'
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: CONFIG.ttsSpeakingRate,
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
            
            // Setup audio context
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
            sendMessage(true); // TTS enabled for voice input
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
