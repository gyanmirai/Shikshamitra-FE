import type { AcademicNotificationOperationStatus } from 'src/redux/academic-notifications/delivery-types';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { CommunicationChannelType, CommunicationCampaignStatus } from 'src/redux/communication/communicationTypes';

import { NotificationDeliveryDetails } from './Components/notification-delivery-details';

vi.mock('src/redux/academic-notifications/delivery-api', () => ({
  useCancelAcademicNotificationOperationMutation: () => [vi.fn(), {}],
  useAcademicNotificationApprovalReviewQuery: () => ({}),
  useDecideAcademicNotificationApprovalMutation: () => [vi.fn(), {}],
}));

const queuedTest: AcademicNotificationOperationStatus = {
  operationId: 'operation',
  eventKey: 'Academic.Homework.Published',
  sourceType: 'Academic.NotificationTemplateTest',
  sourceId: 'template',
  status: CommunicationCampaignStatus.Queued,
  isSynthetic: true,
  approvalRequired: false,
  createdAt: '2026-11-24T09:30:00Z',
  publishedAt: '2026-11-24T09:30:00Z',
  scheduledAt: null,
  approvedAt: null,
  deliveries: [{ channel: CommunicationChannelType.InApp, status: AcademicDispatchStatus.Pending, count: 1 }],
  intents: [],
  excludedBeforeDispatch: 0,
};

it('shows when a template test expired before delivery even while the worker records it as queued', () => {
  const operation = {
    ...queuedTest, templateTestExpiresAt: '2026-11-24T09:40:00Z', templateTestExpiredBeforeDelivery: true,
  };
  render(<NotificationDeliveryDetails operation={operation} identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }}
    canManage={false} />);

  expect(screen.getByText('Expired', { exact: true })).toBeVisible();
  expect(screen.getByText('The delivery window for this test has expired.')).toBeVisible();
});
