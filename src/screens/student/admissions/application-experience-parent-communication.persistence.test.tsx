import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ApplicationExperienceParentCommunication } from './application-experience-parent-communication';

const mocks = vi.hoisted(() => ({ items: [] as unknown[], add: vi.fn(), update: vi.fn() }));
vi.mock('src/redux/communication/notification/notificationTemplateApi', () => ({
  useGetCommunicationTemplatesQuery: () => ({
    data: { items: mocks.items },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useAddCommunicationTemplateMutation: () => [mocks.add, { isLoading: false }],
  useUpdateCommunicationTemplateMutation: () => [mocks.update, { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const events = [
  ['inquiry-acknowledgement', 'Inquiry acknowledgement'],
  ['application-received', 'Application received'],
  ['missing-documents', 'Missing documents'],
  ['exam-scheduled', 'Exam scheduled'],
  ['hall-ticket-ready', 'Hall ticket ready'],
  ['result-published', 'Result published'],
  ['offer-issued', 'Offer issued'],
  ['payment-reminder', 'Payment reminder'],
  ['admission-finalized', 'Admission finalized'],
] as const;

function renderMessages() {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationExperienceParentCommunication />
    </ThemeProvider>
  );
}

beforeEach(() => {
  mocks.items = [];
  mocks.add.mockReset().mockReturnValue({ unwrap: async () => undefined });
  mocks.update.mockReset().mockReturnValue({ unwrap: async () => undefined });
});

describe('parent-message persistence during display-copy changes', () => {
  it.each(events)(
    'updates the existing %s template without creating a differently named copy',
    async (key, storedLabel) => {
      mocks.items = [
        {
          id: 'saved-template',
          templateName: `Admissions · ${storedLabel}`,
          category: 'Admissions lifecycle',
          subject: 'Saved subject exactly as entered',
          body: 'Saved message for {{parentName}}',
          languageCode: 'en',
          channels: [2],
          variables: ['parentName'],
          hashtags: ['admissions', key],
          approvalStatus: 2,
          isActive: true,
        },
      ];
      renderMessages();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Edit Message' }));
      expect(screen.getByRole('textbox', { name: 'Subject *' })).toHaveValue(
        'Saved subject exactly as entered'
      );
      await user.click(screen.getByRole('button', { name: 'Save Message' }));
      await waitFor(() =>
        expect(mocks.update).toHaveBeenCalledWith({
          id: 'saved-template',
          data: expect.objectContaining({
            templateName: `Admissions · ${storedLabel}`,
            subject: 'Saved subject exactly as entered',
            category: 'Admissions lifecycle',
            hashtags: ['admissions', key],
          }),
        })
      );
      expect(mocks.add).not.toHaveBeenCalled();
    }
  );

  it('retains the existing default subject and identity when configuring a new inquiry message', async () => {
    renderMessages();
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Configure' })[0]);
    expect(screen.getByRole('textbox', { name: 'Subject *' })).toHaveValue(
      'Inquiry acknowledgement'
    );
    await user.click(screen.getByRole('button', { name: 'Save Message' }));
    await waitFor(() =>
      expect(mocks.add).toHaveBeenCalledWith(
        expect.objectContaining({
          templateName: 'Admissions · Inquiry acknowledgement',
          subject: 'Inquiry acknowledgement',
        })
      )
    );
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
