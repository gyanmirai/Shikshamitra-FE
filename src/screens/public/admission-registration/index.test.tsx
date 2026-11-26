import { GlobalIcons } from 'src/utils/icons';
import { it, vi, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionRegistrationScreen from './index';

const responsive = vi.hoisted(() => ({ mobile: false }));
vi.mock('src/hooks/use-responsive', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/hooks/use-responsive')>()),
  useResponsive: () => responsive.mobile,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <div role="dialog">
        {title}
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({
    confirmation: null,
    requestNavigation: (action: () => void) => action(),
  }),
}));
vi.mock('src/screens/student/admissions/application-detail/application-runtime-form', () => ({
  ApplicationRuntimeFormCore: ({
    values,
    onChange,
    onSubmit,
    onSave,
    readOnly,
    saveLabel,
    submitLabel,
    editableFieldCodes,
    onPhotoReadingChange,
  }: any) => (
    <>
      <input
        aria-label="Student name"
        value={values.NAME || ''}
        disabled={readOnly}
        onChange={(event) => onChange('NAME', event.target.value)}
      />
      <button type="button" onClick={onSave}>
        {saveLabel ?? 'Save draft'}
      </button>
      <button type="button" onClick={onSubmit}>
        {submitLabel ?? 'Continue'}
      </button>
      {editableFieldCodes.includes('PHOTO') && (
        <>
          <button type="button" onClick={() => onPhotoReadingChange(true)}>
            Start framing
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('PHOTO', 'data:image/png;base64,iVBORw0KGgo=');
              onPhotoReadingChange(false);
            }}
          >
            Confirm framed photo
          </button>
          <output aria-label="Photo answer">{values.PHOTO}</output>
        </>
      )}
    </>
  ),
}));
const context = {
  schoolName: 'Test School',
  applicantName: 'Riya',
  applicationNumber: 'APP-1',
  purpose: 'initial',
  status: 'Invited',
  expiresAt: '2026-11-27T10:40:00Z',
  snapshotToken: 'original-snapshot',
  canEdit: true,
  canHandIn: true,
  notes: null,
  definition: {
    name: 'Registration',
    layoutType: 0,
    sections: [
      {
        id: 's',
        code: 's',
        name: 'Student Details',
        displayOrder: 0,
        fields: [
          {
            id: 'n',
            code: 'NAME',
            label: 'Student name',
            fieldType: 0,
            required: true,
            displayOrder: 0,
          },
        ],
      },
    ],
  },
  values: [{ fieldCode: 'NAME', valueJson: '"Riya"' }],
  editableFieldCodes: ['NAME'],
  documents: [],
  proposalOnly: false,
};
afterEach(() => {
  vi.unstubAllGlobals();
  responsive.mobile = false;
});

it('retains the framed photo answer when the photo field completes during its interaction lock', async () => {
  const section = context.definition.sections[0];
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            ...context,
            editableFieldCodes: ['NAME', 'PHOTO'],
            definition: {
              ...context.definition,
              sections: [
                {
                  ...section,
                  fields: [
                    ...section.fields,
                    {
                      id: 'p',
                      code: 'PHOTO',
                      label: 'Student photo',
                      fieldType: 0,
                      required: false,
                      displayOrder: 1,
                      validationJson: '{"format":"photo"}',
                    },
                  ],
                },
              ],
            },
          })
        )
    )
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PublicAdmissionRegistrationScreen token="private" />
    </ThemeProvider>
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole('checkbox', { name: /I have read these instructions/ }));
  await user.click(screen.getByRole('button', { name: 'Continue to application form' }));
  await user.click(await screen.findByRole('button', { name: 'Start framing' }));
  await user.click(screen.getByRole('button', { name: 'Confirm framed photo' }));
  expect(screen.getByLabelText('Photo answer')).toHaveTextContent(
    'data:image/png;base64,iVBORw0KGgo='
  );
});

