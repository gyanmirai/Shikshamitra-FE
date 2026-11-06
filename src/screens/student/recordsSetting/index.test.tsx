import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import HouseSetting from './index';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const mocks = vi.hoisted(() => ({
  native: vi.fn(() => true),
  save: vi.fn(),
  state: {
    auth: { permissions: [{ name: 'Students.Records.Settings.Add', isGranted: true }] },
    confirmPopup: { isChanges: true },
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select(mocks.state),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: any) => action,
}));
vi.mock('src/hooks/use-student-academic-scope', () => ({
  useStudentAcademicScope: () => ({ currentMedium: { id: 'medium-1' } }),
}));
vi.mock('../student-academic-scope-filters', () => ({ StudentAcademicScopeFilters: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/custom-upload', () => ({ default: () => null }));
vi.mock('src/components/static-color/colorPickerCircle', () => ({ default: () => null }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/hooks/useConfirmWithUndo', () => ({
  useConfirmWithUndo: () => ({ confirmWithUndo: vi.fn() }),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children, handleClose, formProps }: any) =>
    open ? (
      <section role="dialog">
        <button type="button" onClick={handleClose}>
          Header close
        </button>
        <form onSubmit={formProps?.onSubmit}>{children}</form>
      </section>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: { type: string }) =>
    type === 'query'
      ? { currentData: { data: [] }, refetch: vi.fn() }
      : [(input: unknown) => ({ unwrap: () => mocks.save(input) }), { isLoading: false }],
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.confirm = mocks.native;
});

it('protects legacy House settings drafts with one styled close owner', () => {
  render(<HouseSetting />);
  fireEvent.click(screen.getByRole('button', { name: 'Add house' }));
  fireEvent.change(screen.getByRole('textbox', { name: /House name/i }), {
    target: { value: 'School Falcons' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mocks.native).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: /House name/i })).toHaveValue('School Falcons');
  fireEvent.click(screen.getByRole('button', { name: 'Header close' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.queryByRole('textbox', { name: /House name/i })).not.toBeInTheDocument();
  expect(mocks.save).not.toHaveBeenCalled();
});
