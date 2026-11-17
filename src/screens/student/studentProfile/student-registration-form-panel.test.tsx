import type { ReactNode } from 'react';
import type { CustomRecordPayload } from 'src/redux/student/records/student-record-details-api';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  customField,
  customSource,
  customSection,
  customDetails,
  customSnapshot,
} from './student-custom-details-test-fixture';
import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileNavigation,
  profileDetailsPath,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

// Happy DOM does not finish native Web Animations reliably; browser smoke covers motion.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  useReducedMotion: () => true,
}));
const grants = [
  'Students.Records.StudentList.View',
  'Students.Records.Changes.View',
  'Students.Records.Changes.Add',
];
const formPath = '*/api/students/records/:studentId/details/form';
const snapshotPath = '*/api/students/records/:studentId/details/form-snapshot';
let source: ReturnType<typeof customSource>;
let writes: {
  clientKey: string;
  expectedSnapshot: string;
  reason: string;
  payload: CustomRecordPayload;
}[];
let snapshotReads: number;
let failure: boolean;

beforeEach(() => {
  writes = [];
  snapshotReads = 0;
  failure = false;
  source = customSource(
    [
      customSection(
        [
          customField('firstName', 0, {
            label: 'First name',
            bindingType: 0,
            bindingKey: 'StudentFirstName',
            required: true,
          }),
          customField('blood', 0, { label: 'Blood group', required: true }),
          customField('gr', 0, { label: 'Permanent GR', readOnly: true }),
        ],
        { name: 'Offering Registration fields' }
      ),
    ],
    { firstName: 'Aanya', blood: 'B+', gr: 'GR-001' },
    {
      formEditableFieldCodes: ['firstName', 'blood'],
      formMaskedFieldCodes: [],
      capturedFieldCodes: ['blood'],
      editableFieldCodes: ['blood'],
    }
  );
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () =>
      HttpResponse.json({
        data: { ...customDetails([source]), studentId: profileStudentId, formSources: [source] },
      })
    ),
    http.get(snapshotPath, () => {
      snapshotReads += 1;
      return HttpResponse.json({ ...customSnapshot([source]), section: 'registration-form' });
    }),
    http.put(formPath, async ({ request }) => {
      const body = (await request.json()) as (typeof writes)[number];
      writes.push(body);
      if (failure) return HttpResponse.json({ detail: 'Save failed' }, { status: 409 });
      source = { ...source, currentValues: body.payload.sources[0].values };
      return HttpResponse.json({
        id: 'direct-save',
        status: 'Applied',
        section: 'registration-form',
      });
    }),
    http.get('*/api/students/records/changes', () =>
      HttpResponse.json({ data: { items: [], totalCount: 0 } })
    )
  );
});
const open = async (permissions = grants) => {
  renderStudentProfile(profileStudentId, permissions);
  await screen.findByText('Aanya Patel');
  await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
  await screen.findByRole('textbox', { name: /Blood group/ });
};
const edit = async () => {
  await open();
  await userEvent.click(screen.getByRole('button', { name: 'Edit Offering Registration fields' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Blood group/ })).toBeEnabled());
};
const set = (name: string, value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: new RegExp(name) }), { target: { value } });

it('opens the existing editable form once from the Student List details shortcut', async () => {
  profileNavigation.query = '?view=details&edit=details';
  renderStudentProfile(profileStudentId, grants);
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Blood group/ })).toBeEnabled());
  expect(snapshotReads).toBe(1);
  expect(writes).toHaveLength(0);
  await userEvent.click(screen.getByRole('button', { name: /^Cancel changes to / }));
  expect(
    await screen.findByRole('button', { name: 'Edit Offering Registration fields' })
  ).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toBeDisabled();
  expect(snapshotReads).toBe(1);
  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
    'href',
    '/student/profile?view=overview'
  );
});

it('keeps saved fields visible while the editable section snapshot loads', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(snapshotPath, async () => {
      await pending;
      return HttpResponse.json({ ...customSnapshot([source]), section: 'registration-form' });
    })
  );
  await open();
  await userEvent.click(screen.getByRole('button', { name: 'Edit Offering Registration fields' }));
  try {
    expect(
      await screen.findByRole('progressbar', { name: 'Loading editable section' })
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Aanya');
    expect(screen.getByRole('textbox', { name: /First name/ })).toBeDisabled();
  } finally {
    release();
  }
  await waitFor(() => expect(screen.getByRole('textbox', { name: /First name/ })).toBeEnabled());
  expect(await screen.findByRole('button', { name: /^Save / })).toBeVisible();
});

