import type { AcademicNotificationEvent } from 'src/redux/academic-notifications/types';

import { useFormik } from 'formik';
import { Drawer } from '@mui/material';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';

import { NotificationTemplateFields } from './Components/notification-template-fields';

import type { TemplateFormValues } from './use-notification-template-form';

const event: AcademicNotificationEvent = {
  definition: {
    eventKey: 'Academic.ClassTeacher.Assigned',
    category: 'Class Management',
    sourceType: 'Academic.ClassTeacher',
    linkBuilderKey: 'Academic.ClassTeacher',
    schemaVersion: 1,
    triggerType: 0,
    deliveryProfile: 0,
    recipientSelectors: ['AssignedTeacher'],
    supportedChannels: [CommunicationChannelType.InApp, CommunicationChannelType.Email],
    variables: [
      { key: 'class_name', type: 0, required: true, sensitivity: 0 },
      { key: 'school_name', type: 0, required: true, sensitivity: 0 },
    ],
    materialChangeFields: [],
    allowsQuietHoursBypass: false,
  },
  availability: { isAvailable: true, reasonCode: null },
};

function Form({ subject = '' }: { subject?: string }) {
  const form = useFormik<TemplateFormValues>({
    initialValues: {
      templateName: 'Assignment',
      recipientKind: 'AssignedTeacher',
      channel: CommunicationChannelType.InApp,
      languageCode: 'en',
      subject,
      body: '',
    },
    onSubmit: () => {},
  });
  return <NotificationTemplateFields event={event} form={form} locked={false}
    disabled={false} readOnly={false} scopeLabel="School" />;
}

describe('Academic notification template variable suggestions', () => {
  it('lists event variables and replaces a filtered subject query at the caret', async () => {
    const user = userEvent.setup();
    render(<Form subject="Hello !" />);
    const subject = screen.getByRole<HTMLInputElement>('textbox', { name: 'Subject' });
    await user.click(subject);
    subject.setSelectionRange(6, 6);
    await user.keyboard('@');
    const list = screen.getByRole('listbox', { name: /subject variables/i });
    expect(within(list).getAllByRole('option')).toHaveLength(2);
    await user.keyboard('{ArrowDown}');
    expect(within(list).getByRole('option', { selected: true })).toHaveTextContent('school name');

    await user.keyboard('school_n');
    expect(within(list).getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(subject).toHaveValue('Hello {{school_name}}!');
    expect(subject).toHaveFocus();
    expect(subject.selectionStart).toBe(21);
  });

  it('dismisses message suggestions with Escape and then inserts a clicked variable', async () => {
    const user = userEvent.setup();
    const closeDrawer = vi.fn();
    render(<Drawer open onClose={closeDrawer} slotProps={{ paper: { role: 'dialog' } }}><Form /></Drawer>);
    const message = screen.getByRole('textbox', { name: 'Message' });
    await user.type(message, 'Welcome @');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(message).toHaveValue('Welcome @');
    expect(closeDrawer).not.toHaveBeenCalled();

    await user.keyboard('class');
    await user.click(screen.getByRole('option', { name: /class name/i }));
    await user.keyboard('!');
    expect(message).toHaveValue('Welcome {{class_name}}!');
  });

  it('leaves an ordinary email address as literal message text', async () => {
    const user = userEvent.setup();
    render(<Form />);
    const message = screen.getByRole('textbox', { name: 'Message' });
    await user.type(message, 'Contact class@school.example');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(message).toHaveValue('Contact class@school.example');
  });
});
