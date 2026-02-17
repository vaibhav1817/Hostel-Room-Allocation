# Google OAuth Setup Guide

## Prerequisites
- A Google Account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Hostel Room Allocation")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select "External" user type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Hostel Room Allocation
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. Skip "Scopes" section (click **Save and Continue**)
7. Add test users if in testing mode
8. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth Client ID**
3. Select **Web application**
4. Configure the OAuth client:
   - **Name**: Hostel App Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://your-app.onrender.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:5002/api/auth/google/callback` (for development)
     - `https://your-app.onrender.com/api/auth/google/callback` (for production)
5. Click **Create**
6. **Copy your Client ID and Client Secret** - you'll need these!

## Step 5: Configure Environment Variables

### For Local Development:

1. Create a `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env
```

2. Edit the `.env` file with your credentials:
```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5002/api/auth/google/callback
SESSION_SECRET=your-random-secret-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### For Production (Render):

1. Go to your Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Add these environment variables:
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
   - `GOOGLE_CALLBACK_URL` = `https://your-app.onrender.com/api/auth/google/callback`
   - `SESSION_SECRET` = A random string (use a password generator)
   - `FRONTEND_URL` = `https://your-app.onrender.com`
   - `NODE_ENV` = `production`

## Step 6: Test OAuth

1. Start your development server:
```bash
npm run dev  # Frontend
cd server && node index.js  # Backend
```

2. Go to `http://localhost:5173/login`
3. Click "Sign in with Google"
4. You should be redirected to Google's consent screen
5. After authorizing, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in your Google Cloud Console EXACTLY matches your callback URL
- Include the protocol (`http://` or `https://`) and port number

### "invalid_client" error
- Double-check your Client ID and Client Secret in the `.env` file
- Make sure there are no extra spaces or quotes

### Session not persisting
- Check that `SESSION_SECRET` is set
- In production, make sure `NODE_ENV=production` is set

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong session secrets** in production
3. **Enable HTTPS** in production (Render does this automatically)
4. **Restrict OAuth redirect URIs** to only your actual domains
5. **Review OAuth scopes** - only request what you need (profile, email)

## How OAuth Works in This App

1. User clicks "Sign in with Google"
2. User is redirected to Google's authentication page
3. User grants permission
4. Google redirects back to `/api/auth/google/callback`
5. Backend creates or finds user in database
6. User is logged in via session
7. User is redirected to the dashboard

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
