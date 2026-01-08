# Hugging Face API Setup for Gemma Model

## ✅ What Changed
Your chatbot now uses **Gemma 2 9B IT** model via Hugging Face Inference API instead of Google Gemini.

## 🔑 Get Your FREE API Key

1. **Create Account** (if you don't have one):
   - Go to: https://huggingface.co/join
   - Sign up with email or GitHub

2. **Generate API Token**:
   - Visit: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: `pokhara-chatbot`
   - Type: **Read** (default is fine)
   - Click "Generate"
   - **Copy the token** (starts with `hf_...`)

3. **Add Token to Your Code**:
   
   In `chatbot.js` line 10, replace:
   ```javascript
   huggingFaceApiKey: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
   ```
   
   With your actual token:
   ```javascript
   huggingFaceApiKey: 'hf_YOUR_ACTUAL_TOKEN_HERE',
   ```

## 🧪 Testing

1. Save `chatbot.js` with your API key
2. Refresh browser (Ctrl + F5)
3. Click chatbot button
4. Ask "Show me the menu"

**First request might take 10-20 seconds** as the model loads ("cold start"). After that, responses will be faster.

## ⚠️ Important Notes

- **Free Tier**: 30,000 requests/month (enough for testing)
- **Cold Start**: First request may be slow (model loading)
- **Rate Limit**: ~1000 requests/hour on free tier
- **No Credit Card Required**: Completely free to start

## 🔒 For Production (Optional)

### Update Cloudflare Worker:

In `cloudflare-worker.js` line 6, add your token:
```javascript
const HUGGINGFACE_API_KEY = 'hf_YOUR_ACTUAL_TOKEN_HERE';
```

Then:
1. Deploy to Cloudflare Workers
2. Update `chatbot.js` line 7 with Worker URL
3. Set `useCloudflareWorker: true` in `chatbot.js` line 12

## 🆚 Gemma vs Gemini

**Why Gemma?**
- ✅ Open-source model
- ✅ Available via Hugging Face
- ✅ Good for conversational AI
- ✅ Free inference API

**Trade-offs:**
- First request is slower (cold start)
- Slightly different response style
- Free tier has rate limits

## 📚 Resources

- Hugging Face Docs: https://huggingface.co/docs/api-inference
- Gemma Model Card: https://huggingface.co/google/gemma-2-9b-it
- API Status: https://status.huggingface.co

## 🐛 Troubleshooting

**"Model is loading" error:**
- Wait 10-20 seconds and try again
- First request after inactivity is slower

**"Unauthorized" error:**
- Check API key is correct
- Make sure key starts with `hf_`
- Verify key has Read permissions

**Still slow after first request:**
- Free tier may throttle during high usage
- Consider upgrading to PRO ($9/month) for faster inference
