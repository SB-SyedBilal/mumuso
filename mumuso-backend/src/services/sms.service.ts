// SMS Service — abstracted behind interface — Ref: Authorization Decision E (Twilio)
// MockSMSService for development, TwilioSMSService for production

import { env } from '../config/env';
import { logger } from '../middleware/logger';

export interface SMSService {
  sendOTP(phone: string, code: string): Promise<boolean>;
}

// Twilio implementation
class TwilioSMSService implements SMSService {
  async sendOTP(phone: string, code: string): Promise<boolean> {
    try {
      // Dynamic import to avoid requiring twilio in dev
      const twilio = await import('twilio');
      const client = twilio.default(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

      await client.messages.create({
        body: `Your Mumuso verification code is: ${code}. Valid for 10 minutes.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      logger.info('OTP sent via Twilio', { phone: phone.slice(0, 6) + '****' });
      return true;
    } catch (error) {
      logger.error('Failed to send OTP via Twilio', { error, phone: phone.slice(0, 6) + '****' });
      return false;
    }
  }
}

// Mock implementation for development
class MockSMSService implements SMSService {
  async sendOTP(phone: string, code: string): Promise<boolean> {
    logger.info(`[MOCK SMS] OTP ${code} sent to ${phone}`);
    return true;
  }
}

// Factory — Ref: Authorization Decision E
export function createSMSService(): SMSService {
  if (env.NODE_ENV === 'production' && env.TWILIO_ACCOUNT_SID) {
    return new TwilioSMSService();
  }
  return new MockSMSService();
}

export const smsService = createSMSService();
