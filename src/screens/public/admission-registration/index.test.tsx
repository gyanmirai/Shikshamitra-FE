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

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
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
    guidedNavigation,
    submitLabel,
  }: any) => (
    <>
      <input
        aria-label="Student name"
        value={values.NAME || ''}
        disabled={readOnly}
        onChange={(event) => onChange('NAME', event.target.value)}
      />
      <button type="button" onClick={onSave}>
        Save draft
      </button>
      <button type="button" onClick={onSubmit}>
        {guidedNavigation ? submitLabel : 'Continue to review'}
      </button>
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
  fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }));
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
  const continueButton = await screen.findByRole('button', { name: 'Continue to review' });
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
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
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
  const fetcher = vi.fn().mockImplementation(async (_url, init) => {
    const input = init?.body ? JSON.parse(init.body) : undefined;
    if (input?.values.length) fixture.values = input.values;
    return new Response(JSON.stringify(fixture));
  });
  vi.stubGlobal('fetch', fetcher);
  const user = userEvent.setup();
  render(<PublicAdmissionRegistrationScreen token="private" />);
  const start = await screen.findByRole('button', { name: 'Start Registration' });
  expect(start).toBeDisabled();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(
    screen.queryByText('Register your child at DDVS in a few simple steps.')
  ).not.toBeInTheDocument();
  await user.hover(screen.getByRole('button', { name: 'Complete Registration information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Register your child in a few simple steps.'
  );
  expect(screen.getByRole('tooltip')).not.toHaveTextContent('DDVS');
  await user.unhover(screen.getByRole('button', { name: 'Complete Registration information' }));
  await user.hover(screen.getByRole('button', { name: 'Before You Start information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Keep the following ready to complete the registration smoothly.'
  );
  await user.unhover(screen.getByRole('button', { name: 'Before You Start information' }));
  await user.click(screen.getByRole('checkbox', { name: 'I have read the instructions' }));
  await user.click(start);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Step 1 of 7');
  expect(screen.queryByRole('list', { name: 'Registration steps' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Continue to review' }));
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
  await user.click(screen.getByRole('button', { name: 'Edit Student Details' }));
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
    'draft',
    'draft',
  ]);
});
