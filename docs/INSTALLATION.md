# Installation & Firebase setup

This document explains how to get the project running locally and how to configure Firebase.

Prerequisites
- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager
- Firebase project with Firestore, Authentication, and Storage enabled

Clone the repository

```bash
git clone https://github.com/xkmato/cinemaplot.git
cd cinemaplot
```

Install dependencies

```bash
npm install
# or
# yarn install
# or
# pnpm install
```

Environment variables

Copy the example environment file and update with your Firebase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase configuration (values from your Firebase console):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Firebase configuration checklist

- Create a new Firebase project at https://console.firebase.google.com
- Enable Authentication with Google and Email Link providers
- Enable Firestore Database
- Enable Storage
- (Optional) Enable Analytics

Firestore rules (example)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Storage rules (example)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /event-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Local emulators (optional)

If you'd like to work against Firebase emulators rather than production:

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login:

```bash
firebase login
```

3. Start emulators:

```bash
firebase emulators:start
```

This will run local emulators for Firestore, Authentication, Storage, and Functions (if configured).
