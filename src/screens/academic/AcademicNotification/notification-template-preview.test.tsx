import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

import { NotificationTemplatePreview } from './Components/notification-template-preview';

vi.mock('src/redux/academic-notifications/template-api', () => ({
  useLazyAcademicNotificationTemplatePreviewQuery: () => [
    vi.fn(),
    {
      currentData: {
        isSynthetic: true,
        rendered: { isSuccess: true, subject: 'Homework for Sample Learner', body: 'Submit by Monday.' },
      },
    },
  ],
}));

it('labels a browser push sample as saved template wording', () => {
  render(<NotificationTemplatePreview
    identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }}
    templateId="template"
    revisionId="revision"
    channel={CommunicationChannelType.WebPush}
  />);

  fireEvent.click(screen.getByRole('button', { name: 'Load sample preview' }));

  expect(screen.getByText('Saved browser push template with sample data')).toBeVisible();
  expect(screen.getByText('Homework for Sample Learner')).toBeVisible();
});