it('does not fetch an editing snapshot from a shortcut without edit permission', async () => {
  profileNavigation.query = '?view=details&edit=details';
  renderStudentProfile(profileStudentId, ['Students.Records.StudentList.View']);
  expect(await screen.findByRole('textbox', { name: /Blood group/ })).toBeDisabled();
  expect(screen.queryByRole('button', { name: /^Save / })).not.toBeInTheDocument();
  expect(snapshotReads).toBe(0);
});

it('keeps a summary-only record read-only even with staff edit grants and an edit shortcut', async () => {
  mswServer.use(
    http.get(profileDetailsPath, () =>
      HttpResponse.json({
        data: {
          ...customDetails([source]),
          studentId: profileStudentId,
          recordsAccess: 'Summary',
          formSources: [source],
        },
      })
    )
  );
  profileNavigation.query = '?view=details&edit=details';
  renderStudentProfile(profileStudentId, grants);
  expect(await screen.findByRole('textbox', { name: /Blood group/ })).toBeDisabled();
  expect(screen.queryByRole('button', { name: /^Save / })).not.toBeInTheDocument();
  expect(snapshotReads).toBe(0);
});

it('renders original offering fields in their form order with protected fields read-only and no edit-time snapshot on viewing', async () => {
  await open();
  expect(screen.queryByRole('heading', { name: source.formName })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Edit Details' })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Aanya');
  expect(screen.getByRole('textbox', { name: 'Permanent GR' })).toHaveValue('GR-001');
  expect(screen.getByRole('textbox', { name: 'Permanent GR' })).toBeDisabled();
  expect(snapshotReads).toBe(0);
  expect(screen.queryByRole('link', { name: 'Request change' })).not.toBeInTheDocument();
});

it('explains the saved form section by keyboard without fetching an edit snapshot or changing answers', async () => {
  await open();
  const help = screen.getByRole('button', { name: `${source.formName} information` });
  await userEvent.keyboard('{Tab}');
  act(() => help.focus());
  expect(help).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Saved responses from this registration form, with restricted fields controlled by your current record access.'
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  expect(screen.queryByRole('heading', { name: source.formName })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('B+');
  expect(screen.getByRole('textbox', { name: 'Permanent GR' })).toBeDisabled();
  expect(snapshotReads).toBe(0);
  expect(writes).toHaveLength(0);
});

it('clears and edits permitted dependent fields across sections while preserving unrelated values', async () => {
  source = customSource(
    [
      customSection([customField('country', 0, { label: 'Country' })], {
        id: 'country',
        code: 'COUNTRY',
        name: 'Country details',
      }),
      customSection(
        [
          customField('state', 0, {
            label: 'State',
            optionsJson: JSON.stringify({ source: 'States', parentField: 'country' }),
          }),
        ],
        { id: 'region', code: 'REGION', name: 'Region details', displayOrder: 1 }
      ),
      customSection([customField('note', 0, { label: 'Unrelated note' })], {
        id: 'note',
        code: 'NOTE',
        name: 'Other details',
        displayOrder: 2,
      }),
    ],
    { country: 'India', state: 'Gujarat', note: 'Keep this value' },
    { formEditableFieldCodes: ['country', 'state', 'note'] }
  );
  mswServer.use(
    http.get('*/api/students/records/:studentId/details/options', () =>
      HttpResponse.json({ data: [] })
    )
  );
  profileNavigation.query = '?view=details';
  renderStudentProfile(profileStudentId, grants);
  await userEvent.click(await screen.findByRole('button', { name: 'Edit Country details' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'State' })).toBeEnabled());
  set('Country', 'Nepal');
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'State' })).toHaveValue(''));
  expect(screen.getByRole('textbox', { name: 'Unrelated note' })).toBeDisabled();
  expect(screen.getAllByRole('textbox', { name: /Reason for change/ })).toHaveLength(1);
  set('State', 'Bagmati');
  set('Reason for change', 'Corrected address');
  await userEvent.click(screen.getByRole('button', { name: 'Save Region details' }));
  expect(await screen.findByRole('button', { name: 'Edit Country details' })).toBeVisible();
  expect(writes[0].payload.sources[0].values).toEqual({
    country: 'Nepal',
    state: 'Bagmati',
    note: 'Keep this value',
  });
}, 15000);

