# project3-gang_54
don't really know if this step is necessary
To see the credentials (their variable names), run
vercel env pull .env.local --environment=production

You can access the website at
https://project3-gang54.vercel.app/
it might take a bit to update and should update automatically on repo push

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
```

You can pull the production values directly from Vercel:

```
vercel env pull my-app/.env.local --environment=production
```
