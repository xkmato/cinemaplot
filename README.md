# Cinema Plot - Film Events Calendar

Cinema Plot is a modern, open-source event management platform specifically designed for the Ugandan film industry. Built with Next.js and powered by Firebase, it provides a simple, intuitive way for filmmakers, industry professionals, and enthusiasts to create, share, and discover film-related events across Uganda.

## Features

### 🎬 Event Management

- **Create Events**: Easily create film events with details like title, description, date, time, location, and images
- **Multi-day Events**: Support for events spanning multiple days (festivals, workshops, etc.)
- **Event Categories**: Perfect for movie premieres, casting calls, filmmaker meetups, and industry talks

### 📅 Calendar Views

- **Week View**: See all events for the current week at a glance
- **Day View**: Focus on a specific day's events
- **Responsive Design**: Optimized for both desktop and mobile viewing

### 🔔 Smart Notifications

- **Custom Reminders**: Set multiple notifications (minutes, hours, or days before events)
- **Email Notifications**: Automated email reminders sent via Mailgun
- **Timezone Support**: Events display in local timezone for better coordination

### 🔐 Authentication & Sharing

- **Google Sign-in**: Quick authentication with Google accounts
- **Magic Link Login**: Email-based passwordless authentication
- **Event Sharing**: Share events via social media, WhatsApp, or direct links
- **SEO Optimized**: Rich meta tags and structured data for better discoverability

### 🎨 User Experience

- **Dark Theme**: Easy on the eyes for extended use
- **Mobile-First**: Responsive design that works great on all devices
- **Real-time Updates**: Live synchronization of event data using Firestore

## Tech Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript for modern, type-safe development
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, modern design
- **Backend**: Firebase ecosystem
  - Firestore for real-time database
  - Firebase Auth for user authentication (Google OAuth + Magic Link)
  - Firebase Storage for image uploads
  - Firebase Analytics for usage tracking
- **State Management**: React Context API with custom hooks
- **Development**: ESLint for code quality, TypeScript for type safety
- **Hosting**: Vercel-ready with Firebase backend

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cinema-plot.git
   cd cinema-plot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file and update with your Firebase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Google and Email Link providers
   - Enable Firestore Database
   - Enable Storage
   - Enable Analytics (optional)
   - Copy your Firebase configuration to `.env.local`

5. **Set up Firestore Security Rules**

   Update your Firestore rules in the Firebase Console:

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

6. **Set up Firebase Storage Rules**

   Update your Storage rules in the Firebase Console:

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

## Development

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The app will automatically reload when you make changes to the source code.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking

### Development with Firebase Emulators (Optional)

For local development without affecting production data:

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Start emulators**
   ```bash
   firebase emulators:start
   ```

This will start local emulators for Firestore, Authentication, Storage, and Functions.

## Production Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### Deploying to Vercel (Recommended)

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new):

1. **Push your code to GitHub**
2. **Import your repository on Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy automatically** - Vercel will build and deploy your app

### Alternative Deployment Options

#### Deploy to Firebase Hosting

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**

   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy**

   ```bash
   npm run build
   firebase deploy
   ```

#### Deploy to Netlify

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy using Netlify CLI or drag-and-drop** the `.next` folder to Netlify

### Environment Variables for Production

Ensure you set up the following environment variables in your deployment platform:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Project Structure

```
app/                    # Next.js App Router
├── page.tsx           # Homepage
├── layout.tsx         # Root layout
├── globals.css        # Global styles
├── create/
│   └── page.tsx       # Event creation page
├── discover/
│   └── page.tsx       # Event discovery page
└── events/
    └── [id]/
        └── page.tsx   # Individual event pages

components/            # Reusable React components
├── auth-screen.tsx    # Authentication interface
├── create-event-modal.tsx  # Event creation form
├── event-card.tsx     # Event display component
├── get-user-name-modal.tsx # User profile setup
└── ui/               # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── ...

lib/                  # Utilities and configurations
├── firebase.ts       # Firebase configuration
├── auth-context.tsx  # Authentication & state management
├── types.ts          # TypeScript type definitions
├── helpers.ts        # Utility functions
└── utils.ts          # Utility functions

public/               # Static assets
├── next.svg
├── vercel.svg
└── ...

Configuration files:
├── next.config.ts    # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
├── eslint.config.mjs # ESLint configuration
└── components.json   # shadcn/ui configuration
```

## Contributing

We welcome contributions to Cinema Plot! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow Next.js and React best practices with TypeScript
- Use shadcn/ui components for consistent UI design
- Ensure mobile responsiveness for all new features
- Write clear commit messages and maintain type safety
- Test your changes thoroughly before submitting
- Use the Context API pattern for state management

## License

This project is open source and available under the MIT License.

## Support

For questions, suggestions, or support:

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact the maintainers directly

## Roadmap

- [ ] Advanced event filtering and search
- [ ] User profiles and follow system
- [ ] Event check-in and attendance tracking
- [ ] Integration with popular calendar apps
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Event analytics and insights

---

**Cinema Plot** - Connecting Uganda's film community, one event at a time. 🎬✨
