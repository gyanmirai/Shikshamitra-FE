import { it, expect, describe } from 'vitest';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

import { templateMessageError, templateRecipientKinds, insertTemplateVariable } from './notification-template-model';

const variables = [
  { key: 'student_name', type: 0, required: true, sensitivity: 1 },
  { key: 'due_date', type: 1, required: false, sensitivity: 0 },
] as const;

describe('Academic message templates', () => {
  it('offers one guardian variant and only the recipient kinds supported by the event', () => {
    expect(templateRecipientKinds(['PrimaryGuardian', 'StudentAccount', 'AdditionalGuardians', 'ClassTeacher']))
      .toEqual(['Guardian', 'StudentAccount', 'ClassTeacher']);
  });

  it('inserts the catalogue token at the selected range', () => {
    expect(insertTemplateVariable('Hello parent!', 6, 12, 'student_name')).toEqual({
      value: 'Hello {{student_name}}!', caret: 22,
    });
  });

  it('validates variable syntax without requiring every data field in the copy', () => {
    expect(templateMessageError('{{due_date}}', 'body', CommunicationChannelType.InApp, variables)).toBeUndefined();
    expect(templateMessageError('{{other}}', 'body', CommunicationChannelType.InApp, variables)).toMatch(/other/);
    expect(templateMessageError('{{ due_date }}', 'body', CommunicationChannelType.InApp, variables)).toMatch(/variable/i);
  });

  it('checks required content and channel limits', () => {
    expect(templateMessageError(' ', 'body', CommunicationChannelType.Email, variables)).toMatch(/message/i);
    expect(templateMessageError('x'.repeat(241), 'body', CommunicationChannelType.WebPush, variables)).toMatch(/240/);
    expect(templateMessageError('First\nSecond', 'subject', CommunicationChannelType.Email, variables)).toMatch(/line/i);
  });
});
