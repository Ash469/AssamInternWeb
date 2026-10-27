// Firebase Admin is currently disabled from the main application flow.
// Push notifications are handled via database notifications.

export const messaging = null;

const admin = {
  apps: [],
  messaging: () => null,
};

export default admin;

