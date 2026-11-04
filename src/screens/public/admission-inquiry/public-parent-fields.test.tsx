import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionInquiryScreen from './index';

const lookup = vi.hoisted(() => ({
  load: vi.fn(() => ({ unwrap: async () => [] })),
  mounted: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
// Only the authenticated transport is replaced; the public screen and runtime renderers are real.
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => {
    lookup.mounted();
    return [lookup.load];
  },
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
};
const field = (code: string, label: string, bindingKey?: string, extra = {}) => ({
  code,
  label,
  bindingKey,
  fieldType: 0,
  required: false,
  readOnly: false,
  displayOrder: 0,
  ...extra,
});
const form = {
  id: 'inquiry-v1',
  name: 'Inquiry Details',
  version: 1,
  sections: [
    {
      code: 'details',
      name: 'Student Details',
      displayOrder: 0,
      fields: [
        field('CHILD', 'Student name', 'Applicant.Name', { required: true }),
        field('PARENT', 'Guardian name', 'Guardian.FirstName', { required: true }),
        field('PHONE', 'Contact number', 'Guardian.Mobile', { required: true }),
        field('PARENT_SINGLE', 'Single-parent child', 'Family.IsSingleParentChild', {
          fieldType: 9,
        }),
        field('CUSTOM', 'Sibling interests'),
      ],
    },
    {
      code: 'internal',
      name: 'Internal Sibling Details',
      displayOrder: 1,
      fields: [
        field('SINGLE_CHILD', 'Single child', undefined, {
          fieldType: 9,
          required: true,
          defaultValue: 'true',
        }),
        field('SIBLINGS', 'Sibling students', 'Family.SiblingStudentIds', {
          fieldType: 7,
          required: true,
          optionsJson: '{"source":"StudentSiblings"}',
          defaultValue: '["student-9"]',
        }),
      ],
    },
  ],
};

async function select(name: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name }));
  fireEvent.click(await screen.findByRole('option', { name: option }));
}

async function openForm() {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PublicAdmissionInquiryScreen token="public-token" />
    </ThemeProvider>
  );
  await screen.findByRole('combobox', { name: 'Board' });
  await select('Board', 'CBSE');
  await select('Medium', 'English');
  await select('Class', 'Class 1');
  await screen.findByRole('textbox', { name: 'Student name' });
}

function completeForm() {
  [
    ['Student name', 'Riya'],
    ['Guardian name', 'Pooja'],
    ['Contact number', '9876543210'],
  ].forEach(([name, value]) => {
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
  });
  fireEvent.click(screen.getByRole('checkbox', { name: /I agree/ }));
}

describe('public parent inquiry with real configured fields', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it.each(['missing', 'throwing'] as const)(
    'submits without an optional request ID when browser randomUUID is %s',
    async (capability) => {
      vi.stubGlobal('crypto', {
        randomUUID:
          capability === 'missing'
            ? undefined
            : () => {
                throw new TypeError('Synthetic crypto capability failure');
              },
      });
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string, options?: RequestInit) => ({
          ok: true,
          json: async () =>
            options?.method === 'POST'
              ? {}
              : {
                  admissionCycleName: '2026',
                  source: 0,
                  offerings: [offering],
                  form: { ...form, sections: [form.sections[0]] },
                },
        }))
      );
      await openForm();
      completeForm();
      fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
      await screen.findByText(/Thank you. Your inquiry has been received/);
      const post = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST');
      const payload = JSON.parse(String(post?.[1]?.body));
      expect(payload).not.toHaveProperty('requestId');
      expect(
        screen.queryByText(/randomUUID|Synthetic crypto capability failure/)
      ).not.toBeInTheDocument();
    }
  );

  it('omits sibling controls, required values and empty sections without mounting the staff lookup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => ({
        ok: true,
        json: async () =>
          options?.method === 'POST'
            ? {}
            : { admissionCycleName: '2026', source: 0, offerings: [offering], form },
      }))
    );
    await openForm();
    expect(screen.queryByRole('checkbox', { name: /^Single child/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^Sibling students/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Internal Sibling Details')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Single-parent child' })).toBeInTheDocument();
    expect(screen.getByText('Single-parent child')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Sibling interests' })).toBeVisible();
    completeForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await screen.findByText(/Thank you. Your inquiry has been received/);
    const post = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST');
    const payload = JSON.parse(String(post?.[1]?.body));
    expect(payload.formValues.map(({ fieldCode }: { fieldCode: string }) => fieldCode)).toEqual([
      'CHILD',
      'PARENT',
      'PHONE',
      'PARENT_SINGLE',
      'CUSTOM',
    ]);
    expect(lookup.mounted).not.toHaveBeenCalled();
    expect(lookup.load).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.every(([url]) => String(url).includes('/public/admission-inquiries/'))
    ).toBe(true);
  });

  it('reuses a UUID on exact failed retry and changes it when the submitted payload changes', async () => {
    const submissions: Record<string, unknown>[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        if (options?.method === 'POST') {
          submissions.push(JSON.parse(String(options.body)));
          return {
            ok: false,
            json: async () => ({ error: { message: 'Please retry your inquiry.' } }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            admissionCycleName: '2026',
            source: 0,
            offerings: [offering],
            form: { ...form, sections: [form.sections[0]] },
          }),
        };
      })
    );
    await openForm();
    completeForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await screen.findByText('Please retry your inquiry.');
    expect(submissions[0].requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() => expect(submissions).toHaveLength(2));
    await screen.findByRole('button', { name: 'Send inquiry' });
    expect(submissions[1].requestId).toBe(submissions[0].requestId);
    fireEvent.change(screen.getByRole('textbox', { name: 'Sibling interests' }), {
      target: { value: 'Music' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() => expect(submissions).toHaveLength(3));
    expect(submissions[2].requestId).not.toBe(submissions[1].requestId);
  });
});
