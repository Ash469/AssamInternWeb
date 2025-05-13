import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification'; 
import { messaging } from '@/lib/firebase-admin';

// Define an interface for your Notification document if not already defined in models/Notification
// interface INotification {
//   _id: string;
//   title: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export async function POST(request: Request) {
  try {
    await connectDB();
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newNotification = new Notification({ title, content });
    const savedNotification = await newNotification.save();

    // Send FCM push notification
    if (messaging) {
      const fcmTopic = process.env.FCM_DEFAULT_TOPIC || 'all_users';
      const messagePayload = {
        notification: {
          title: title,
          body: content,
        },
        data: { // Optional: send additional data to your app
          notificationId: String(savedNotification._id),
          // Add any other custom data your app might need
        },
        topic: fcmTopic,
      };

      console.log(`Attempting to send FCM message to topic: ${fcmTopic}`, messagePayload);

      try {
        const response = await messaging.send(messagePayload);
        console.log('Successfully sent FCM message:', response);
      } catch (fcmError) {
        console.error('Error sending FCM message:', fcmError);
        // Log detailed error information if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorDetails = fcmError as any;
        if (errorDetails.errorInfo) {
          console.error('FCM Error Info:', errorDetails.errorInfo);
        }
        if (errorDetails.results) {
            console.error('FCM Send Results (if partial failure):', errorDetails.results);
        }
        // Even if FCM fails, we might still want to return success for DB operation
        // Or, you could return a specific status indicating partial success.
      }
    } else {
      console.warn('Firebase Messaging service is not available. Skipping push notification.');
    }

    return NextResponse.json({ message: 'Notification created successfully', notification: savedNotification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: (error as any).message || 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: (error as any).message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: (error as any).message || 'Failed to delete notification' }, { status: 500 });
  }
}
