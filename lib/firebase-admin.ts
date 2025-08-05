import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;

function initializeAdminApp(): App {
    if (adminApp) return adminApp;

    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }

    try {
        // For development, use a simplified approach
        if (process.env.NODE_ENV === 'development') {
            // Try to use service account if available, otherwise use basic config
            const hasServiceAccount = process.env.NEXT_FIREBASE_SERVICE_ACCOUNT_KEY || 
                                    (process.env.NEXT_FIREBASE_CLIENT_EMAIL && process.env.NEXT_FIREBASE_PRIVATE_KEY);
            
            if (hasServiceAccount) {
                const credentials = process.env.NEXT_FIREBASE_SERVICE_ACCOUNT_KEY
                    ? JSON.parse(process.env.NEXT_FIREBASE_SERVICE_ACCOUNT_KEY)
                    : {
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                        clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    };

                adminApp = initializeApp({
                    credential: cert(credentials),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } else {
                // Fallback for development without service account
                console.warn('No Firebase Admin credentials found. Operations may fail.');
                adminApp = initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            }
        } else {
            // For production with service account
            const credentials = process.env.NEXT_FIREBASE_SERVICE_ACCOUNT_KEY
                ? JSON.parse(process.env.NEXT_FIREBASE_SERVICE_ACCOUNT_KEY)
                : {
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                };

            if (!credentials.privateKey) {
                throw new Error('Firebase Admin credentials not properly configured');
            }

            adminApp = initializeApp({
                credential: cert(credentials),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }

        return adminApp;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
    }
}

function getAdminFirestore(): Firestore {
    if (adminFirestore) return adminFirestore;

    const app = initializeAdminApp();
    adminFirestore = getFirestore(app);
    return adminFirestore;
}

// Export a function that lazily initializes the admin DB
export function getAdminDb(): Firestore {
    return getAdminFirestore();
}

// For backwards compatibility
export const adminDb = {
    collection: (path: string) => getAdminFirestore().collection(path),
    doc: (path: string) => getAdminFirestore().doc(path),
};
