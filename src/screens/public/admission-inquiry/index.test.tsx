import { shikshaMitraToast } from 'src/components/toast';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionInquiryScreen from './index';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

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
          code: 'CHILD',
          bindingKey: 'Applicant.Name',
          label: 'Student name',
          fieldType: 0,
          required: true,

          displayOrder: 0,
        },
        {
          code: 'PARENT',
          bindingKey: 'Guardian.FirstName',
          label: 'Guardian name',
          fieldType: 0,
          required: true,

          displayOrder: 1,
        },
        {
          code: 'MOBILE',
          bindingKey: 'Guardian.Mobile',
          label: 'Mobile',
          fieldType: 4,
          required: true,

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
    vi.clearAllMocks();
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
  it('keeps public Guardian pending school confirmation and never relabels a previous parent', async () => {
    const roleForm = {
      ...form,
      sections: [
        {
          ...form.sections[0],
          fields: [
            ...form.sections[0].fields,
            {
              code: 'ROLE',
              bindingKey: 'Inquiry.ParentRelationship',
              label: 'Primary contact',
              fieldType: 6,
              required: true,
              displayOrder: 4,
              optionsJson: JSON.stringify([
                { value: 'father', label: 'Father' },
                { value: 'mother', label: 'Mother' },
                { value: 'guardian', label: 'Guardian' },
              ]),
            },
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
              ? { ...context, form: roleForm }
              : context,
      }))
    );
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 1', 'Class');
    await screen.findByRole('textbox', { name: 'Primary contact' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Primary contact' }), {
      target: { value: 'father' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Guardian name' }), {
      target: { value: 'Raj Shah' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Mobile' }), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Primary contact' }), {
      target: { value: 'guardian' },
    });
    expect(screen.getByRole('textbox', { name: 'Guardian name' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Mobile' })).toHaveValue('');
    expect(screen.getByText(/The school will confirm this guardian/)).toBeVisible();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    [
      ['Student name', 'Riya Shah'],
      ['Guardian name', 'Pooja Shah'],
      ['Mobile', '9123456780'],
    ].forEach(([name, value]) =>
      fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } })
    );
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
    const payload = JSON.parse(String(submission?.[1]?.body));
    expect(payload).toMatchObject({ guardianFirstName: 'Pooja Shah', guardianPhone: '9123456780' });
    expect(payload).not.toHaveProperty('guardianResponsibilityConfirmed');
    expect(payload).not.toHaveProperty('parentRelationship');
    expect(payload.formValues).toContainEqual({ fieldCode: 'ROLE', valueJson: '"guardian"' });
  });
  it('retains an unmapped legacy Full Name answer and reports its missing connection before public POST', async () => {
    const legacyForm = {
      ...form,
      sections: [
        {
          ...form.sections[0],
          fields: [
            {
              code: 'FIELD_1',
              bindingKey: 'FIELD_1',
              bindingType: 1,
              label: 'Full Name',
              fieldType: 0,
              required: true,
              displayOrder: 0,
            },
            {
              code: 'PHONE',
              bindingKey: 'Father.Mobile',
              bindingType: 0,
              label: "Father's mobile",
              fieldType: 4,
              required: false,
              displayOrder: 1,
            },
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
              ? { ...context, form: legacyForm }
              : context,
      }))
    );
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 1', 'Class');
    await screen.findByRole('textbox', { name: 'Full Name' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Full Name' }), {
      target: { value: 'Riya Shah' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: "Father's mobile" }), {
      target: { value: '9876543210' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() =>
      expect(shikshaMitraToast.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            'missing linked fields: Student name, Parent / Guardian name'
          ),
        })
      )
    );
    expect(fetch).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByRole('textbox', { name: 'Full Name' })).toHaveValue('Riya Shah');
  });
  it('submits existing published optional identity questions without requiring republication', async () => {
    const legacyForm = {
      ...form,
      sections: form.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => ({ ...field, required: false })),
      })),
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options?: RequestInit) => ({
        ok: true,
        json: async () =>
          options?.method === 'POST'
            ? {}
            : url.includes('?offeringId=')
              ? { ...context, form: legacyForm }
              : context,
      }))
    );
    render(<PublicAdmissionInquiryScreen token="public-token" />);
    await screen.findByRole('combobox', { name: 'Board' });
    await select('CBSE', 'Board');
    await select('English', 'Medium');
    await select('Class 1', 'Class');
    await screen.findByRole('textbox', { name: 'Student name' });
    [
      ['Student name', 'Riya'],
      ['Guardian name', 'Meera'],
      ['Mobile', '9876543210'],
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
    expect(JSON.parse(String(submission?.[1]?.body))).toMatchObject({
      applicantFirstName: 'Riya',
      guardianFirstName: 'Meera',
      guardianPhone: '9876543210',
    });
  });
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
      formValues: expect.arrayContaining([
        { fieldCode: 'CHILD', valueJson: '"Riya"' },
        { fieldCode: 'PARENT', valueJson: '"Meera"' },
        { fieldCode: 'MOBILE', valueJson: '"9876543210"' },
        { fieldCode: 'NOTE', valueJson: '"Call afternoon"' },
      ]),
    });
  });
});
