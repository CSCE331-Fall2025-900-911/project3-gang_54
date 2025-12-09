# project3-gang_54
try\
vercel env pull .env.local --environment=production


Website access:\
https://project3-gang54.vercel.app/  \
should update automatically on repo push and it might take a bit to update.  

Work inside `my-app/app`. Each subfolder is it's own page, `page.tsx` is compiled into a page. `/` is `app/page.tsx`.  


To work locally:  
cd my-app  
npm install  
npm run dev  

## Environment variables

Create a `.env.local` file in `my-app/` with:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
JWT_SECRET=<random-long-secret>
GOOGLE_TRANSLATE_API_KEY=<your-google-translate-api-key>
```

### API Sources

- **Weather API**: Uses Open-Meteo Weather Forecast API
  - Source: https://api.open-meteo.com/v1/forecast
  - No API key required - completely free and open source
  - Default location: College Station, TX (30.6279°N, 96.3344°W)
  - Documentation: https://open-meteo.com/en/docs

- **Google Translate API**: Uses Google Cloud Translation API v2
  - Endpoint: https://translation.googleapis.com/language/translate/v2
  - Enable in Google Cloud Console: https://console.cloud.google.com/apis/credentials
  - Requires Cloud Translation API to be enabled
  - **To set up in Vercel:**
    1. Go to Vercel project settings → Environment Variables
    2. Add `GOOGLE_TRANSLATE_API_KEY` with your API key
    3. Make sure Cloud Translation API is enabled in Google Cloud Console
    4. Redeploy the application

**Important:** Environment variables must be set in Vercel for production. They are not automatically pulled from `.env.local`.

You can pull the production values directly from Vercel:

```
vercel env pull my-app/.env.local --environment=production
```

### Debugging API Issues

If the APIs are not working, you can test them using the debug endpoint:

1. Visit: `https://your-vercel-app.vercel.app/api/test-apis`
2. This will show you:
   - Whether environment variables are set
   - Whether the API keys are valid
   - Specific error messages from the APIs

**Common Issues:**

1. **API Keys Not Set in Vercel**: Environment variables must be set in Vercel project settings, not just in `.env.local`
2. **Google Translate API Not Enabled**: Make sure Cloud Translation API is enabled in Google Cloud Console
3. **Invalid API Keys**: Check that the keys are copied correctly (no extra spaces, correct format)
4. **API Quota Exceeded**: Free tier APIs have usage limits
