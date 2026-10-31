import type {
  CreateUpdateAdmissionForm,
  AdmissionFormInheritancePreview,
} from 'src/redux/student/admissions/admission-forms-api';

import { Formik } from 'formik';
import { useState } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';
import { useFormInheritance, FormInheritanceProvider } from './use-form-inheritance';

const requests = vi.hoisted(() => ({
  preview: vi.fn(),
  sources: vi.fn(),
  usage: vi.fn(),
  toast: vi.fn(),
  sourceRefetch: vi.fn(),
  permissions: [{ name: 'Students.Admissions.Forms.View', isGranted: true }],
  pages: null as Record<
    number,
    {
      totalCount: number;
      items: {
        inquiryFormDefinitionId: string;
        name: string;
        version: number;
        connections: { offeringId: string; offeringName: string }[];
        isApproved: boolean;
      }[];
    }
  > | null,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: requests.permissions } }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: requests.toast } }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormsQuery: () => [requests.sources],
  usePreviewAdmissionFormInheritanceMutation: () => [requests.preview],
  useGetAdmissionFormInheritanceSourcesQuery: (
    input: { id: string; skipCount: number },
    options: unknown
  ) => {
    requests.usage(input, options);
    return {
      currentData: requests.pages?.[input.skipCount] ?? { items: [], totalCount: 0 },
      refetch: vi.fn(),
    };
  },
  useGetAdmissionFormQuery: (id: string) => ({
    currentData: id ? { id, name: id, version: 1 } : undefined,
    refetch: requests.sourceRefetch,
  }),
}));
const effective = (id: string): AdmissionFormInheritancePreview => ({
  inquiryFormDefinitionId: id,
  isValid: true,
  issues: [],
  inquiryContextSections: [],
  definition: {
    id: 'registration',
    name: 'Registration',
    code: 'R',
    version: 1,
    status: 0,
    purpose: 1,
    layoutType: 0,
    sectionCount: 1,
    sections: [
      {
        id: 'source',
        code: 'SOURCE',
        name: 'Student Details',
        displayOrder: 0,
        fields: [
          {
            id: 'dob',
            code: 'DOB',
            label: id === 'A' ? 'Date of birth' : 'DOB',
            bindingType: 0,
            bindingKey: 'Applicant.DateOfBirth',
            fieldType: 5,
            required: false,
            readOnly: false,
            displayOrder: 0,
            inheritedFrom: {
              inquiryFormDefinitionId: id,
              sourceFieldCode: 'BIRTH',
              fieldIdentity: 'system:applicant.dateofbirth',
            },
          },
        ],
      },
    ],
  },
});
function Observe() {
  const value = useFormInheritance()!;
  return (
    <>
      <button type="button" onClick={() => value.selectSource('B')}>
        Preview B
      </button>
      <button type="button" onClick={value.approve}>
        Approve
      </button>
      <button type="button" onClick={() => value.formik.setFieldValue('name', 'Updated')}>
        Edit draft
      </button>
      <button type="button" onClick={() => value.formik.setFieldValue('sections', [])}>
        Remove base section
      </button>
      <output data-testid="preview-base-sections">
        {JSON.stringify(value.previewBaseSectionIds ?? [])}
      </output>
      <output data-testid="preview">
        {value.preview?.definition.sections[0].fields[0].label ?? 'No preview'}
      </output>
      <output data-testid="draft">{JSON.stringify(value.formik.values)}</output>
      <output data-testid="failed">{String(value.failed)}</output>
      <button type="button" onClick={value.loadMoreConnections}>
        Load connected page
      </button>
      <button type="button" onClick={value.refresh}>
        Check again
      </button>
      <output data-testid="connections">
        {value.connected.map((source) => source.inquiryFormDefinitionId).join(',')}
      </output>
    </>
  );
}
function ContinuityProbe() {
  const inheritance = useFormInheritance()!;
  const [panel, setPanel] = useState('Your form');
  const [draft, setDraft] = useState('');
  return (
    <>
      <button type="button" onClick={() => setPanel('Student fields')}>
        Open Student fields
      </button>
      <button type="button" onClick={() => inheritance.setEnabled(!inheritance.enabled)}>
        Toggle inheritance
      </button>
      <input
        aria-label="Unfinished field settings"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <output data-testid="active-panel">{panel}</output>
    </>
  );
}
function setup(enabled = true, onReadinessChange = vi.fn()) {
  render(
    <Formik<CreateUpdateAdmissionForm>
      initialValues={{
        ...getBlankAdmissionFormInitialValues(1),
        inheritance: {
          enabled,
          sources: [
            {
              inquiryFormDefinitionId: 'A',
              requiredFieldIdentities: [],
              fieldMappings: [],
              layouts: [],
            },
          ],
        },
      }}
      onSubmit={() => undefined}
    >
      {(formik) => (
        <FormInheritanceProvider
          formik={formik}
          active
          editingId="registration"
          onReadinessChange={onReadinessChange}
        >
          <Observe />
          <ContinuityProbe />
        </FormInheritanceProvider>
      )}
    </Formik>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  requests.permissions = [{ name: 'Students.Admissions.Forms.View', isGranted: true }];
  requests.pages = null;
  requests.preview.mockImplementation(({ inquiryFormDefinitionId }) => ({
    unwrap: () => Promise.resolve(effective(inquiryFormDefinitionId)),
  }));
});
describe('Registration source preview controller', () => {
  it('retains the exact successful preview base IDs until the replacement preview succeeds', async () => {
    setup();
    const originalId = JSON.parse(screen.getByTestId('draft').textContent!).sections[0].id;
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('Date of birth'), {
      timeout: 3000,
    });
    expect(JSON.parse(screen.getByTestId('preview-base-sections').textContent!)).toEqual([
      originalId,
    ]);
    let resolveNext: (preview: AdmissionFormInheritancePreview) => void = () => undefined;
    requests.preview.mockImplementation(() => ({
      unwrap: () =>
        new Promise<AdmissionFormInheritancePreview>((resolve) => {
          resolveNext = resolve;
        }),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove base section' }));
    await waitFor(() => expect(requests.preview).toHaveBeenCalledTimes(2), { timeout: 3000 });
    expect(JSON.parse(screen.getByTestId('preview-base-sections').textContent!)).toEqual([
      originalId,
    ]);
    resolveNext(effective('A'));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('preview-base-sections').textContent!)).toEqual([])
    );
  });
  it('retries the selected Inquiry definition as well as question compatibility', async () => {
    setup();
    await waitFor(() => expect(requests.preview).toHaveBeenCalledOnce(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
    expect(requests.sourceRefetch).toHaveBeenCalledOnce();
    await waitFor(() => expect(requests.preview).toHaveBeenCalledTimes(2), { timeout: 3000 });
  });
  it('does not fetch a protected source definition when checking a saved Inquiry without View', async () => {
    requests.permissions = [{ name: 'Students.Admissions.Forms.Add', isGranted: true }];
    setup();
    await waitFor(() => expect(requests.preview).toHaveBeenCalledOnce(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
    expect(requests.sourceRefetch).not.toHaveBeenCalled();
  });
  it('keeps the selected builder panel and unfinished settings mounted across inheritance toggles', async () => {
    setup(false);
    fireEvent.click(screen.getByRole('button', { name: 'Open Student fields' }));
    fireEvent.change(screen.getByLabelText('Unfinished field settings'), {
      target: { value: 'Keep this setting' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Toggle inheritance' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.enabled).toBe(true)
    );
    expect(screen.getByTestId('active-panel')).toHaveTextContent('Student fields');
    expect(screen.getByLabelText('Unfinished field settings')).toHaveValue('Keep this setting');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle inheritance' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.enabled).toBe(false)
    );
    expect(screen.getByTestId('active-panel')).toHaveTextContent('Student fields');
    expect(screen.getByLabelText('Unfinished field settings')).toHaveValue('Keep this setting');
    expect(screen.getByTestId('preview')).toHaveTextContent('No preview');
  });
  it('does not request inheritance data for a legacy form with inheritance disabled', () => {
    setup(false);
    expect(requests.preview).not.toHaveBeenCalled();
    expect(requests.sources).not.toHaveBeenCalled();
    expect(requests.usage).not.toHaveBeenCalled();
  });
  it('hides a pending source result when inheritance is disabled without remounting the builder', async () => {
    let resolveA: (value: AdmissionFormInheritancePreview) => void = () => undefined;
    requests.preview.mockImplementation(() => ({
      unwrap: () =>
        new Promise<AdmissionFormInheritancePreview>((resolve) => {
          resolveA = resolve;
        }),
    }));
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Open Student fields' }));
    await waitFor(() => expect(requests.preview).toHaveBeenCalledOnce(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Toggle inheritance' }));
    resolveA(effective('A'));
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('No preview'));
    expect(screen.getByTestId('active-panel')).toHaveTextContent('Student fields');
  });
  it('skips protected connection details while allowing saved-source previews with Manage but no View grant', async () => {
    requests.permissions = [{ name: 'Students.Admissions.Forms.Add', isGranted: true }];
    setup();
    expect(requests.usage).toHaveBeenLastCalledWith(
      { id: 'registration', skipCount: 0, maxResultCount: 25 },
      { skip: true }
    );
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('Date of birth'), {
      timeout: 3000,
    });
  });
  it('loads every authorized connected-source page without replacing earlier retained versions', async () => {
    requests.pages = {
      0: {
        totalCount: 26,
        items: Array.from({ length: 25 }, (_, index) => ({
          inquiryFormDefinitionId: `source-${index}`,
          name: `Inquiry ${index}`,
          version: 1,
          connections: [],
          isApproved: false,
        })),
      },
      25: {
        totalCount: 26,
        items: [
          {
            inquiryFormDefinitionId: 'retained-archived-source',
            name: 'Archived Inquiry',
            version: 1,
            connections: [],
            isApproved: false,
          },
        ],
      },
    };
    setup();
    await waitFor(() => expect(screen.getByTestId('connections')).toHaveTextContent('source-24'));
    fireEvent.click(screen.getByRole('button', { name: 'Load connected page' }));
    await waitFor(() =>
      expect(screen.getByTestId('connections')).toHaveTextContent('retained-archived-source')
    );
    expect(screen.getByTestId('connections')).toHaveTextContent('source-0');
    expect(requests.usage).toHaveBeenLastCalledWith(
      { id: 'registration', skipCount: 25, maxResultCount: 25 },
      { skip: false }
    );
  });
  it('previews a different source without approving it or copying its fields to the draft', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('Date of birth'), {
      timeout: 3000,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview B' }));
    expect(screen.getByTestId('preview')).toHaveTextContent('No preview');
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('DOB'), {
      timeout: 3000,
    });
    const unchanged = JSON.parse(screen.getByTestId('draft').textContent!);
    expect(
      unchanged.inheritance.sources.map(
        (source: { inquiryFormDefinitionId: string }) => source.inquiryFormDefinitionId
      )
    ).toEqual(['A']);
    expect(unchanged.sections[0].fields).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources).toHaveLength(
        2
      )
    );
  });
  it('ignores a stale source response arriving after a different source was selected', async () => {
    let resolveA: (value: AdmissionFormInheritancePreview) => void = () => undefined;
    requests.preview.mockImplementation(({ inquiryFormDefinitionId }) => ({
      unwrap: () =>
        inquiryFormDefinitionId === 'A'
          ? new Promise<AdmissionFormInheritancePreview>((resolve) => {
              resolveA = resolve;
            })
          : Promise.resolve(effective('B')),
    }));
    setup();
    await waitFor(() => expect(requests.preview).toHaveBeenCalledOnce(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Preview B' }));
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('DOB'), {
      timeout: 3000,
    });
    resolveA(effective('A'));
    await waitFor(() => expect(screen.getByTestId('preview')).toHaveTextContent('DOB'));
  });
  it('blocks readiness and approval when compatibility fails instead of accepting an old preview', async () => {
    const ready = vi.fn();
    setup(true, ready);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith(true), { timeout: 3000 });
    requests.preview.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('Offline')),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Preview B' }));
    expect(ready).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources).toHaveLength(
      1
    );
    await waitFor(() => expect(screen.getByTestId('failed')).toHaveTextContent('true'), {
      timeout: 3000,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(JSON.parse(screen.getByTestId('draft').textContent!).inheritance.sources).toHaveLength(
      1
    );
    expect(ready).toHaveBeenLastCalledWith(false);
  });
});
