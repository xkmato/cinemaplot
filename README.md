# Cinema Plot - Film Events Calendar

Cinema Plot is an open-source event management platform specifically designed for the Ugandan film industry. It provides a simple, intuitive way for filmmakers, industry professionals, and enthusiasts to create, share, and discover film-related events across Uganda.

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

- **Frontend**: React 19.1.0 with React Router for navigation
- **Styling**: Tailwind CSS for responsive, utility-first styling
- **Backend**: Firebase ecosystem
  - Firestore for real-time database
  - Firebase Auth for user authentication
  - Firebase Storage for image uploads
  - Firebase Analytics for usage tracking
- **Notifications**: Mailgun for email delivery
- **Cloud Functions**: Firebase Functions for scheduled notifications
- **Hosting**: Firebase Hosting with automatic deployments

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Firebase project with Firestore, Authentication, and Storage enabled
- Mailgun account for email notifications (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cinema-plot.git
   cd cinema-plot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Google and Email Link providers)
   - Enable Firestore Database
   - Enable Storage
   - Enable Analytics (optional)

5. **Set up Firestore Security Rules**

   Update your Firestore rules in the Firebase Console:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Development

### Running the Development Server

```bash
npm start
```

This will start the development server at `http://localhost:3000`. The app will automatically reload when you make changes to the source code.

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build production bundle
- `npm run eject` - Eject from Create React App (not recommended)

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

This creates an optimized production build in the `build` folder.

### Deploying to Firebase Hosting

1. **Install Firebase CLI** (if not already installed)

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done)

   ```bash
   firebase init
   ```

   Select Hosting and choose your Firebase project.

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Setting up Email Notifications (Optional)

1. **Create a Mailgun account** at [mailgun.com](https://www.mailgun.com)

2. **Set up environment variables** for Cloud Functions:

   ```bash
   firebase functions:config:set mailgun.key="your-mailgun-api-key" mailgun.domain="your-domain.com"
   ```

3. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

### Environment-Specific Configurations

For production deployments, ensure you:

- Use production Firebase project credentials
- Enable proper security rules for Firestore and Storage
- Set up proper CORS policies if needed
- Configure custom domain in Firebase Hosting (optional)
- Set up monitoring and alerts for production usage

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AuthScreen.js    # Authentication interface
│   ├── CalendarView.js  # Main calendar interface
│   ├── EventItem.js     # Individual event display
│   ├── EventPage.js     # Detailed event view
│   └── header.js        # Navigation header
├── modals/              # Modal components
│   ├── CreateEvent.js   # Event creation form
│   └── GetUserName.js   # User profile setup
├── App.js              # Main application component
├── firebase.js         # Firebase configuration
├── Helpers.js          # Utility functions
└── index.js            # Application entry point

functions/              # Firebase Cloud Functions
└── main.py            # Email notification scheduler

public/                # Static assets
├── index.html         # HTML template
└── manifest files     # PWA configuration
```

## Contributing

We welcome contributions to Cinema Plot! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow React best practices and hooks patterns
- Use Tailwind CSS classes for styling consistency
- Ensure mobile responsiveness for all new features
- Write clear commit messages
- Test your changes thoroughly before submitting

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
