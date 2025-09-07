# Deployment

This project can be deployed to Vercel, Firebase Hosting, or Netlify.

Vercel (recommended)

1. Push your repo to GitHub
2. Import the repo into Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy (Vercel will build automatically)

Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize hosting:

```bash
firebase login
firebase init hosting
```

3. Build and deploy:

```bash
npm run build
firebase deploy
```

Netlify

- Build the project with `npm run build` and deploy the output as appropriate (drag-and-drop or Netlify CLI).

Environment variables

Ensure these variables are present in your hosting provider:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
