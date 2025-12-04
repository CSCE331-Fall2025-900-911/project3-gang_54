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
OPENWEATHER_API_KEY=<your-openweather-api-key>
```

### API Sources

- **Weather API**: Uses OpenWeatherMap Current Weather Data API
  - Source: https://api.openweathermap.org/data/2.5/weather
  - Get free API key at: https://openweathermap.org/api
  - Default location: College Station, TX

- **Google Translate API**: Uses Google Cloud Translation API v2
  - Endpoint: https://translation.googleapis.com/language/translate/v2
  - Enable in Google Cloud Console: https://console.cloud.google.com/apis/credentials
  - Requires Cloud Translation API to be enabled

You can pull the production values directly from Vercel:

```
vercel env pull my-app/.env.local --environment=production
```
