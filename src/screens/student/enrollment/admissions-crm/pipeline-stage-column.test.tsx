import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { PipelineStageColumn } from './pipeline-stage-column';

const { getLeadsQueryMock } = vi.hoisted(() => ({
  getLeadsQueryMock: vi.fn(),
}));

vi.mock('src/redux/student/admissions-crm/core-leads-api', () => ({
  useGetAdmissionCrmLeadsQuery: (...args: unknown[]) => getLeadsQueryMock(...args),
}));

const lead = (id: string, name: string) => ({ id, firstName: name }) as AdmissionCrmLeadDto;

describe('PipelineStageColumn query scope', () => {
  beforeEach(() => {
    delete (window as Window & { IntersectionObserver?: unknown }).IntersectionObserver;
    const results = new Map([
      [
        'year-a:0',
        {
          currentData: { items: [lead('a-1', 'Year A first')], totalCount: 2 },
          isFetching: false,
          isError: false,
          refetch: vi.fn(),
        },
      ],
      [
        'year-a:25',
        {
          currentData: { items: [lead('a-2', 'Year A second')], totalCount: 2 },
          isFetching: false,
          isError: false,
          refetch: vi.fn(),
        },
      ],
      [
        'year-b:0',
        {
          currentData: { items: [lead('b-1', 'Year B first')], totalCount: 1 },
          isFetching: false,
          isError: false,
          refetch: vi.fn(),
        },
      ],
    ]);
    getLeadsQueryMock.mockImplementation(
      (args: { academicYearId: string; skipCount: number }, options: { skip: boolean }) => {
        if (options.skip) {
          return {
            currentData: undefined,
            isFetching: false,
            isError: false,
            refetch: vi.fn(),
          };
        }

        return results.get(`${args.academicYearId}:${args.skipCount}`);
      }
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('drops accumulated cards and restarts at skipCount zero when scope changes', async () => {
    const { rerender } = render(
      <PipelineStageColumn
        academicYearId="year-a"
        column={{ key: 1, label: 'New', description: 'New inquiries', color: 'primary' }}
        query={{ academicMediumId: 'medium-a' }}
        resetKey="year-a:medium-a"
        renderLead={(item) => <div key={item.id}>{item.firstName}</div>}
      />
    );

    expect(await screen.findByText('Year A first')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Year A second')).toBeInTheDocument();

    rerender(
      <PipelineStageColumn
        academicYearId="year-b"
        column={{ key: 1, label: 'New', description: 'New inquiries', color: 'primary' }}
        query={{ academicMediumId: 'medium-b' }}
        resetKey="year-b:medium-b"
        renderLead={(item) => <div key={item.id}>{item.firstName}</div>}
      />
    );

    expect(screen.queryByText('Year A first')).not.toBeInTheDocument();
    expect(screen.queryByText('Year A second')).not.toBeInTheDocument();
    expect(await screen.findByText('Year B first')).toBeInTheDocument();
    await waitFor(() =>
      expect(getLeadsQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          academicYearId: 'year-b',
          academicMediumId: 'medium-b',
          skipCount: 0,
        }),
        expect.anything()
      )
    );
    expect(getLeadsQueryMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: 'year-b', skipCount: 25 }),
      expect.anything()
    );
  });

  it('uses skeleton cards without a competing progress bar for the initial request', async () => {
    const result = {
      currentData: undefined,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    };
    getLeadsQueryMock.mockImplementation((_args: unknown, options: { skip: boolean }) =>
      options.skip ? { ...result, isFetching: false } : result
    );

    render(
      <PipelineStageColumn
        academicYearId="year-a"
        column={{ key: 1, label: 'New', description: 'New inquiries', color: 'primary' }}
        query={{ academicMediumId: 'medium-a' }}
        resetKey="year-a:medium-a"
        renderLead={(item) => <div key={item.id}>{item.firstName}</div>}
      />
    );

    expect(
      await screen.findByRole('status', { name: 'Loading New applicants' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('No applicants')).not.toBeInTheDocument();
  });

  it('keeps loaded cards visible and labels background refresh progress', async () => {
    const skippedResult = {
      currentData: undefined,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
    const refreshingResult = {
      currentData: { items: [lead('a-1', 'Year A first')], totalCount: 1 },
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    };
    getLeadsQueryMock.mockImplementation((_args: unknown, options: { skip: boolean }) =>
      options.skip ? skippedResult : refreshingResult
    );

    render(
      <PipelineStageColumn
        academicYearId="year-a"
        column={{ key: 1, label: 'New', description: 'New inquiries', color: 'primary' }}
        query={{ academicMediumId: 'medium-a' }}
        resetKey="year-a:medium-a"
        renderLead={(item) => <div key={item.id}>{item.firstName}</div>}
      />
    );

    expect(await screen.findByText('Year A first')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing New applicants' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: 'Loading New applicants' })
    ).not.toBeInTheDocument();
  });
});
