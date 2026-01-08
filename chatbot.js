// POKHARA Restaurant Chatbot with Google Gemini AI
// All-in-one chatbot implementation

// ==================== Configuration ====================
const CONFIG = {
    // Use Cloudflare Worker endpoint instead of direct API call
    workerUrl: 'https://your-worker.your-subdomain.workers.dev', // Replace with your Cloudflare Worker URL
    // For local testing without worker, use direct API
    geminiApiKey: 'AIzaSyCm4Kb_CqAPmLKcWP9O0em1dwrGooGcN7A',
    geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent',
    useCloudflareWorker: false, // Set to true when using Cloudflare Worker
    restaurantName: 'POKHARA',
    restaurantPhone: '+44-103-WHATSAPP',
    restaurantAddress: 'Bridgend, UK',
    googleMapsUrl: 'https://maps.google.com/?q=Pokhara+Restaurant+Bridgend',
    openingHours: 'Monday-Sunday: 5:00 PM - 11:00 PM'
};

// ==================== Restaurant Knowledge Base ====================
const KNOWLEDGE_BASE = {
    menu: {
        nepaleseStarters: [
            { name: "Momo (Chicken/Veg)", price: "£6.95", desc: "Traditional Nepalese steamed dumplings served with tomato chutney." },
            { name: "Onion Bhaji (V)", price: "£5.00", desc: "Crispy onion fritters with aromatic spices and gram flour." },
            { name: "Samosa (Veg/Meat)", price: "£4.50", desc: "Spiced pastry filled with your choice of vegetables or minced meat." },
            { name: "Chicken Tikka Starter", price: "£5.95", desc: "Boneless chicken marinated in yogurt and spices, grilled in tandoor." }
        ],
        tandoori: [
            { name: "Tandoori Chicken (Half)", price: "£9.95", desc: "Chicken on the bone marinated in spiced yogurt and grilled." },
            { name: "Seekh Kebab", price: "£10.00", desc: "Minced lamb with herbs and spices, skewered and grilled." },
            { name: "Lamb Chops (4pcs)", price: "£12.95", desc: "Tender lamb chops marinated in ginger, garlic, and hot spices." }
        ],
        mainCourses: [
            { name: "Pokhara Special Thali", price: "£15.95", desc: "A complete meal with dal, bhat, vegetable curry, meat curry, and pickles." },
            { name: "Chicken Tikka Masala", price: "£9.95", desc: "The nation's favorite: tender chicken in a creamy tomato sauce." },
            { name: "Lamb Rogan Josh", price: "£11.95", desc: "Aromatic lamb curry cooked with traditional Kashmiri spices." },
            { name: "King Prawn Jalfrezi", price: "£13.95", desc: "Spicy and tangy king prawn curry with peppers and onions." }
        ],
        burgers: [
            { name: "Veggie Supreme Burger and Chips", price: "£10.00", desc: "A golden-fried veggie patty stacked with fresh vegetables." },
            { name: "6oz Steakhouse Cheeseburger and Chips", price: "£14.00", desc: "Juicy beef steak patty grilled with cheddar and onions." }
        ],
        sides: [
            { name: "Pilau Rice", price: "£4.00", desc: "Fragrant basmati rice cooked with mild spices." },
            { name: "Garlic Naan", price: "£4.00", desc: "Freshly baked bread topped with garlic and coriander." }
        ]
    },
    hours: 'Monday-Sunday: 5:00 PM - 11:00 PM',
    location: 'Court Colman Manor, Pen-y-fai, Bridgend CF31 4NG',
    phone: '+44-103-WHATSAPP',
    services: ['Dine-in', 'Takeaway', 'Table Booking', 'Catering'],
    specialties: ['Authentic Nepalese Cuisine', 'Indian Dishes', 'Tandoori Specialties']
};

// ==================== Food Images Database ====================
const FOOD_IMAGES = {
    breakfast: [
        'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400'
    ],
    brunch: [
        'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400',
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400'
    ],
    lunch: [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    ],
    coffee: [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'
    ],
    curry: [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400'
    ],
    momo: [
        'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400'
    ],
    biryani: [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400'
    ]
};