it('applies mapped and custom edits in one direct audited save, stays in Details and preserves submitted originals', async () => {
  const original = structuredClone(source.originalValues);
  await edit();
  set('First name', 'Anita');
  set('Blood group', 'O+');
  set('Reason for change', 'Verified school correction');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  await screen.findByRole('button', { name: 'Edit Offering Registration fields' });
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({
    expectedSnapshot: 'frozen-snapshot-1',
    reason: 'Verified school correction',
    payload: { sources: [{ values: { firstName: 'Anita', blood: 'O+', gr: 'GR-001' } }] },
  });
  expect(writes[0].clientKey).toBeTruthy();
  expect(source.originalValues).toEqual(original);
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('O+');
  expect(new URLSearchParams(profileNavigation.query).get('view')).toBe('details');
  expect(
    profileNavigation.push.mock.calls.every(([url]) => !url.includes('/records/changes'))
  ).toBe(true);
});

it('validates fields and reason before making a direct save', async () => {
  await edit();
  set('First name', '');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  expect(await screen.findByText(/Review the highlighted fields/)).toBeVisible();
  expect(writes).toHaveLength(0);
  set('First name', 'Anita');
  set('Blood group', 'O+');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  expect(await screen.findByText(/at least 3 characters/)).toBeVisible();
  expect(writes).toHaveLength(0);
});

it('edits and saves only the selected section, keeping other steps read-only and preserving their values', async () => {
  const { fields } = source.definition!.sections[0];
  source.definition = {
    ...source.definition!,
    layoutType: 1,
    sections: [
      customSection(
        fields.filter((field) => field.code !== 'blood'),
        {
          id: 'identity',
          code: 'IDENTITY',
          name: 'Student identity',
          stepId: 'identity',
          stepName: 'Student Profile',
          stepDisplayOrder: 0,
        }
      ),
      customSection(
        fields.filter((field) => field.code === 'blood'),
        {
          id: 'health',
          code: 'HEALTH',
          name: 'Health details',
          stepId: 'health',
          stepName: 'Health Details',
          stepDisplayOrder: 1,
        }
      ),
    ],
  };
  const original = structuredClone(source.originalValues);
  profileNavigation.query = '?view=details';
  renderStudentProfile(profileStudentId, grants);
  await userEvent.click(await screen.findByRole('button', { name: 'Health Details' }));
  await userEvent.click(screen.getByRole('button', { name: 'Edit Health details' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Blood group/ })).toBeEnabled());
  expect(screen.getByRole('button', { name: 'Health Details' })).toHaveAttribute(
    'aria-current',
    'step'
  );
  set('Blood group', '');
  set('Reason for change', 'Verified school correction');
  await userEvent.click(screen.getByRole('button', { name: 'Save Health details' }));
  expect(await screen.findByText(/Review the highlighted fields/)).toBeVisible();
  expect(writes).toHaveLength(0);
  await userEvent.click(screen.getByRole('button', { name: 'Student Profile' }));
  expect(screen.getByRole('textbox', { name: /First name/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Edit Student identity' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Health Details' }));
  set('Blood group', 'O+');
  await userEvent.click(screen.getByRole('button', { name: 'Save Health details' }));
  expect(await screen.findByRole('button', { name: 'Edit Health details' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Health Details' })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].payload.sources[0].values).toMatchObject({
    firstName: 'Aanya',
    blood: 'O+',
    gr: 'GR-001',
  });
  expect(source.originalValues).toEqual(original);
}, 15000);

it('retains a failed draft and guards cancellation until discard is confirmed', async () => {
  failure = true;
  await edit();
  set('Blood group', 'O+');
  set('Reason for change', 'Verified correction');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  expect(await screen.findByText(/Your draft has been kept/)).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('O+');
  await userEvent.click(screen.getByRole('button', { name: /^Cancel changes to / }));
  const confirmation = await screen.findByRole('dialog');
  await userEvent.click(within(confirmation).getByRole('button', { name: /Discard changes/ }));
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('B+');
  expect(source.originalValues.blood).toBe('B+');
});

