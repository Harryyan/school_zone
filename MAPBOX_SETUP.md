# Mapbox Setup Guide

## Getting a Mapbox Access Token

The school zone map feature requires a valid Mapbox access token to display street maps and terrain data.

### Step 1: Create a Mapbox Account
1. Go to [https://mapbox.com](https://mapbox.com)
2. Click "Get started" and sign up for a free account
3. Verify your email address

### Step 2: Generate an Access Token
1. After logging in, go to your [Account Dashboard](https://account.mapbox.com/)
2. Click on "Access tokens" in the sidebar
3. Your default public token will be shown, or click "Create a token"
4. For this project, you need a **Public Token** with these scopes:
   - `styles:tiles` (to load map styles)
   - `fonts:read` (to load map fonts)
   - `sprites:read` (to load map icons)

### Step 3: Update Environment Configuration

Replace the token in your environment files:

**`.env.mock`**:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

**`.env.local`** (create if it doesn't exist):
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

### Step 4: Restart Development Server
```bash
npm run dev:mock
```

## Free Tier Limits

Mapbox provides generous free usage:
- **50,000 map views** per month
- **50,000 geocoding requests** per month

This is more than sufficient for development and small-scale production use.

## Security Notes

- Public tokens are safe to expose in client-side code
- They can be restricted by URL/domain in production
- Never share secret tokens or commit them to version control

## Troubleshooting

If you still see a 403 error:
1. Ensure the token starts with `pk.`
2. Check that the token has the required scopes
3. Verify the token is not expired
4. Clear browser cache and restart the server

For production deployment, consider setting up URL restrictions in your Mapbox account settings.