// Firebase Cloud Messaging is currently disabled from the main application flow.

interface PushNotificationData {
  title: string;
  content: string;
  [key: string]: string;
}

export const sendPushNotification = async (
  _topic: string,
  _title: string,
  _body: string,
  _data?: PushNotificationData
): Promise<boolean> => {
  // Push notifications disabled
  return false;
};

export const subscribeToTopic = async (_tokens: string[], _topic: string): Promise<boolean> => {
  // Push notifications disabled
  return false;
};

