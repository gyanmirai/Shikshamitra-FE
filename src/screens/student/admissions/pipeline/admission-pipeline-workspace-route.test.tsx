import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AdmissionPipelineWorkspaceRoute } from './admission-pipeline-workspace-route';

const state = vi.hoisted(() => ({ params: new URLSearchParams(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'application-1' }),
  useRouter: () => ({ replace: state.replace }),
  useSearchParams: () => state.params,
}));
vi.mock('src/components/loading-screen', () => ({
  LoadingScreen: () => <div>Loading workspace</div>,
}));
vi.mock('../admission-application-detail', () => ({
  default: () => <div>Standalone workspace</div>,
}));

beforeEach(() => {
  state.params = new URLSearchParams();
  state.replace.mockReset();
});

it('opens a legacy Pipeline link as a drawer while retaining the list query exactly once', () => {
  state.params.set(
    'returnTo',
    '/student/admissions/pipeline?board=board-1&search=Jay+Singh&page=3'
  );
  render(<AdmissionPipelineWorkspaceRoute />);
  expect(state.replace).toHaveBeenCalledWith(
    '/student/admissions/pipeline?board=board-1&search=Jay+Singh&page=3&application=application-1',
    { scroll: false }
  );
  expect(screen.queryByText('Standalone workspace')).not.toBeInTheDocument();
});

it('supports a bare legacy applicant link without creating an open redirect', () => {
  render(<AdmissionPipelineWorkspaceRoute />);
  expect(state.replace).toHaveBeenCalledWith(
    '/student/admissions/pipeline?application=application-1',
    { scroll: false }
  );
});

it('preserves an Assessment-origin standalone return instead of moving its filters to Pipeline', () => {
  state.params.set('returnTo', '/student/admissions/assessments?assessmentSession=session-1');
  render(<AdmissionPipelineWorkspaceRoute />);
  expect(screen.getByText('Standalone workspace')).toBeInTheDocument();
  expect(state.replace).not.toHaveBeenCalled();
});
