// Cloudflare Worker to Proxy Gemini API Requests
// This keeps your API key secure on the server side

// ==================== CONFIGURATION ====================
// Add your Gemini API key here in Cloudflare Worker environment variables
// or directly here (but use environment variables in production)
const GEMINI_API_KEY = 'AIzaSyCm4Kb_CqAPmLKcWP9O0em1dwrGooGcN7A';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Allowed origins (your website domains)
const ALLOWED_ORIGINS = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'https://yourdomain.com', // Replace with your actual domain
];

// ==================== WORKER HANDLER ====================
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return handleCORS(request);
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // Check origin
    const origin = request.headers.get('Origin');
    if (!isAllowedOrigin(origin)) {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        // Parse incoming request
        const body = await request.json();
        
        // Validate request
        if (!body.userMessage) {
            return new Response(JSON.stringify({ error: 'Missing userMessage' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Make request to Gemini API
        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: body.prompt || createPrompt(body.userMessage, body.conversationHistory)
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.9,
                    topK: 40
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API Error:', errorText);
            return new Response(JSON.stringify({ 
                error: 'AI service unavailable',
                response: 'I\'m having trouble connecting right now. Please call us at +44-103-WHATSAPP or visit our restaurant!'
            }), {
                status: 200,
                headers: getCORSHeaders(origin)
            });
        }

        const data = await geminiResponse.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Return successful response
        return new Response(JSON.stringify({ response: aiResponse }), {
            status: 200,
            headers: getCORSHeaders(origin)
        });

    } catch (error) {
        console.error('Worker Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            response: 'I\'m having trouble right now. Please call us at +44-103-WHATSAPP!'
        }), {
            status: 200,
            headers: getCORSHeaders(origin)
        });
    }
}

// ==================== HELPER FUNCTIONS ====================

function createPrompt(userMessage, conversationHistory = []) {
    const systemPrompt = `You are a warm, friendly AI assistant for POKHARA, an authentic Nepalese and Indian restaurant in Bridgend, UK.

PERSONALITY:
- Be warm, welcoming, and helpful
- Use friendly language with occasional emojis 😊
- Sound professional but approachable

RESTAURANT INFORMATION:
MENU (always show ALL items with prices when asked about menu):
Starters:
- Momo (Nepalese Dumplings) £6.95
- Samosa £4.50

Main Courses:
- Chicken Tikka Masala £9.95
- Lamb Rogan Josh £11.95

Tandoori Specialties:
- Tandoori Chicken £10.95

Biryani:
- Chicken Biryani £10.95

Hours: Monday-Sunday, 5:00 PM - 11:00 PM
Location: Bridgend, UK
Phone: +44-103-WHATSAPP
Services: Dine-in, Takeaway, Table Booking, Catering

IMPORTANT RULES:
- When asked about the menu, list ALL menu items above with prices
- Never make up dishes or prices not listed above
- Only answer about POKHARA restaurant
- Give complete answers (2-3 sentences)
- Suggest booking a table or calling for special requests

Recent conversation:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}`;

    return `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
}

function isAllowedOrigin(origin) {
    if (!origin) return false;
    return ALLOWED_ORIGINS.some(allowed => 
        origin === allowed || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
    );
}

function getCORSHeaders(origin) {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

function handleCORS(request) {
    const origin = request.headers.get('Origin');
    return new Response(null, {
        status: 204,
        headers: getCORSHeaders(origin)
    });
}
