import { it, expect, describe } from 'vitest';

import { admissionInquiryCommunicationSchema } from './admission-inquiry-communication-dialog';

const validValues = {
  title: 'Campus visit follow-up',
  subject: '',
  body: 'Please reply to reserve a campus visit slot.',
  channels: [1],
  importanceLevel: 0,
  requiresAcknowledgement: false,
  publishImmediately: false,
};

describe('admissionInquiryCommunicationSchema', () => {
  it('accepts a concise SMS draft', async () => {
    await expect(admissionInquiryCommunicationSchema.validate(validValues)).resolves.toBeDefined();
  });

  it('requires an email subject when Email is selected', async () => {
    await expect(
      admissionInquiryCommunicationSchema.validate({ ...validValues, channels: [2] })
    ).rejects.toThrow('Enter a subject when Email is selected');
  });

  it('requires at least one supported family channel', async () => {
    await expect(
      admissionInquiryCommunicationSchema.validate({ ...validValues, channels: [] })
    ).rejects.toThrow('Choose at least one delivery channel');
  });
});