it('gates the application behind the instructions and acknowledgment without losing the existing flow', async () => {
  const withDocuments = {
    ...context,
    documents: [
      {
        stageInstanceId: 'docs',
        code: 'BIRTH',
        name: 'Birth certificate',
        description: null,
        isRequired: true,
        status: 'missing',
        allowedExtensions: ['pdf'],
        maxFileSizeMb: 5,
        canUpload: true,
        evidence: [],
      },
    ],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async () => new Response(JSON.stringify(withDocuments)))
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PublicAdmissionRegistrationScreen token="private" />
    </ThemeProvider>
  );
  expect(await screen.findByRole('heading', { name: 'Before You Start' })).toBeVisible();
  expect(screen.queryByRole('textbox', { name: 'Student name' })).not.toBeInTheDocument();
  expect(screen.getByText('Registration link')).toBeVisible();
  expect(screen.getByText(/Expires/)).toBeVisible();
  expect(screen.getByText('Upload clear documents in the Documents step.')).toBeVisible();
  expect(
    screen.getByText('Upload legible, complete and valid documents in the Documents step.')
  ).toBeVisible();
  const acknowledgment = screen.getByRole('checkbox', {
    name: 'I have read these instructions and am ready to continue.',
  });
  const enterForm = screen.getByRole('button', { name: 'Continue to application form' });
  expect(enterForm).toBeDisabled();
  expect(screen.queryByText(/You can save a draft and return/)).not.toBeInTheDocument();
  expect(screen.queryByText(/The form opens after you confirm/)).not.toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(acknowledgment);
  expect(enterForm).toBeEnabled();
  await user.click(enterForm);

  expect(await screen.findByRole('textbox', { name: 'Student name' })).toHaveValue('Riya');
  expect(screen.queryByRole('heading', { name: 'Before You Start' })).not.toBeInTheDocument();
  expect(document.querySelector('.MuiStepper-horizontal')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByRole('heading', { name: 'Birth certificate' })).toBeVisible();
  expect(screen.getByText('Missing', { exact: true })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Upload document' })).toBeVisible();
});

it('saves before review and hands in without a staff submit endpoint; hand-in locks the page', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(context)))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ ...context, snapshotToken: 'saved-snapshot' }))
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...context, status: 'ReadyForReview', canEdit: false, canHandIn: false })
      )
    );
  vi.stubGlobal('fetch', fetcher);
  render(<PublicAdmissionRegistrationScreen token="private" />);
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole('checkbox', {
      name: 'I have read these instructions and am ready to continue.',
    })
  );
  await user.click(screen.getByRole('button', { name: 'Continue to application form' }));
  const continueButton = await screen.findByRole('button', { name: 'Continue' });
  fireEvent.click(continueButton);
  fireEvent.click(await screen.findByRole('button', { name: 'Send to school' }));
  await screen.findByText('Sent to school');
  expect(screen.queryByRole('heading', { name: 'Before You Start' })).not.toBeInTheDocument();
  expect(fetcher.mock.calls.map(([url]) => url.split('/').at(-1))).toEqual([
    'admission-registration',
    'draft',
    'hand-in',
  ]);
  expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({
    snapshotToken: 'saved-snapshot',
  });
});