// ==================== Chatbot State Management ====================
class ChatbotState {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        this.leadCaptured = false;
        this.userInfo = { name: null, contact: null };
        this.messageCount = 0;
    }

    addMessage(role, content, type = 'text', metadata = null) {
        const message = {
            role,
            content,
            type,
            metadata,
            timestamp: new Date()
        };
        this.messages.push(message);
        this.messageCount++;
        return message;
    }

    shouldCaptureLead() {
        return !this.leadCaptured && this.messageCount >= 3;
    }

    reset() {
        this.messages = [];
        this.conversationHistory = [];
        this.messageCount = 0;
        // Keep lead info
    }
}

const chatbotState = new ChatbotState();

// ==================== UI Helper Functions ====================
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return "Good morning! 🌅 Looking for a delicious breakfast to start your day?";
    } else if (hour < 17) {
        return "Good afternoon! ☕ How about a tasty lunch or coffee?";
    } else {
        return "Good evening! 🍽️ Welcome to POKHARA! How can I help you today?";
    }
}

function formatTimestamp(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ==================== Chatbot UI Creation ====================
function createChatbotUI() {
    const chatbotHTML = `
        <!-- Chatbot Button -->
        <div id="chatbot-button" class="chatbot-button">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span class="chatbot-badge">1</span>
        </div>

        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window">
            <!-- Header -->
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <h3>POKHARA Assistant</h3>
                    <span class="chatbot-status">
                        <span class="status-dot"></span> Online
                    </span>
                </div>
                <div class="chatbot-header-actions">
                    <button id="clear-chat-btn" class="header-btn" title="Clear Chat">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                    <button id="close-chatbot-btn" class="header-btn" title="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Messages Container -->
            <div id="chatbot-messages" class="chatbot-messages"></div>

            <!-- Suggestions -->
            <div id="chatbot-suggestions" class="chatbot-suggestions"></div>

            <!-- Input Area -->
            <div class="chatbot-input-container">
                <input 
                    type="text" 
                    id="chatbot-input" 
                    placeholder="Type your message..." 
                    autocomplete="off"
                />
                <button id="send-btn" class="send-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

// ==================== Message Rendering ====================
function renderMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.role}-message`;

    let content = '';

    if (message.type === 'text') {
        let formattedContent = message.content;

        // Remove markdown formatting (stars, hashes)
        formattedContent = formattedContent.replace(/\*\*\*/g, ''); // Remove ***
        formattedContent = formattedContent.replace(/\*\*/g, ''); // Remove **
        formattedContent = formattedContent.replace(/^\*\s/gm, '- '); // Replace * bullet with -
        formattedContent = formattedContent.replace(/^###\s*/gm, ''); // Remove ###
        formattedContent = formattedContent.replace(/^##\s*/gm, ''); // Remove ##
        formattedContent = formattedContent.replace(/^#\s*/gm, ''); // Remove #
        formattedContent = formattedContent.replace(/^---+$/gm, ''); // Remove horizontal rules

        // Auto-format categories (Lines ending with colon)
        formattedContent = formattedContent.replace(/^([A-Z][a-z]+(\s[A-Z][a-z]+)*:)/gm, '<span class="chat-menu-category">$1</span>');

        // Auto-format menu items: [NAME] - [PRICE]\n[DESC]
        // This regex looks for "Item Name - £Price" and the following line as the description
        formattedContent = formattedContent.replace(/^(.+)\s-\s(£[\d\.]+)\s*$/gm, '<div class="chat-menu-item"><div class="chat-menu-item-header"><span>$1</span><span class="chat-menu-price">$2</span></div>');

        // If we are inside a chat-menu-item, the next line should be wrapped in chat-menu-desc
        // We'll use a slightly different approach for the description since it's on the next line
        const lines = formattedContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('chat-menu-item-header') && i + 1 < lines.length && !lines[i + 1].includes('chat-menu')) {
                lines[i + 1] = `<span class="chat-menu-desc">${lines[i + 1]}</span></div>`;
            }
        }
        formattedContent = lines.join('\n');

        content = `
            <div class="message-bubble">
                <p>${formattedContent}</p>
                <span class="message-time">${formatTimestamp(message.timestamp)}</span>
            </div>
        `;
    }
    else if (message.type === 'images') {
        const images = message.metadata.images.map(img =>
            `<img src="${img}" alt="Food" class="chat-image" onclick="window.open('${img}', '_blank')">`
        ).join('');
        content = `
            <div class="message-bubble">
                <p>${message.content}</p>
                <div class="chat-images">${images}</div>
                <span class="message-time">${formatTimestamp(message.timestamp)}</span>
            </div>
        `;
    } else if (message.type === 'cta') {
        const buttons = message.metadata.actions.map(action =>
            `<button class="cta-button" onclick="handleCTAClick('${action.type}', '${action.value}')">${action.label}</button>`
        ).join('');
        content = `
            <div class="message-bubble">
                <p>${message.content}</p>
                <div class="cta-buttons">${buttons}</div>
                <span class="message-time">${formatTimestamp(message.timestamp)}</span>
            </div>
        `;
    }

    messageDiv.innerHTML = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ==================== Suggestions ====================
const QUICK_SUGGESTIONS = [
    { text: '📋 View Menu', query: 'Show me the menu' },
    { text: '🕐 Opening Hours', query: 'What are your opening hours?' },
    { text: '📍 Location', query: 'Where are you located?' },
    { text: '⭐ Specials', query: 'What are today\'s specials?' }
];

function renderSuggestions() {
    const suggestionsContainer = document.getElementById('chatbot-suggestions');
    suggestionsContainer.innerHTML = QUICK_SUGGESTIONS.map(suggestion =>
        `<button class="suggestion-chip" onclick="handleSuggestionClick('${suggestion.query}')">${suggestion.text}</button>`
    ).join('');
}

function handleSuggestionClick(query) {
    document.getElementById('chatbot-input').value = query;
    handleSendMessage();
}

// ==================== CTA Handlers ====================
function handleCTAClick(type, value) {
    if (type === 'call') {
        window.location.href = `tel:${value}`;
    } else if (type === 'maps') {
        window.open(value, '_blank');
    } else if (type === 'navigate') {
        window.location.href = value;
    }
}

// ==================== Image Detection ====================
function detectImageRequest(query) {
    const lowerQuery = query.toLowerCase();
    const imageKeywords = {
        breakfast: ['breakfast', 'morning food'],
        brunch: ['brunch'],
        lunch: ['lunch', 'meal'],
        coffee: ['coffee', 'chai', 'tea'],
        curry: ['curry', 'gravy'],
        momo: ['momo', 'dumpling'],
        biryani: ['biryani', 'rice']
    };

    for (const [category, keywords] of Object.entries(imageKeywords)) {
        if (keywords.some(keyword => lowerQuery.includes(keyword)) &&
            (lowerQuery.includes('show') || lowerQuery.includes('photo') ||
                lowerQuery.includes('image') || lowerQuery.includes('picture'))) {
            return category;
        }
    }
    return null;
}

// ==================== Lead Capture ====================
function shouldShowLeadCapture() {
    return chatbotState.shouldCaptureLead();
}

function showLeadCaptureForm() {
    const message = chatbotState.addMessage(
        'assistant',
        'I\'d love to help you better! May I have your name?',
        'text'
    );
    renderMessage(message);
    chatbotState.leadCaptured = true; // Mark as shown
}

// ==================== Gemini AI Integration ====================
async function getGeminiResponse(userMessage) {
    if (CONFIG.useCloudflareWorker) {
        // Use Cloudflare Worker (Secure - API key hidden)
        return await getGeminiResponseViaWorker(userMessage);
    } else {
        // Direct API call (Only for development)
        return await getGeminiResponseDirect(userMessage);
    }
}

// Secure method: Via Cloudflare Worker
async function getGeminiResponseViaWorker(userMessage) {
    try {
        const response = await fetch(CONFIG.workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userMessage: userMessage,
                conversationHistory: chatbotState.conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error('Worker request failed');
        }

        const data = await response.json();
        return data.response || data.error || "I'm having trouble connecting right now. Please call us at +44-103-WHATSAPP!";
    } catch (error) {
        console.error('Cloudflare Worker Error:', error);
        return "I'm having trouble connecting right now. Please call us at +44-103-WHATSAPP or visit our restaurant!";
    }
}

// Development only: Direct API call (exposes API key)
async function getGeminiResponseDirect(userMessage) {
    const systemPrompt = `You are a warm, friendly AI assistant for POKHARA, an authentic Nepalese and Indian restaurant in Bridgend, UK.

PERSONALITY:
- Be warm, welcoming, and helpful
- Use friendly language with occasional emojis 😊
- Sound professional but approachable

RESTAURANT KNOWLEDGE:
Full Menu:
${JSON.stringify(KNOWLEDGE_BASE.menu, null, 2)}

Hours: ${KNOWLEDGE_BASE.hours}
Location: ${KNOWLEDGE_BASE.location}
Phone: ${KNOWLEDGE_BASE.phone}
Services: ${KNOWLEDGE_BASE.services.join(', ')}

FORMATTING GUIDELINES:
- When asked for the menu, present it professionally by CATEGORY.
- For each item, use this exact format:
  - [ITEM_NAME] - [PRICE]
    [ITEM_DESCRIPTION]
- Use clear spacing between categories.
- Always include an encouraging closing statement.
- If asked for something not on the menu, politely mention our specialties or suggest calling us.
- NEVER use asterisks (*), stars (**), or hash symbols (###) for formatting.
- Use only dashes (-) for bullet points.
- Write category names as plain text (e.g., "Nepalese Starters:" NOT "**Nepalese Starters**" or "### Nepalese Starters")

IMPORTANT:
- NEVER say "I don't know the full menu" or "etc."
- Present the menu in a clean, professional way that is easy to read on mobile.
- Use dashes (-) for items within categories, never asterisks.
- Do NOT use any markdown formatting like *, **, #, ### etc.

Recent conversation:
${chatbotState.conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}`;

    try {
        console.log('Calling Gemini API...');
        const apiUrl = `${CONFIG.geminiApiUrl}?key=${CONFIG.geminiApiKey}`;
        console.log('API URL:', apiUrl.replace(CONFIG.geminiApiKey, 'HIDDEN'));

        const requestBody = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
                topP: 0.9,
                topK: 40
            }
        };

        console.log('Request body:', requestBody);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
            const errorData = JSON.parse(responseText);
            // Check if it's a rate limit error
            if (response.status === 429 || errorData?.error?.code === 429) {
                console.warn('Rate limit exceeded, using fallback response');
                return getFallbackResponse(userMessage);
            }
            throw new Error(`API request failed: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('AI Response:', aiResponse);
        return aiResponse;
    } catch (error) {
        console.error('Gemini API Error:', error);
        // Use fallback for any error
        return getFallbackResponse(userMessage);
    }
}

// ==================== Fallback Responses ====================
function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Menu request
    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        return `Here's our delicious menu at POKHARA! 😊

Nepalese Starters:
- Momo (Chicken/Veg) - £6.95
- Onion Bhaji (V) - £5.00
- Samosa (Veg/Meat) - £4.50
- Chicken Tikka Starter - £5.95

Tandoori Specialties:
- Tandoori Chicken (Half) - £9.95
- Seekh Kebab - £10.00
- Lamb Chops (4pcs) - £12.95

Main Courses:
- Pokhara Special Thali - £15.95
- Chicken Tikka Masala - £9.95
- Lamb Rogan Josh - £11.95
- King Prawn Jalfrezi - £13.95

Sides:
- Pilau Rice - £4.00
- Garlic Naan - £4.00

We hope you find something you'll love! Don't forget, you can order online or call us!`;
    }
    
    // Hours request
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time') || lowerMessage.includes('close')) {
        return `We're open Monday to Sunday, 5:00 PM - 11:00 PM. 🕐 We'd love to see you! Book a table or order online anytime.`;
    }
    
    // Location request
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('find')) {
        return `You can find us at Court Colman Manor, Pen-y-fai, Bridgend CF31 4NG. 📍 We're easy to find and have plenty of parking. See you soon!`;
    }
    
    // Booking request
    if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || lowerMessage.includes('table')) {
        return `We'd love to have you dine with us! 🍽️ You can book a table directly on our website or call us. We recommend booking ahead for weekends!`;
    }
    
    // Specials request
    if (lowerMessage.includes('special') || lowerMessage.includes('recommend') || lowerMessage.includes('best')) {
        return `Our most popular dishes are the Momo (authentic Nepalese dumplings) at £6.95 and the Chicken Tikka Masala at £9.95! ⭐ The Pokhara Special Thali at £15.95 is perfect if you want to try a bit of everything!`;
    }
    
    // Default response
    return `Thank you for reaching out! 😊 

Here's how we can help:
- View our full menu online
- Book a table for dine-in
- Order takeaway

Call us or visit our restaurant at Court Colman Manor, Bridgend. We're open daily from 5 PM - 11 PM!`;
}

// ==================== Message Handler ====================
async function handleSendMessage() {
    const input = document.getElementById('chatbot-input');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // Add user message
    const userMsg = chatbotState.addMessage('user', userMessage, 'text');
    renderMessage(userMsg);

    // Update conversation history
    chatbotState.conversationHistory.push({ role: 'user', content: userMessage });

    input.value = '';

    // Check for image request
    const imageCategory = detectImageRequest(userMessage);
    if (imageCategory && FOOD_IMAGES[imageCategory]) {
        const imageMsg = chatbotState.addMessage(
            'assistant',
            `Here are some delicious ${imageCategory} options from our menu!`,
            'images',
            { images: FOOD_IMAGES[imageCategory] }
        );
        renderMessage(imageMsg);

        // Add CTA after images
        setTimeout(() => {
            const ctaMsg = chatbotState.addMessage(
                'assistant',
                'Want to order or make a reservation?',
                'cta',
                {
                    actions: [
                        { type: 'navigate', value: 'order-online.html', label: '🍽️ Order Now' },
                        { type: 'navigate', value: 'book-table.html', label: '📅 Book Table' },
                        { type: 'call', value: CONFIG.restaurantPhone, label: '📞 Call Us' }
                    ]
                }
            );
            renderMessage(ctaMsg);
        }, 500);
        return;
    }

    // Show typing indicator
    showTypingIndicator();

    // Get AI response
    const aiResponse = await getGeminiResponse(userMessage);

    hideTypingIndicator();

    // Add AI message
    const assistantMsg = chatbotState.addMessage('assistant', aiResponse, 'text');
    renderMessage(assistantMsg);

    chatbotState.conversationHistory.push({ role: 'assistant', content: aiResponse });
}

// ==================== Initialization ====================
function initChatbot() {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('close-chatbot-btn');
    const clearBtn = document.getElementById('clear-chat-btn');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chatbot-input');

    // Toggle chatbot
    chatbotButton.addEventListener('click', () => {
        chatbotState.isOpen = !chatbotState.isOpen;
        chatbotWindow.classList.toggle('open');
        chatbotButton.classList.toggle('hidden');

        if (chatbotState.isOpen && chatbotState.messages.length === 0) {
            // First time opening - show greeting
            const greeting = chatbotState.addMessage('assistant', getTimeBasedGreeting(), 'text');
            renderMessage(greeting);

            renderSuggestions();

            // Show CTA buttons
            setTimeout(() => {
                const ctaMsg = chatbotState.addMessage(
                    'assistant',
                    'Quick actions:',
                    'cta',
                    {
                        actions: [
                            { type: 'navigate', value: 'order-online.html', label: '📋 View Full Menu' },
                            { type: 'call', value: CONFIG.restaurantPhone, label: '📞 Call Us' },
                            { type: 'maps', value: CONFIG.googleMapsUrl, label: '📍 Get Directions' },
                            { type: 'navigate', value: 'order-online.html', label: '🍽️ Order Online' }
                        ]
                    }
                );
                renderMessage(ctaMsg);
            }, 1000);
        }

        // Hide badge
        document.querySelector('.chatbot-badge').style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
        chatbotButton.classList.remove('hidden');
        chatbotState.isOpen = false;
    });

    clearBtn.addEventListener('click', () => {
        chatbotState.reset();
        document.getElementById('chatbot-messages').innerHTML = '';
        document.getElementById('chatbot-suggestions').innerHTML = '';

        const greeting = chatbotState.addMessage('assistant', getTimeBasedGreeting(), 'text');
        renderMessage(greeting);
        renderSuggestions();
    });

    sendBtn.addEventListener('click', handleSendMessage);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

// ==================== Auto-Start ====================
document.addEventListener('DOMContentLoaded', () => {
    createChatbotUI();
    initChatbot();
});

// Make functions globally available
window.handleSuggestionClick = handleSuggestionClick;
window.handleCTAClick = handleCTAClick;
