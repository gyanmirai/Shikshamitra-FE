import type { ReactNode } from 'react';
import type { IdentityCardDesignerProps } from 'src/components/identity-card-designer';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { EmployeeICardBuilder } from './employee-card-builder';
import { initialBuilder, getEmployeeCardDesignPayload } from './employee-builder-state';

const mocks = vi.hoisted(() => ({ update: vi.fn(), error: vi.fn(), dirty: false, busy: false }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.error, success: vi.fn() },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: (dirty: boolean, options: { blockNavigation: boolean }) => {
    mocks.dirty = dirty;
    mocks.busy = options.blockNavigation;
    return { requestNavigation: vi.fn(), confirmation: null };
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('./components/employee-preview-workspace', () => ({
  EmployeePreviewWorkspace: () => null,
}));
vi.mock('./hooks/use-employee-card-logo', () => ({
  useEmployeeCardLogo: () => ({ url: '', isError: false, retry: vi.fn() }),
}));
vi.mock('./hooks/use-employee-card-selection', () => ({
  useEmployeeCardSelection: () => ({
    employeePage: 1,
    setEmployeePage: vi.fn(),
    employeePageSize: 25,
    setEmployeePageSize: vi.fn(),
    setEmployeeStatusFilter: vi.fn(),
    setSelectedEmployeesById: vi.fn(),
    employeeTableProps: {},
    readiness: {
      selected: 0,
      missingPhoto: 0,
      missingPhone: 0,
      missingDesignation: 0,
      missingEmployeeCode: 0,
      missingLogo: 0,
    },
    designationOptions: [],
    selectedPreviewEmployees: [],
    filteredEmployees: [],
    employeeColumns: [],
  }),
}));
vi.mock('src/redux/hr/employee-icard-template-api', () => ({
  useCreateEmployeeICardTemplateMutation: () => [vi.fn()],
  useUpdateEmployeeICardTemplateMutation: () => [mocks.update],
  useUploadEmployeeICardAssetMutation: () => [vi.fn()],
  useDownloadEmployeeICardsPdfMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/custom-stepper', () => ({
  CustomStepperWithFormik: ({
    activeStep,
    renderItem,
    handleNext,
    onSave,
  }: {
    activeStep: number;
    renderItem: (context: { activeStep: number }) => ReactNode;
    handleNext: (...args: unknown[]) => void;
    onSave: (...args: unknown[]) => void;
  }) => (
    <div>
      <button type="button" onClick={() => handleNext(false, {}, {}, vi.fn())}>
        Next test step
      </button>
      <button type="button" onClick={() => onSave(false, {}, {}, vi.fn())}>
        Save test template
      </button>
      {renderItem({ activeStep })}
    </div>
  ),
}));
vi.mock('src/components/identity-card-designer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/components/identity-card-designer')>();
  return {
    ...actual,
    IdentityCardDesigner: ({
      layout,
      onLayoutChange,
      printSettings,
      onPrintSettingsChange,
    }: IdentityCardDesignerProps) => (
      <>
        <button
          type="button"
          onClick={() => {
            onLayoutChange({
              ...layout,
              widthMm: 88,
              back: {
                elements: [
                  ...(layout.back?.elements ?? []),
                  {
                    id: 'custom-back',
                    type: 'text',
                    fieldKey: 'static',
                    value: 'Return to school office',
                    x: 10,
                    y: 10,
                    w: 150,
                    h: 18,
                    z: 8,
                    visible: true,
                  },
                ],
              },
            });
            onPrintSettingsChange({
              ...printSettings,
              backRotation: 180,
              sideMode: 'back',
            });
          }}
        >
          Edit back design
        </button>
        <button type="button" onClick={() => onLayoutChange({ ...layout, widthMm: Number.NaN })}>
          Set invalid physical width
        </button>
      </>
    ),
  };
});

describe('employee builder shared-designer integration', () => {
  beforeEach(() => {
    mocks.update.mockReset();
    mocks.error.mockReset();
    mocks.dirty = false;
    mocks.busy = false;
  });

  const mount = () => {
    const initial = initialBuilder();
    return render(
      <EmployeeICardBuilder
        template={{
          id: 'staff-template',
          academicYearId: 'year',
          name: 'Staff identity',
          isActive: true,
          ...getEmployeeCardDesignPayload(initial),
          backSideEnabled: true,
          logoMode: 2,
        }}
        organizations={[]}
        academicYearId="year"
        handleClose={vi.fn()}
      />
    );
  };

  it('saves a configured back, physical size and output settings through the existing mutation', async () => {
    mocks.update.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next test step' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit back design' }));
    expect(mocks.dirty).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Save test template' }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    const [{ id, body }] = mocks.update.mock.calls[0];
    expect(id).toBe('staff-template');
    expect(body.schemaVersion).toBe(2);
    expect(JSON.parse(body.layoutJson)).toMatchObject({ widthMm: 88 });
    expect(
      JSON.parse(body.layoutJson).back.elements.some(
        (element: { id: string }) => element.id === 'custom-back'
      )
    ).toBe(true);
    expect(JSON.parse(body.printSettingsJson)).toMatchObject({
      units: 'mm',
      backRotation: 180,
      sideMode: 'back',
    });
    await waitFor(() => expect(mocks.dirty).toBe(false));
  });

  it('keeps the edited draft dirty after a failed save and clears the busy lock', async () => {
    mocks.update.mockReturnValue({ unwrap: () => Promise.reject(new Error('Synthetic failure')) });
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next test step' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit back design' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save test template' }));
    await waitFor(() => expect(mocks.busy).toBe(false));
    expect(mocks.dirty).toBe(true);
    expect(screen.getByRole('button', { name: 'Edit back design' })).toBeInTheDocument();
  });

  it('retains the draft and blocks saving it into a changed global academic year', async () => {
    mocks.update.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const view = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next test step' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit back design' }));
    view.rerender(
      <EmployeeICardBuilder
        template={null}
        organizations={[]}
        academicYearId="another-year"
        handleClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save test template' }));
    expect(screen.getByText(/academic year changed/i)).toBeInTheDocument();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.dirty).toBe(true);
  });

  it('retains invalid controlled design edits and blocks save instead of resetting the preset', async () => {
    mocks.update.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next test step' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Set invalid physical width' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save test template' }));
    await waitFor(() => expect(mocks.busy).toBe(false));
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.dirty).toBe(true);
  });

  it('shows the named backend text-overflow detail and preserves the draft', async () => {
    const detail =
      'front: Staff name exceeds its text box. Enlarge the box or reduce the font size.';
    mocks.update.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Invalid configuration'), {
            status: 400,
            data: {
              error: {
                code: 'ShikshaMitra:IdentityCard:InvalidConfiguration',
                message: 'One or more business rules were violated.',
                data: { detail },
              },
            },
          })
        ),
    });
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Next test step' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit back design' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save test template' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith({ message: detail }));
    expect(mocks.dirty).toBe(true);
    expect(mocks.busy).toBe(false);
  });
});