it('uses an inline mobile picker, keeps a failed upload retryable, and separates saved file actions', async () => {
  responsive.mobile = true;
  const birthCertificate = {
    stageInstanceId: 'docs',
    code: 'BIRTH',
    name: 'Birth certificate',
    isRequired: true,
    status: 'missing',
    allowedExtensions: ['pdf'],
    maxFileSizeMb: 10,
    canUpload: true,
    evidence: [],
  };
  const fixture = { ...context, documents: [birthCertificate] };
  const saved = {
    ...fixture,
    documents: [
      {
        ...birthCertificate,
        status: 'pendingReview',
        evidence: [
          {
            id: 'saved-file',
            fileName: 'birth-certificate.pdf',
            versionNumber: 1,
            contentType: 'application/pdf',
            canDownload: true,
          },
        ],
      },
    ],
  };
  const uploadKeys: FormDataEntryValue[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/branding/logo')) return new Response(null, { status: 204 });
      if (url.endsWith('/documents/docs/BIRTH')) {
        const key = (init?.body as FormData).get('idempotencyKey');
        if (key) uploadKeys.push(key);
        if (uploadKeys.length === 1) {
          return new Response(JSON.stringify({ detail: 'Could not upload. Try again.' }), {
            status: 500,
          });
        }
        return new Response(JSON.stringify(saved));
      }
      return new Response(JSON.stringify(fixture));
    })
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PublicAdmissionRegistrationScreen token="private" />
    </ThemeProvider>
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole('checkbox', { name: 'I have read the instructions' }));
  await user.click(screen.getByRole('button', { name: 'Start Registration' }));
  expect(screen.getByRole('button', { name: 'Draft' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Continue' }));

  expect(await screen.findByRole('button', { name: 'Choose a file' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Upload file' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'View attachments' })).toBeVisible();
  expect(screen.getByText('No files attached yet')).toBeVisible();
  expect(screen.getByText('PDF · Up to 10 MB')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Upload selected file' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  fireEvent.change(fileInput, {
    target: { files: [new File(['txt'], 'invalid.txt', { type: 'text/plain' })] },
  });
  expect(await screen.findByText('Choose a JPG, PNG or PDF document.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Upload selected file' })).toBeDisabled();

  fireEvent.change(fileInput, {
    target: { files: [new File(['pdf'], 'birth-certificate.pdf', { type: 'application/pdf' })] },
  });
  const upload = screen.getByRole('button', { name: 'Upload selected file' });
  await waitFor(() => expect(upload).toBeEnabled());
  expect(uploadKeys).toHaveLength(0);
  await user.click(upload);
  expect(await screen.findByText('Could not upload. Try again.')).toBeVisible();
  await user.click(upload);

  expect(await screen.findByText('1 file attached')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'View attachments' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Upload file' })).toBeVisible();
  expect(screen.getByText('Uploaded', { exact: true })).toBeVisible();
  expect(screen.getByText(/Awaiting school review/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Preview birth-certificate.pdf' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Download birth-certificate.pdf' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  expect(uploadKeys).toEqual([uploadKeys[0], uploadKeys[0]]);

  await user.click(screen.getByRole('button', { name: 'Replace document' }));
  expect(screen.getByRole('button', { name: 'Choose a file' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'View attachments' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Cancel replacement' }));
  expect(screen.queryByRole('button', { name: 'Choose a file' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByRole('heading', { name: 'Review and Send' })).toBeVisible();
  const editDocuments = screen.getByRole('button', { name: 'Edit Documents' });
  expect(editDocuments).not.toHaveTextContent('Edit');
  expect(editDocuments.querySelector('[data-icon]')).toHaveAttribute('data-icon', GlobalIcons.edit);
});

it('retains local answers on conflict and requires an explicit reload', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(context)))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: 'Admissions.ParentRegistration.Conflict',
            message: 'The school changed this form.',
          },
        }),
        { status: 409 }
      )
    );
  vi.stubGlobal('fetch', fetcher);
  render(<PublicAdmissionRegistrationScreen token="private" />);
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole('checkbox', {
      name: 'I have read these instructions and am ready to continue.',
    })
  );
  await user.click(screen.getByRole('button', { name: 'Continue to application form' }));
  fireEvent.change(await screen.findByRole('textbox', { name: 'Student name' }), {
    target: { value: 'My unsaved answer' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('My unsaved answer')
  );
  expect(await screen.findByRole('button', { name: 'Reload latest form' })).toBeVisible();
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('clearly identifies an unavailable or expired registration link', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'Admissions.ParentRegistration.Unavailable' } }),
          { status: 404 }
        )
      )
  );
  render(<PublicAdmissionRegistrationScreen token="private" />);
  expect(
    await screen.findByRole('heading', { name: 'Registration link unavailable or expired' })
  ).toBeVisible();
  expect(screen.getByText(/Ask the school for a new registration link/)).toBeVisible();
});

