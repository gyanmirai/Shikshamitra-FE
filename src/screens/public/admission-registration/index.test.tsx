import { it, vi, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PublicAdmissionRegistrationScreen from './index';

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
  ApplicationRuntimeFormCore: ({ values, onChange, onSubmit, onSave, readOnly }: any) => (
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
        Continue to review
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
  expiresAt: '2026-11-11T12:00:00Z',
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
afterEach(() => vi.unstubAllGlobals());

it('keeps the registration answers and required uploads in the same public registration flow', async () => {
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
  expect(await screen.findByRole('textbox', { name: 'Student name' })).toHaveValue('Riya');
  expect(screen.getByRole('heading', { name: 'Before You Start' })).toBeVisible();
  expect(
    screen.getByText('Use names from official documents. Fields marked * are required.')
  ).toBeVisible();
  expect(screen.getByText(/Use CAPITAL LETTERS where requested/)).not.toBeVisible();
  expect(
    screen.getByText('Upload clear, complete documents in the Documents step.')
  ).not.toBeVisible();
  expect(screen.getByText(/You can save a draft and return/)).not.toBeVisible();
  const user = userEvent.setup();
  const toggle = screen.getByRole('button', { name: 'View instructions' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  toggle.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('region', { name: 'Hide instructions' })).toBeVisible();
  expect(screen.getByText(/Use CAPITAL LETTERS where requested/)).toBeVisible();
  expect(screen.getByText('Upload clear, complete documents in the Documents step.')).toBeVisible();
  expect(screen.getByText(/You can save a draft and return/)).toBeVisible();
  await user.keyboard(' ');
  await waitFor(() =>
    expect(screen.getByText(/Use CAPITAL LETTERS where requested/)).not.toBeVisible()
  );
  expect(screen.getByRole('button', { name: 'View instructions' })).toHaveFocus();
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Riya');
  fireEvent.click(screen.getByRole('button', { name: 'Continue to review' }));
  expect(await screen.findByRole('heading', { name: 'Birth certificate' })).toBeVisible();
  expect(screen.getByText(/Required.*missing/)).toBeVisible();
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
  const continueButton = await screen.findByRole('button', { name: 'Continue to review' });
  fireEvent.click(screen.getByRole('button', { name: 'View instructions' }));
  expect(await screen.findByRole('region', { name: 'Hide instructions' })).toBeVisible();
  expect(screen.queryByText(/Upload clear, complete documents/)).not.toBeInTheDocument();
  expect(screen.getByText('Review your answers before sending them to school.')).toBeVisible();
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
  expect(await screen.findByText('First school')).toBeVisible();
  expect(screen.getByText('Second school')).toBeVisible();
  expect(screen.getByText('Visible detail')).toBeVisible();
  expect(screen.queryByText('Hidden detail')).not.toBeInTheDocument();
  expect(screen.getByText('School 1')).toBeVisible();
  expect(screen.getByText('School 2')).toBeVisible();
});
