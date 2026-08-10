import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import {
  AdmissionInquiryChannel,
  AdmissionCrmFormFieldType,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import type { AdmissionCrmFormTemplateDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { InquiryFormTemplatePreviewDialog } from './inquiry-form-template-preview';

const template: AdmissionCrmFormTemplateDto = {
  id: 'template-1',
  academicYearId: 'year-1',
  templateName: 'Open Day Inquiry',
  description: 'Start your school journey.',
  channel: AdmissionInquiryChannel.SchoolWebsiteForm,
  isPublic: true,
  isActive: false,
  consentText: 'The school may contact me.',
  privacyNoticeUrl: 'https://school.example/privacy',
  localizations: {
    gu: {
      templateName: 'ઓપન ડે પૂછપરછ',
      description: 'તમારી શાળાની યાત્રા શરૂ કરો.',
      consentText: 'શાળા મારો સંપર્ક કરી શકે છે.',
    },
  },
  fields: [
    {
      key: 'campus',
      label: 'Campus',
      fieldType: AdmissionCrmFormFieldType.Select,
      required: true,
      displayOrder: 10,
      options: ['North', 'South'],
      localizedLabels: { gu: 'કેમ્પસ' },
      localizedOptions: { gu: ['ઉત્તર', 'દક્ષિણ'] },
    },
    {
      key: 'transportStop',
      label: 'Transport stop',
      fieldType: AdmissionCrmFormFieldType.Text,
      required: false,
      displayOrder: 20,
      helperText: 'Enter the nearest stop.',
      visibleWhenFieldKey: 'campus',
      visibleWhenValue: 'North',
      localizedLabels: { gu: 'પરિવહન સ્ટોપ' },
      localizedHelperTexts: { gu: 'નજીકનું સ્ટોપ દાખલ કરો.' },
    },
  ],
};

describe('InquiryFormTemplatePreviewDialog', () => {
  it('renders draft status, localized parent copy, conditional fields, and mobile mode', () => {
    render(<InquiryFormTemplatePreviewDialog template={template} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Parent Form Preview' })).toBeInTheDocument();
    expect(screen.getByText('Draft / Not Published')).toBeInTheDocument();
    expect(screen.getByText('School Admissions')).toBeInTheDocument();
    expect(screen.getByText('Open Day Inquiry')).toBeInTheDocument();
    expect(screen.queryByLabelText('Transport stop')).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Preview Language' }));
    fireEvent.click(screen.getByRole('option', { name: 'Gujarati' }));

    expect(screen.getByText('ઓપન ડે પૂછપરછ')).toBeInTheDocument();
    const campus = screen.getByRole('combobox', { name: /કેમ્પસ/ });
    fireEvent.mouseDown(campus);
    fireEvent.click(screen.getByRole('option', { name: 'ઉત્તર' }));

    expect(screen.getByLabelText('પરિવહન સ્ટોપ')).toBeInTheDocument();
    expect(screen.getByText('નજીકનું સ્ટોપ દાખલ કરો.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
    expect(screen.getByLabelText('Mobile parent form preview')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Notice' })).toHaveAttribute(
      'href',
      'https://school.example/privacy'
    );
    expect(screen.getByRole('button', { name: 'Submit Inquiry' })).toBeDisabled();
  });

  it('closes from an accessible labeled control', () => {
    const onClose = vi.fn();
    render(<InquiryFormTemplatePreviewDialog template={template} onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close parent form preview' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
