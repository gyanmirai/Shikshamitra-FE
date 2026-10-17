import type { ComponentProps } from 'react';
import type { CreateRecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { RecordRegistrationSource } from 'src/redux/student/records/student-record-details-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { CustomRecordChangeForm } from './custom-record-change-form';
import {
  customField,
  customSource,
  customDetails,
  customSection,
  customSnapshot,
  customStudentId,
} from './student-custom-details-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
// Keep the real runtime controls, validation, store, request serialization and mutation behavior.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

type FormProps = ComponentProps<typeof CustomRecordChangeForm>;
const stores: ReturnType<typeof createDocumentTestStore>[] = [];
let requests: CreateRecordChange[] = [];
let mutationStatus = 200;

function renderForm(source: RecordRegistrationSource, overrides: Partial<FormProps> = {}) {
  clearCachedAuthSession();
  const store = createDocumentTestStore();
  stores.push(store);
  store.dispatch(
    setPermissions(
      ['Students.Records.Changes.View', 'Students.Records.Changes.Add'].map((name) => ({
        name,
        isGranted: true,
      }))
    )
  );
  const props: FormProps = {
    studentId: customStudentId,
    snapshot: customSnapshot([source]),
    details: customDetails([source]),
    onSubmitted: vi.fn(),
    onDirtyChange: vi.fn(),
    onBusyChange: vi.fn(),
    ...overrides,
  };
  const ui = (next: FormProps) => (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CustomRecordChangeForm {...next} />
      </ThemeProvider>
    </Provider>
  );
  const result = render(ui(props));
  return {
    ...result,
    props,
    rerenderProps: (next: Partial<FormProps>) => result.rerender(ui({ ...props, ...next })),
  };
}

async function submitWithReason(reason = 'Verified school detail correction') {
  fireEvent.change(screen.getByRole('textbox', { name: /Reason for change/ }), {
    target: { value: reason },
  });
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
}

beforeEach(() => {
  requests = [];
  mutationStatus = 200;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.post('*/api/students/records/changes', async ({ request }) => {
      requests.push((await request.json()) as CreateRecordChange);
      return mutationStatus === 200
        ? HttpResponse.json({ data: { id: 'change-1', status: 'Pending' } })
        : HttpResponse.json(
            { error: { code: 'Students:Records:StaleSnapshot', message: 'Record changed.' } },
            { status: mutationStatus }
          );
    })
  );
});
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});

