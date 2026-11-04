import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { addIcon } from '@iconify/react';
import { studentPaths } from 'src/constants/student-menu';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, screen, render, cleanup, fireEvent } from '@testing-library/react';

import AdmissionFormPreviewScreen from './admission-form-preview';

['lucide:info', 'eva:arrow-back-fill'].forEach((name) =>
  addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 })
);

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  search: '',
  form: undefined as AdmissionForm | undefined,
  isLoading: false,
  isError: false,
  preview: undefined as any,
  previewLoading: false,
  previewError: false,
  previewQuery: vi.fn(),
  retry: vi.fn(),
  sourceQuery: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'form-1' }),
  useSearchParams: () => new URLSearchParams(mocks.search),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('react-redux', () => ({
  useSelector: () => ({
    currentYear: { id: 'year-1' },
    permissions: [{ name: 'Students.Admissions.Forms.View', isGranted: true }],
  }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({
    data: mocks.form,
    currentData: mocks.form,
    isLoading: mocks.isLoading,
    isError: mocks.isError,
  }),
  useLazyGetAdmissionFormOptionsQuery: () => [vi.fn()],
  useGetSavedAdmissionFormInheritancePreviewQuery: (input: unknown, options: unknown) => {
    mocks.previewQuery(input, options);
    return {
      currentData: mocks.preview,
      isLoading: mocks.previewLoading,
      isFetching: mocks.previewLoading,
      isError: mocks.previewError,
      refetch: mocks.retry,
    };
  },
  useGetAdmissionFormInheritanceSourcesQuery: (input: unknown, options: unknown) => {
    mocks.sourceQuery(input, options);
    return { currentData: { items: [], totalCount: 0 } };
  },
}));
vi.mock('./form-preview/form-preview-content', () => ({
  FormPreviewContent: ({ form }: { form: AdmissionForm }) => (
    <>
      <div>Applicant fields</div>
      <output data-testid="display-form">{JSON.stringify(form)}</output>
    </>
  ),
}));
vi.mock('./form-dialog/components/inquiry-source-picker', () => ({
  SavedInquirySourcePicker: ({
    sources,
    sourceId,
    onChange,
  }: {
    sources: { id: string; name: string }[];
    sourceId: string | null;
    onChange: (id: string | null) => void;
  }) => (
    <select
      aria-label="Preview using Inquiry form"
      value={sourceId ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">Choose source</option>
      {sources.map((source) => (
        <option key={source.id} value={source.id}>
          {source.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('admission form preview return controls', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search = '';
    mocks.isLoading = false;
    mocks.isError = false;
    mocks.preview = undefined;
    mocks.previewLoading = false;
    mocks.previewError = false;
    mocks.form = {
      id: 'form-1',
      name: 'Test form',
      purpose: 0,
      sections: [],
    } as unknown as AdmissionForm;
  });

  it.each([0, 1] as const)(
    'returns purpose %s to its originating list from either control',
    async (purpose) => {
      mocks.form!.purpose = purpose;
      const origin = `${studentPaths.enrollment.settings.forms}?view=${purpose === 1 ? 'registration' : 'inquiry'}&page=3&search=Test`;
      mocks.search = new URLSearchParams({ returnTo: origin }).toString();
      await act(async () => {
        render(<AdmissionFormPreviewScreen />);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(mocks.replace).toHaveBeenLastCalledWith(origin);
      const close = screen.getByRole('button', { name: 'Back to Forms' });
      expect(close).toHaveClass('MuiButton-outlined');
      fireEvent.click(close);
      expect(mocks.replace).toHaveBeenLastCalledWith(origin);
    }
  );

  it.each(['loading', 'error'] as const)('keeps return controls available while %s', (state) => {
    mocks.form = undefined;
    mocks.isLoading = state === 'loading';
    mocks.isError = state === 'error';
    render(<AdmissionFormPreviewScreen />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Forms' }));
    expect(mocks.replace).toHaveBeenCalledWith(studentPaths.enrollment.settings.forms);
  });

  it('uses the unified Forms list for a directly opened registration preview', async () => {
    mocks.form!.purpose = 1;
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back to Forms' }));
    expect(mocks.replace).toHaveBeenCalledWith(studentPaths.enrollment.settings.forms);
  });
  it('uses a sole approved saved source and displays its readonly context before local Registration fields', async () => {
    mocks.form!.purpose = 1;
    mocks.form!.inheritance = {
      enabled: true,
      sources: [
        {
          inquiryFormDefinitionId: 'source-a',
          requiredFieldIdentities: [],
          fieldMappings: [],
          layouts: [],
        },
      ],
    };
    const local = { id: 'local', code: 'LOCAL', name: 'Local', displayOrder: 1, fields: [] };
    const role = {
      id: 'role',
      code: 'ROLE',
      label: 'Relationship to student',
      displayOrder: 0,
      fieldType: 6,
      bindingType: 0,
      bindingKey: 'Inquiry.ParentRelationship',
      required: true,
      readOnly: false,
    };
    mocks.preview = {
      inquiryFormDefinitionId: 'source-a',
      isValid: true,
      definition: {
        ...mocks.form,
        defaultLanguage: 'hi',
        supportedLanguages: ['hi', 'en'],
        sections: [local],
      },
      inquiryContextSections: [
        {
          id: 'source',
          code: 'SOURCE',
          name: 'Inquiry',
          displayOrder: 0,
          fieldsPerRow: 3,
          fields: [role],
        },
      ],
    };
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    expect(mocks.previewQuery).toHaveBeenCalledWith(
      { id: 'form-1', inquiryFormDefinitionId: 'source-a' },
      expect.objectContaining({ skip: false })
    );
    const display = JSON.parse(screen.getByTestId('display-form').textContent!);
    expect(display.sections.map((section: { id: string }) => section.id)).toEqual([
      'source',
      'local',
    ]);
    expect(display.sections[0].fields[0]).toMatchObject({ readOnly: true, required: false });
    expect(display.defaultLanguage).toBe('hi');
    expect(mocks.sourceQuery).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'form-1' }),
      expect.objectContaining({ skip: false })
    );
  });
  it('requires an explicit choice when multiple sources are approved and retains that choice in the URL', async () => {
    mocks.form!.purpose = 1;
    mocks.form!.inheritance = {
      enabled: true,
      sources: ['source-a', 'source-b'].map((inquiryFormDefinitionId) => ({
        inquiryFormDefinitionId,
        requiredFieldIdentities: [],
        fieldMappings: [],
        layouts: [],
      })),
    };
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    expect(screen.queryByText('Applicant fields')).not.toBeInTheDocument();
    expect(mocks.previewQuery).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
    fireEvent.change(screen.getByLabelText('Preview using Inquiry form'), {
      target: { value: 'source-b' },
    });
    expect(mocks.replace).toHaveBeenCalledWith(
      expect.stringContaining('inquiryFormDefinitionId=source-b'),
      { scroll: false }
    );
  });
  it('keeps a failed effective preview out of the raw base and exposes Retry', async () => {
    mocks.form!.purpose = 1;
    mocks.form!.inheritance = {
      enabled: true,
      sources: [
        {
          inquiryFormDefinitionId: 'source-a',
          requiredFieldIdentities: [],
          fieldMappings: [],
          layouts: [],
        },
      ],
    };
    mocks.previewError = true;
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    expect(screen.queryByText('Applicant fields')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry Preview' }));
    expect(mocks.retry).toHaveBeenCalledOnce();
  });
  it('restores an explicitly approved source from the preview URL after reload', async () => {
    mocks.form!.purpose = 1;
    mocks.form!.inheritance = {
      enabled: true,
      sources: ['source-a', 'source-b'].map((inquiryFormDefinitionId) => ({
        inquiryFormDefinitionId,
        requiredFieldIdentities: [],
        fieldMappings: [],
        layouts: [],
      })),
    };
    mocks.search = new URLSearchParams({ inquiryFormDefinitionId: 'source-b' }).toString();
    mocks.preview = {
      inquiryFormDefinitionId: 'source-b',
      isValid: true,
      definition: { ...mocks.form },
      inquiryContextSections: [],
    };
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    expect(mocks.previewQuery).toHaveBeenCalledWith(
      { id: 'form-1', inquiryFormDefinitionId: 'source-b' },
      expect.objectContaining({ skip: false })
    );
    expect(screen.getByLabelText('Preview using Inquiry form')).toHaveValue('source-b');
  });
  it('retains a loading state instead of displaying the raw base during source composition', async () => {
    mocks.form!.purpose = 1;
    mocks.form!.inheritance = {
      enabled: true,
      sources: [
        {
          inquiryFormDefinitionId: 'source-a',
          requiredFieldIdentities: [],
          fieldMappings: [],
          layouts: [],
        },
      ],
    };
    mocks.previewLoading = true;
    await act(async () => {
      render(<AdmissionFormPreviewScreen />);
    });
    expect(screen.getByLabelText('Loading Form Preview')).toBeVisible();
    expect(screen.queryByText('Applicant fields')).not.toBeInTheDocument();
  });
});
