// Firebase Admin SDK initialization — Ref: Primary Spec Section 4, 16
// Placeholder config — do NOT commit real credentials

import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../middleware/logger';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): void {
  if (firebaseApp) return;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    logger.warn('Firebase credentials not configured — push notifications disabled');
    return;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    logger.info('Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('Failed to initialize Firebase', { error });
  }
}

export function getFirebaseMessaging(): admin.messaging.Messaging | null {
  if (!firebaseApp) {
    logger.warn('Firebase not initialized — cannot send push notification');
    return null;
  }
  return admin.messaging();
}
