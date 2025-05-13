import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let messagingInstance: admin.messaging.Messaging | null = null;

// Firebase Admin SDK initialization if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.");
    }
    // Resolve the path relative to the project root
    const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Firebase service account file not found at: ${absolutePath}`);
    }
    
    // Dynamically import the service account JSON file
    const serviceAccountFile = fs.readFileSync(absolutePath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountFile);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    
    console.log("Firebase Admin SDK initialized successfully");
    messagingInstance = admin.messaging();
    console.log("Firebase Messaging service obtained.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
} else {
  // If already initialized, just get the messaging instance
  messagingInstance = admin.messaging();
  if (messagingInstance) {
    console.log("Firebase Messaging service obtained from existing app.");
  } else {
    console.error("Failed to obtain Firebase Messaging service from existing app.");
  }
}

export default admin; // Changed from 'export const adminInstance = admin;'
export const messaging = messagingInstance;
