import type { CustomRecordPayload } from 'src/redux/student/records/student-record-details-api';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

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
const grants = [
  'Students.Records.StudentList.View',
  'Students.Records.Changes.View',
  'Students.Records.Changes.Create',
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
  await userEvent.click(screen.getByRole('button', { name: 'Edit Details' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Blood group/ })).toBeEnabled());
};
const set = (name: string, value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: new RegExp(name) }), { target: { value } });

it('renders original offering fields in their form order with protected fields read-only and no edit-time snapshot on viewing', async () => {
  await open();
  expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Aanya');
  expect(screen.getByRole('textbox', { name: 'Permanent GR' })).toHaveValue('GR-001');
  expect(screen.getByRole('textbox', { name: 'Permanent GR' })).toBeDisabled();
  expect(snapshotReads).toBe(0);
  expect(screen.queryByRole('link', { name: 'Request change' })).not.toBeInTheDocument();
});

it('applies mapped and custom edits in one direct audited save, stays in Details and preserves submitted originals', async () => {
  const original = structuredClone(source.originalValues);
  await edit();
  set('First name', 'Anita');
  set('Blood group', 'O+');
  set('Reason for change', 'Verified school correction');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Edit Details' });
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
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/Review the highlighted fields/)).toBeVisible();
  expect(writes).toHaveLength(0);
  set('First name', 'Anita');
  set('Blood group', 'O+');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/at least 3 characters/)).toBeVisible();
  expect(writes).toHaveLength(0);
});

it('retains a failed draft and guards cancellation until discard is confirmed', async () => {
  failure = true;
  await edit();
  set('Blood group', 'O+');
  set('Reason for change', 'Verified correction');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/Your draft has been kept/)).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('O+');
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  const confirmation = await screen.findByRole('dialog');
  await userEvent.click(within(confirmation).getByRole('button', { name: /Discard changes/ }));
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('B+');
  expect(source.originalValues.blood).toBe('B+');
});

it('keeps field masks and existing role edit permissions', async () => {
  source.currentValues.blood = null;
  source.originalValues.blood = null;
  source.formMaskedFieldCodes = ['blood'];
  source.formEditableFieldCodes = ['firstName'];
  await open(['Students.Records.StudentList.View']);
  expect(screen.getByRole('textbox', { name: /Blood group/ })).toHaveValue('Restricted');
  expect(screen.queryByRole('button', { name: 'Edit Details' })).not.toBeInTheDocument();
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
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
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
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Edit Details' });
  expect(writes[0].payload.sources[0].values).toMatchObject({
    gate: 'Hide',
    note: 'Retained note',
    firstName: 'Anita',
  });
});