it('reviews repeated answers in each visible row and honors row conditions', async () => {
  const repeated = {
    ...context,
    canEdit: false,
    canHandIn: false,
    status: 'ReadyForReview',
    definition: {
      ...context.definition,
      sections: [
        {
          id: 'schools',
          code: 'schools',
          name: 'Previous Schools',
          isRepeatable: true,
          entryLabel: 'School',
          fields: [
            { id: 'school', code: 'SCHOOL', label: 'School name', fieldType: 0 },
            { id: 'show', code: 'SHOW', label: 'Show details', fieldType: 9 },
            {
              id: 'detail',
              code: 'DETAIL',
              label: 'Additional detail',
              fieldType: 0,
              visibilityRuleJson: JSON.stringify({
                field: 'SHOW',
                operator: 'equals',
                value: 'true',
              }),
            },
          ],
        },
      ],
    },
    values: [
      {
        fieldCode: 'SCHOOL',
        valueJson: JSON.stringify(JSON.stringify(['First school', 'Second school'])),
      },
      { fieldCode: 'SHOW', valueJson: JSON.stringify(JSON.stringify(['true', 'false'])) },
      {
        fieldCode: 'DETAIL',
        valueJson: JSON.stringify(JSON.stringify(['Visible detail', 'Hidden detail'])),
      },
    ],
    editableFieldCodes: ['SCHOOL', 'SHOW', 'DETAIL'],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async () => new Response(JSON.stringify(repeated)))
  );
  render(<PublicAdmissionRegistrationScreen token="private" />);
  const previousSchoolsToggle = await screen.findByRole('button', {
    name: 'Expand Previous Schools',
  });
  expect(previousSchoolsToggle).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(previousSchoolsToggle);
  expect(await screen.findByText('First school')).toBeVisible();
  expect(screen.getByText('Second school')).toBeVisible();
  expect(screen.getByText('Visible detail')).toBeVisible();
  expect(screen.queryByText('Hidden detail')).not.toBeInTheDocument();
  expect(screen.getByText('School 1')).toBeVisible();
  expect(screen.getByText('School 2')).toBeVisible();
});

it.each([
  [23, 'Link expires in less than a day'],
  [-1, 'Registration link expired'],
])('handles a link with %i hours left when no institute logo is configured', async (hours, label) => {
  responsive.mobile = true;
  const fixture = {
    ...context,
    expiresAt: new Date(Date.now() + hours * 3_600_000).toISOString(),
    documents: [{ code: 'BIRTH' }],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.endsWith('/branding/logo')
        ? new Response(null, { status: 204 })
        : new Response(JSON.stringify(fixture))
    )
  );
  render(<PublicAdmissionRegistrationScreen token="private" />);

  expect(await screen.findByText('Test School')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText(label)).toBeVisible();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  expect(screen.getByText('Keep your documents ready.')).toBeVisible();
});

