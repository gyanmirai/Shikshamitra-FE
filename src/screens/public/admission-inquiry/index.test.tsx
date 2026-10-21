import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionInquiryScreen from './index';

vi.mock('src/screens/student/admissions/admission-runtime-field', () => ({
  default: ({
    field,
    value,
    onChange,
  }: {
    field: { label: string };
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label htmlFor={field.label.replace(/\s/g, '-')}>
      {field.label}
      <input
        id={field.label.replace(/\s/g, '-')}
        aria-label={field.label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}));
const offering = {
  id: 'offer-1',
  name: 'Regular',
  code: 'REG',
  boardId: 'board-1',
  boardName: 'CBSE',
  mediumId: 'medium-1',
  mediumName: 'English',
  standardId: 'class-1',
  standardName: 'Class 1',
  canCreateInquiry: true,
};
const context = {
  admissionCycleName: '2026-27',
  source: 0,
  offerings: [offering],
  academicOptions: [offering, { ...offering, standardId: 'class-2', standardName: 'Class 2' }],
};
const form = {
  id: 'form-v1',
  name: 'Offering inquiry form',
  version: 1,
  sections: [
    {
      code: 'details',
      name: 'Your details',
      displayOrder: 0,
      fields: [
        {
          code: 'PUBLIC_APPLICANT_FIRST_NAME',
          label: 'Student name',
          fieldType: 0,
          required: true,
          isIdentityFallback: true,
          displayOrder: 0,
        },
        {
          code: 'PUBLIC_GUARDIAN_FIRST_NAME',
          label: 'Guardian name',
          fieldType: 0,
          required: true,
          isIdentityFallback: true,
          displayOrder: 1,
        },
        {
          code: 'PUBLIC_GUARDIAN_PHONE',
          label: 'Mobile',
          fieldType: 4,
          required: true,
          isIdentityFallback: true,
          displayOrder: 2,
        },
        { code: 'NOTE', label: 'Note', fieldType: 0, required: false, displayOrder: 3 },
      ],
    },
  ],
};
async function select(label: string, name: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name }));
  fireEvent.click(await screen.findByRole('option', { name: label }));
}

describe('public admission availability gate', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options?: RequestInit) => ({
        ok: true,
        json: async () =>
          options?.method === 'POST'
            ? {}
            : url.includes('?offeringId=')
              ? { ...context, form }
              : context,
      }))
    );
  });
  afterEach(() => vi.unstubAllGlobals());
  it('normalizes mixed-case email answers at the public submission boundary', async () => {
    const emailForm = {
      ...form,
      sections: [
        {
          ...form.sections[0],
          fields: [
            ...form.sections[0].fields,
            { code: 'EMAIL', label: 'Email', fieldType: 3, required: false, displayOrder: 4 },
          ],
        },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options?: RequestInit) => ({
        ok: true,
        json: async () =>
          options?.method === 'POST'
            ? {}
            : url.includes('?offeringId=')
              ? { ...context, form: emailForm }
              : context,
      }))
    );
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 1', 'Class');
    await screen.findByRole('textbox', { name: 'Email' });
    [
      ['Student name', 'Riya'],
      ['Guardian name', 'Meera'],
      ['Mobile', '9876543210'],
      ['Email', 'Parent+Public@Example.COM'],
    ].forEach(([name, value]) => {
      fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'POST' })
      )
    );
    const submission = vi
      .mocked(fetch)
      .mock.calls.find(([, options]) => options?.method === 'POST');
    expect(JSON.parse(String(submission?.[1]?.body)).formValues).toContainEqual({
      fieldCode: 'EMAIL',
      valueJson: '"parent+public@example.com"',
    });
  });
  it('denies a class without an open offering before collecting personal details', async () => {
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 2', 'Class');
    expect(screen.getByText('Selected class has no admission open.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Student name' })).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('loads the selected offering form and submits the offering context', async () => {
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    expect(screen.queryByRole('textbox', { name: 'Student name' })).not.toBeInTheDocument();
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 1', 'Class');
    await screen.findByRole('textbox', { name: 'Student name' });
    expect(screen.getAllByText('Admission period: 2026-27')).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('?offeringId=offer-1'),
      expect.anything()
    );
    [
      ['Student name', 'Riya'],
      ['Guardian name', 'Meera'],
      ['Mobile', '9876543210'],
      ['Note', 'Call afternoon'],
    ].forEach(([name, value]) => {
      fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'POST' })
      )
    );
    const { calls } = vi.mocked(fetch).mock;
    const submission = calls.find(([, options]) => options?.method === 'POST');
    expect(JSON.parse(String(submission?.[1]?.body))).toMatchObject({
      admissionOfferingId: 'offer-1',
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'class-1',
      applicantFirstName: 'Riya',
      formValues: [{ fieldCode: 'NOTE', valueJson: '"Call afternoon"' }],
    });
  });
});
