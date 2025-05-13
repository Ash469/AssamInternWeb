import admin from 'firebase-admin';

let messagingInstance: admin.messaging.Messaging | null = null;

// Firebase Admin SDK initialization if not already initialized
if (!admin.apps.length) {
  try {
    // Create service account credentials from environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };
    
    // Check if required credentials are available
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error("Required Firebase credentials are missing in environment variables");
    }

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

export default admin;
export const messaging = messagingInstance;