it('uses one mobile progress indicator for a long conditional form and returns to review after editing', async () => {
  responsive.mobile = true;
  const visibleSections = Array.from({ length: 5 }, (_, index) => ({
    id: `section-${index}`,
    code: `SECTION_${index}`,
    name: `Section ${index + 1}`,
    displayOrder: index + 1,
    fields: [
      {
        id: `field-${index}`,
        code: `FIELD_${index}`,
        label: `Answer ${index + 1}`,
        fieldType: 0,
        displayOrder: 0,
      },
    ],
  }));
  const fixture = {
    ...context,
    applicantName: 'Riya Shah',
    expiresAt: new Date(Date.now() + 6.5 * 86_400_000).toISOString(),
    definition: {
      ...context.definition,
      layoutType: 1,
      sections: [
        ...context.definition.sections,
        ...visibleSections,
        {
          ...visibleSections[0],
          id: 'hidden',
          code: 'HIDDEN',
          name: 'Hidden section',
          visibilityRuleJson: JSON.stringify({
            field: 'NAME',
            operator: 'equals',
            value: 'Hidden',
          }),
        },
      ],
    },
  };
  const fetcher = vi.fn().mockImplementation(async (url: string, init) => {
    if (url.endsWith('/branding/logo')) {
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { 'Content-Type': 'image/png' },
      });
    }
    const input = init?.body ? JSON.parse(init.body) : undefined;
    if (input?.values.length) fixture.values = input.values;
    return new Response(JSON.stringify(fixture));
  });
  vi.stubGlobal('fetch', fetcher);
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL: vi.fn(() => 'blob:institute-logo'),
      revokeObjectURL: vi.fn(),
    })
  );
  const user = userEvent.setup();
  render(<PublicAdmissionRegistrationScreen token="private" />);
  const start = await screen.findByRole('button', { name: 'Start Registration' });
  expect(screen.getByRole('heading', { name: 'Registration form' })).toBeVisible();
  expect(await screen.findByRole('img', { name: 'Test School logo' })).toHaveAttribute(
    'src',
    'blob:institute-logo'
  );
  expect(screen.getByRole('heading', { name: 'Riya Shah' })).toBeVisible();
  expect(screen.queryByText('Student', { exact: true })).not.toBeInTheDocument();
  expect(screen.getByText('Link expires in 7 days')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Instructions' })).toBeVisible();
  expect(screen.getByRole('list').tagName).toBe('OL');
  expect(screen.queryByText('Keep your documents ready.')).not.toBeInTheDocument();
  const logoRequest = fetcher.mock.calls.find(([url]) => url.endsWith('/branding/logo'));
  expect(logoRequest?.[1].headers.get('X-Admission-Registration-Token')).toBe('private');
  expect(logoRequest?.[1].credentials).toBe('omit');
  expect(start).toBeDisabled();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(
    screen.queryByText('Register your child at DDVS in a few simple steps.')
  ).not.toBeInTheDocument();
  await user.hover(screen.getByRole('button', { name: 'Registration form information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Register your child in a few simple steps.'
  );
  expect(screen.getByRole('tooltip')).not.toHaveTextContent('DDVS');
  await user.unhover(screen.getByRole('button', { name: 'Registration form information' }));
  await user.hover(screen.getByRole('button', { name: 'Instructions information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Keep the following ready to complete the registration smoothly.'
  );
  await user.unhover(screen.getByRole('button', { name: 'Instructions information' }));
  await user.click(screen.getByRole('checkbox', { name: 'I have read the instructions' }));
  await user.click(start);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 1 of 7');
  expect(screen.queryByRole('list', { name: 'Registration steps' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { name: 'Review and Send' });
  expect(screen.getByRole('heading', { name: 'Riya Shah' })).toBeVisible();
  expect(
    screen.queryByText('Check your answers and documents before sending.')
  ).not.toBeInTheDocument();
  await user.hover(screen.getByRole('button', { name: 'Review and Send information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Check your answers and documents before sending to the school.'
  );
  await user.unhover(screen.getByRole('button', { name: 'Review and Send information' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 7 of 7');
  expect(screen.queryByRole('heading', { name: 'Hidden section' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Edit Section 2' })).not.toBeInTheDocument();
  const studentDetailsToggle = screen.getByRole('button', { name: 'Expand Student Details' });
  expect(studentDetailsToggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByText('Student name', { exact: true })).not.toBeVisible();
  await user.click(studentDetailsToggle);
  expect(studentDetailsToggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Student name', { exact: true })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Collapse Student Details' }));
  const editStudentDetails = screen.getByRole('button', { name: 'Edit Student Details' });
  expect(editStudentDetails).not.toHaveTextContent('Edit');
  expect(editStudentDetails.querySelector('[data-icon]')).toHaveAttribute('data-icon', GlobalIcons.edit);
  await user.click(editStudentDetails);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 1 of 7');
  fireEvent.change(screen.getByRole('textbox', { name: 'Student name' }), {
    target: { value: 'Riya Shah' },
  });
  await user.click(screen.getByRole('button', { name: 'Save & Return to Review' }));
  await screen.findByRole('heading', { name: 'Review and Send' });
  expect(screen.getAllByText('Riya Shah')).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Send to school' })).toBeEnabled();
  expect(fetcher.mock.calls.map(([url]) => url.split('/').at(-1))).toEqual([
    'admission-registration',
    'logo',
    'draft',
    'draft',
  ]);
});
