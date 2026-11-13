<img width="1200" height="450" alt="image" src="https://github.com/user-attachments/assets/cf9c71b7-1a4b-4d99-8a53-33d151059e65" /><br/>

Metro is an unofficial Tyne & Wear Metro timetable, powered by Bus Open Data Service (via [Buslane](https://github.com/0sean/buslane)) since for some reason BODS also contains the full Metro timetable.

## Self-hosting/running locally

Metro can run anywhere you can run a Next.js app - in production, it runs on Vercel. You’ll also need an instance of Buslane running.

You’ll need two environment variables set:

- `BUSLANE_BASE_PATH`  - the path your Buslane instance is running at
- `BUSLANE_API_KEY` - the auth key you set on your Buslane instance

To run on Node:

```html
# In development
pnpm dev
# In production
pnpm build
pnpm start
```
