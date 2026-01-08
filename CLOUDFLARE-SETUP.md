# Cloudflare Worker Setup for POKHARA Chatbot

This guide will help you deploy a Cloudflare Worker to securely proxy Gemini API requests, keeping your API key safe.

## Why Use Cloudflare Worker?

✅ **Security**: API key stays on the server, never exposed to users  
✅ **Free Tier**: 100,000 requests/day on free plan  
✅ **Fast**: Edge computing for low latency  
✅ **Easy**: Simple deployment process  

---

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Create a free account
3. Verify your email

---

## Step 2: Create a Worker

1. Log in to Cloudflare Dashboard
2. Click **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Click **Create Worker**
5. Give it a name like: `pokhara-chatbot-api`
6. Click **Deploy**

---

## Step 3: Add Worker Code

1. After deployment, click **Edit Code**
2. **Delete all existing code** in the editor
3. Open the file `cloudflare-worker.js` from your project
4. **Copy ALL the code** from `cloudflare-worker.js`
5. **Paste it** into the Cloudflare Worker editor
6. Find this line (around line 8):
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
7. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
8. Find this line (around line 12):
   ```javascript
   'https://yourdomain.com', // Replace with your actual domain
   ```
9. Replace with your actual website domain (or remove if testing locally)
10. Click **Save and Deploy**

---

## Step 4: Get Your Worker URL

After deployment, you'll see a URL like:
```
https://pokhara-chatbot-api.your-username.workers.dev
```

**Copy this URL!** You'll need it in the next step.

---

## Step 5: Update Your Chatbot Code

1. Open `chatbot.js` in your project
2. Find line 4 (in the CONFIG section):
   ```javascript
   workerUrl: 'https://your-worker.your-subdomain.workers.dev',
   ```
3. Replace it with your actual Worker URL from Step 4:
   ```javascript
   workerUrl: 'https://pokhara-chatbot-api.your-username.workers.dev',
   ```
4. Make sure this line is set to `true`:
   ```javascript
   useCloudflareWorker: true,
   ```
5. Save the file

---

## Step 6: Test Your Chatbot

1. Open your website in a browser
2. Click the chatbot button
3. Try asking: "What's on the menu?"
4. The chatbot should respond!

---

## Troubleshooting

### Error: "Worker request failed"
- Check your Worker URL is correct in `chatbot.js`
- Make sure the Worker is deployed (green status in Cloudflare dashboard)

### Error: "Forbidden" or CORS error
- Add your website domain to `ALLOWED_ORIGINS` in `cloudflare-worker.js`
- Redeploy the Worker

### Error: "AI service unavailable"
- Check your Gemini API key is correct in the Worker code
- Make sure you have Gemini API access

### Testing Locally
If you want to test without a Worker during development:
1. In `chatbot.js`, set:
   ```javascript
   useCloudflareWorker: false,
   ```
2. Uncomment these lines:
   ```javascript
   geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',
   geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
   ```
3. Add your API key
4. **Remember**: Switch back to Worker mode before deploying to production!

---

## Security Best Practices

✅ **DO**: Use Cloudflare Worker in production  
✅ **DO**: Keep your API key in the Worker only  
✅ **DO**: Add your domain to ALLOWED_ORIGINS  
❌ **DON'T**: Commit API keys to GitHub  
❌ **DON'T**: Use direct API calls in production  
❌ **DON'T**: Share your Worker URL publicly  

---

## Cloudflare Worker Limits (Free Tier)

- **Requests**: 100,000 per day
- **CPU Time**: 10ms per request
- **Memory**: 128 MB

This is more than enough for a restaurant chatbot! 🎉

---

## Optional: Use Environment Variables (Advanced)

For better security:

1. In Cloudflare Worker dashboard, go to **Settings** → **Variables**
2. Add a new environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your API key
3. Update Worker code:
   ```javascript
   const GEMINI_API_KEY = env.GEMINI_API_KEY;
   ```

---

## Support

If you need help:
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Gemini API Docs: https://ai.google.dev/docs

---

## Summary

✅ Created Cloudflare Worker  
✅ Added Worker code with API key  
✅ Got Worker URL  
✅ Updated chatbot.js with Worker URL  
✅ Tested chatbot  

Your API key is now secure! 🔒