it('keeps section Save and Cancel reachable when an edit hides its own section', async () => {
  source.definition!.sections[0].visibilityRuleJson = JSON.stringify({
    field: 'firstName',
    operator: 'equals',
    value: 'Aanya',
  });
  await edit();
  set('First name', 'Anita');
  expect(await screen.findByText('No visible fields in this section.')).toBeVisible();
  expect(screen.getByRole('button', { name: /^Save / })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: /^Cancel changes to / }));
  const confirmation = await screen.findByRole('dialog');
  await userEvent.click(within(confirmation).getByRole('button', { name: /Discard changes/ }));
  expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Aanya');
  expect(writes).toHaveLength(0);
});

it('keeps field masks and existing role edit permissions', async () => {
  source.currentValues.blood = null;
  source.originalValues.blood = null;
  source.formMaskedFieldCodes = ['blood'];
  source.formEditableFieldCodes = ['firstName'];
  await open(['Students.Records.StudentList.View']);
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('Restricted');
  expect(
    screen.queryByRole('button', { name: 'Edit Offering Registration fields' })
  ).not.toBeInTheDocument();
  expect(snapshotReads).toBe(0);
});

it('uses saved labels without a forbidden catalogue read for view-only configured fields', async () => {
  let catalogueReads = 0;
  source.definition!.sections[0].fields.push(
    customField('class', 6, {
      label: 'Applied class',
      readOnly: true,
      optionsJson: JSON.stringify({ source: 'Standards' }),
    })
  );
  source.currentValues.class = 'class-id';
  source.optionsByField = {
    class: [{ value: 'class-id', label: 'Class 1', displayOrder: 0, isActive: true }],
  };
  mswServer.use(
    http.get('*/api/students/records/:studentId/details/options', () => {
      catalogueReads += 1;
      return HttpResponse.json(null, { status: 403 });
    })
  );
  await open(['Students.Records.StudentList.View']);
  expect(screen.getByText('Class 1')).toBeVisible();
  expect(catalogueReads).toBe(0);
  expect(screen.queryByText('Options could not be loaded.')).not.toBeInTheDocument();
});

it('validates an unchanged visible field when a controller makes it required', async () => {
  source.definition!.sections[0].fields.push(
    customField('hasIllness', 0, { label: 'Has illness' }),
    customField('medicalNote', 0, {
      label: 'Medical note',
      requiredRuleJson: JSON.stringify({ field: 'hasIllness', operator: 'equals', value: 'Yes' }),
    })
  );
  source.currentValues = { ...source.currentValues, hasIllness: 'No', medicalNote: '' };
  source.formEditableFieldCodes!.push('hasIllness', 'medicalNote');
  await edit();
  set('Has illness', 'Yes');
  set('Reason for change', 'Corrected declared illness');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  expect(await screen.findByText(/Review the highlighted fields/)).toHaveTextContent(
    'Medical note'
  );
  expect(writes).toHaveLength(0);
});

it('uses snapshot read-only dependencies for rendering and preserves hidden answers in the atomic payload', async () => {
  source.definition!.sections[0].fields.push(
    customField('gate', 0, { label: 'Read-only controller', readOnly: true }),
    customField('note', 0, {
      label: 'Conditional note',
      visibilityRuleJson: JSON.stringify({ field: 'gate', operator: 'equals', value: 'Show' }),
    })
  );
  source.currentValues = { ...source.currentValues, gate: 'Show', note: 'Retained note' };
  source.formEditableFieldCodes!.push('note');
  mswServer.use(
    http.get(snapshotPath, () => {
      const latest = customSnapshot([source]);
      latest.data.sources[0].values.gate = 'Hide';
      return HttpResponse.json({ ...latest, section: 'registration-form' });
    })
  );
  await edit();
  expect(screen.getByRole('textbox', { name: 'Read-only controller' })).toHaveValue('Hide');
  expect(screen.queryByRole('textbox', { name: 'Conditional note' })).not.toBeInTheDocument();
  set('First name', 'Anita');
  set('Reason for change', 'Updated first name');
  await userEvent.click(screen.getByRole('button', { name: /^Save / }));
  await screen.findByRole('button', { name: 'Edit Offering Registration fields' });
  expect(writes[0].payload.sources[0].values).toMatchObject({
    gate: 'Hide',
    note: 'Retained note',
    firstName: 'Anita',
  });
});