describe('CustomRecordChangeForm through the real Records API', () => {
  it('preserves untouched literal strings, null, number and boolean values in a targeted correction', async () => {
    const source = customSource(
      [
        customSection([
          customField('note', 0, { label: 'Text note' }),
          customField('literalFalse'),
          customField('literalNull'),
          customField('nullable'),
          customField('count', 2),
          customField('enabled', 9),
        ]),
      ],
      {
        note: 'Before',
        literalFalse: 'false',
        literalNull: 'null',
        nullable: null,
        count: 0,
        enabled: false,
      }
    );
    const { props } = renderForm(source);
    fireEvent.change(screen.getByRole('textbox', { name: 'Text note' }), {
      target: { value: 'Corrected' },
    });
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalledWith('change-1'));
    expect(requests[0]).toMatchObject({
      studentId: customStudentId,
      section: 'custom-details',
      expectedSnapshot: 'frozen-snapshot-1',
      payload: {
        sources: [
          {
            applicationId: 'application-1',
            formInstanceId: 'instance-1',
            submissionId: 'submission-1',
            values: { ...source.currentValues, note: 'Corrected' },
          },
        ],
      },
    });
    expect(requests[0].clientKey).toMatch(/^[\da-f-]{36}$/i);
    expect(source.originalValues.note).toBe('Before');
  });

  it('serializes actual MultiSelect 7 as an array while Radio 8 remains a scalar string', async () => {
    const source = customSource(
      [
        customSection([
          customField('languages', 7, {
            label: 'Languages',
            optionsJson: JSON.stringify([
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'Hindi' },
            ]),
          }),
          customField('transportChoice', 8, {
            label: 'Transport choice',
            optionsJson: JSON.stringify([
              { value: 'false', label: 'No transport' },
              { value: 'true', label: 'School transport' },
            ]),
          }),
        ]),
      ],
      { languages: ['en'], transportChoice: 'false' }
    );
    const { props } = renderForm(source);
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('combobox', { name: 'Languages' }));
    await user.click(await screen.findByRole('option', { name: 'Hindi' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('combobox', { name: 'Transport choice' }));
    await user.click(await screen.findByRole('option', { name: 'School transport' }));
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { languages: ['en', 'hi'], transportChoice: 'true' } }],
    });
  });

  it('retains typed repeated AddressGroup and MultiSelect siblings when one address changes', async () => {
    const addresses = [
      { addressLine1: 'Old Ahmedabad address', city: 'Ahmedabad' },
      { addressLine1: 'Surat address', city: 'Surat' },
    ];
    const source = customSource(
      [
        customSection(
          [
            customField('address', 11, { label: 'Address' }),
            customField('languages', 7, {
              label: 'Languages',
              optionsJson: JSON.stringify([
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'Hindi' },
              ]),
            }),
          ],
          { isRepeatable: true, minEntries: 2, maxEntries: 2 }
        ),
      ],
      { address: addresses, languages: [['en'], ['hi']] }
    );
    const { props } = renderForm(source);
    fireEvent.change(screen.getAllByRole('textbox', { name: 'Address line 1' })[0], {
      target: { value: 'Corrected Ahmedabad address' },
    });
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [
        {
          values: {
            address: [
              expect.objectContaining({
                addressLine1: 'Corrected Ahmedabad address',
                city: 'Ahmedabad',
              }),
              addresses[1],
            ],
            languages: [['en'], ['hi']],
          },
        },
      ],
    });
  });

  it('edits a repeated sibling-student selection without flattening the other entry', async () => {
    const optionRequests: URLSearchParams[] = [];
    const admissionRequests = vi.fn();
    const siblingLabels: Record<string, string> = {
      'sibling-1': 'Aarav sibling',
      'sibling-2': 'Riya sibling',
      'sibling-3': 'Zoya sibling',
    };
    mswServer.use(
      http.get(
        '*/api/students/records/:studentId/details/options',
        ({ request, params: route }) => {
          expect(route.studentId).toBe(customStudentId);
          const params = new URL(request.url).searchParams;
          optionRequests.push(params);
          expect(params.get('submissionId')).toBe('submission-1');
          expect(params.get('fieldCode')).toBe('siblings');
          expect(params.has('sourceKey')).toBe(false);
          const ids = params.getAll('selectedIds');
          const result = (
            ids.length ? ids : params.get('searchTerm') === 'Zo' ? ['sibling-3'] : []
          ).map((value) => ({
            value,
            label: siblingLabels[value],
            displayOrder: 0,
            isActive: true,
          }));
          return HttpResponse.json({ data: result });
        }
      ),
      http.get('*/api/student/enrollment/admissions/forms/metadata/options', () => {
        admissionRequests();
        return HttpResponse.json([], { status: 403 });
      })
    );
    const source = customSource(
      [
        customSection(
          [
            customField('siblings', 7, {
              label: 'Sibling students',
              optionsJson: '{"source":"StudentSiblings"}',
            }),
          ],
          { isRepeatable: true, minEntries: 2, maxEntries: 2 }
        ),
      ],
      { siblings: [['sibling-1'], ['sibling-2']] }
    );
    const { props } = renderForm(source);
    expect(await screen.findByText('Aarav sibling')).toBeVisible();
    expect(await screen.findByText('Riya sibling')).toBeVisible();
    const input = screen.getAllByRole('combobox', { name: 'Sibling students' })[0];
    const user = userEvent.setup({ delay: null });
    await user.click(input);
    await user.type(input, 'Zo');
    await user.click(await screen.findByRole('option', { name: 'Zoya sibling' }));
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { siblings: [['sibling-1', 'sibling-3'], ['sibling-2']] } }],
    });
    expect(admissionRequests).not.toHaveBeenCalled();
    expect(
      optionRequests.some(
        (params) =>
          params.get('selectedOnly') === 'true' &&
          params.getAll('selectedIds').includes('sibling-1')
      )
    ).toBe(true);
    expect(
      optionRequests.some(
        (params) => params.get('searchTerm') === 'Zo' && params.get('selectedOnly') === 'false'
      )
    ).toBe(true);
  });

  it('refreshes scoped dynamic options when their parent changes without using stale choices', async () => {
    const boardA = 'ad400010-0000-4000-8000-000000000001';
    const boardB = 'ad400010-0000-4000-8000-000000000002';
    const english = 'ad400010-0000-4000-8000-000000000003';
    const hindi = 'ad400010-0000-4000-8000-000000000004';
    const gujarati = 'ad400010-0000-4000-8000-000000000005';
    const optionRequests: URLSearchParams[] = [];
    mswServer.use(
      http.get(
        '*/api/students/records/:studentId/details/options',
        ({ request, params: route }) => {
          expect(route.studentId).toBe(customStudentId);
          const params = new URL(request.url).searchParams;
          optionRequests.push(params);
          const options =
            params.get('parentId') === boardB
              ? [{ value: gujarati, label: 'Gujarati', displayOrder: 0, isActive: true }]
              : [
                  { value: english, label: 'English', displayOrder: 0, isActive: true },
                  { value: hindi, label: 'Hindi', displayOrder: 1, isActive: true },
                ];
          return HttpResponse.json({ data: options });
        }
      )
    );
    const source = customSource(
      [
        customSection([
          customField('board', 6, {
            label: 'Board',
            optionsJson: JSON.stringify([
              { value: boardA, label: 'CBSE' },
              { value: boardB, label: 'State board' },
            ]),
          }),
          customField('medium', 6, {
            label: 'Medium',
            optionsJson: '{"source":"EducationMediums","parentField":"board"}',
          }),
        ]),
      ],
      { board: boardA, medium: english },
      {
        optionsByField: {
          medium: [{ value: english, label: 'English', displayOrder: 0, isActive: true }],
        },
      }
    );
    const { props } = renderForm(source);
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Medium' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('combobox', { name: 'Board' }));
    await user.click(screen.getByRole('option', { name: 'State board' }));
    await waitFor(() =>
      expect(optionRequests.some((params) => params.get('parentId') === boardB)).toBe(true)
    );
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Medium' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    await user.click(screen.getByRole('combobox', { name: 'Medium' }));
    expect(screen.queryByRole('option', { name: 'Hindi' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'Gujarati' }));
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { board: boardB, medium: gujarati } }],
    });
    expect(
      optionRequests.every(
        (params) =>
          params.get('submissionId') === 'submission-1' &&
          params.get('fieldCode') === 'medium' &&
          !params.has('sourceKey')
      )
    ).toBe(true);
  });

  it('retains the saved dynamic label and value after option failure and retries only its Records lookup', async () => {
    const board = 'ad400010-0000-4000-8000-000000000001';
    let attempts = 0;
    mswServer.use(
      http.get('*/api/students/records/:studentId/details/options', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
          : HttpResponse.json({
              data: [{ value: board, label: 'CBSE', displayOrder: 0, isActive: true }],
            });
      })
    );
    const source = customSource(
      [
        customSection([
          customField('board', 6, { label: 'Board', optionsJson: '{"source":"EducationBoards"}' }),
          customField('note', 0, { label: 'Text note' }),
        ]),
      ],
      { board, note: 'Before' },
      {
        optionsByField: {
          board: [{ value: board, label: 'CBSE', displayOrder: 0, isActive: true }],
        },
      }
    );
    const { props } = renderForm(source);
    expect(await screen.findByText('Options could not be loaded.')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('CBSE');
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Text note' }), {
      target: { value: 'Preserved draft' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Retry options' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Board' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
    expect(screen.getByRole('textbox', { name: 'Text note' })).toHaveValue('Preserved draft');
    expect(attempts).toBe(2);
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { board, note: 'Preserved draft' } }],
    });
  });

  it('retains a conditional answer after hiding the input and restores it when reenabled', async () => {
    const source = customSource(
      [
        customSection([
          customField('transport', 9, { label: 'Use transport' }),
          customField('pickup', 0, {
            label: 'Pickup area',
            visibilityRuleJson: '{"field":"transport","operator":"Equals","value":true}',
          }),
        ]),
      ],
      { transport: true, pickup: 'Satellite' }
    );
    const { props } = renderForm(source);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Use transport' }));
    expect(screen.queryByRole('textbox', { name: 'Pickup area' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Use transport' }));
    expect(screen.getByRole('textbox', { name: 'Pickup area' })).toHaveValue('Satellite');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Use transport' }));
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { transport: false, pickup: 'Satellite' } }],
    });
  });

  it('removes only the final repeated entry without revalidating or shifting a legacy sibling', async () => {
    const source = customSource(
      [
        customSection([customField('email', 3, { label: 'Entry email' })], {
          isRepeatable: true,
          minEntries: 1,
          maxEntries: 3,
        }),
      ],
      { email: ['legacy-invalid', 'valid@example.com'] }
    );
    const { props } = renderForm(source);
    expect(screen.getAllByRole('button', { name: 'Remove entry' })).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Remove entry' }));
    expect(screen.getAllByRole('textbox', { name: 'Entry email' })).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Entry email' })).toHaveValue('legacy-invalid');
    expect(screen.queryByRole('button', { name: 'Remove entry' })).not.toBeInTheDocument();
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { email: ['legacy-invalid'] } }],
    });
  });

  it('validates a newly visible field without rejecting an unchanged required legacy answer', async () => {
    const source = customSource(
      [
        customSection([
          customField('legacy', 0, { label: 'Legacy answer', required: true }),
          customField('transport', 9, { label: 'Use transport' }),
          customField('pickup', 0, {
            label: 'Pickup area',
            required: true,
            visibilityRuleJson: '{"field":"transport","operator":"Equals","value":true}',
          }),
        ]),
      ],
      { legacy: '', transport: false, pickup: '' }
    );
    const { props } = renderForm(source);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Use transport' }));
    await submitWithReason();
    expect(await screen.findByText('Pickup area is required.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Pickup area/ })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('textbox', { name: /Pickup area/ })).toHaveAccessibleDescription(
      'Pickup area is required.'
    );
    expect(requests).toEqual([]);
    fireEvent.change(screen.getByRole('textbox', { name: /Pickup area/ }), {
      target: { value: 'Satellite' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { legacy: '', transport: true, pickup: 'Satellite' } }],
    });
  });

  it('freezes the draft source/version and concurrency token across a background props refresh', async () => {
    const source = customSource(
      [customSection([customField('note', 0, { label: 'Original question' })])],
      { note: 'Old answer' }
    );
    const { props, rerenderProps } = renderForm(source);
    fireEvent.change(screen.getByRole('textbox', { name: 'Original question' }), {
      target: { value: 'My preserved correction' },
    });
    const refreshed = customSource(
      [customSection([customField('newQuestion', 0, { label: 'New form question' })])],
      { newQuestion: 'New server value' },
      { formVersion: 2, formDefinitionId: 'form-version-2', formName: 'New Registration version' }
    );
    rerenderProps({
      snapshot: customSnapshot([refreshed], 'refreshed-snapshot-2'),
      details: customDetails([refreshed]),
    });
    expect(screen.getByRole('textbox', { name: 'Original question' })).toHaveValue(
      'My preserved correction'
    );
    expect(screen.queryByRole('textbox', { name: 'New form question' })).not.toBeInTheDocument();
    expect(screen.getByText('School Registration · Version 1')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('record changed while this draft was open');
    await submitWithReason();
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalled());
    expect(requests[0].expectedSnapshot).toBe('frozen-snapshot-1');
    expect(requests[0].payload).toMatchObject({
      sources: [{ values: { note: 'My preserved correction' } }],
    });
  });

  it('requires a reason and preserves the draft and idempotency key after a failed mutation', async () => {
    mutationStatus = 409;
    const source = customSource([customSection([customField('note', 0, { label: 'Text note' })])], {
      note: 'Before',
    });
    const { props } = renderForm(source);
    fireEvent.change(screen.getByRole('textbox', { name: 'Text note' }), {
      target: { value: 'Corrected' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(
      await screen.findByText('Explain the requested change using at least 3 characters.')
    ).toBeVisible();
    expect(requests).toEqual([]);
    await submitWithReason();
    expect(await screen.findByRole('alert')).toHaveTextContent('draft has been kept');
    expect(screen.getByRole('textbox', { name: 'Text note' })).toHaveValue('Corrected');
    expect(screen.getByRole('textbox', { name: /Reason for change/ })).toHaveValue(
      'Verified school detail correction'
    );
    expect(props.onSubmitted).not.toHaveBeenCalled();
    mutationStatus = 200;
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(props.onSubmitted).toHaveBeenCalledWith('change-1'));
    expect(requests).toHaveLength(2);
    expect(requests[1].clientKey).toBe(requests[0].clientKey);
    expect(requests[1].expectedSnapshot).toBe(requests[0].expectedSnapshot);
  });
});
