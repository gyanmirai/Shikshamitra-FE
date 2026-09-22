import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  ReviewStatus,
  ReviewQueueItem,
} from 'src/redux/student/admissions/admission-review-types';

import dayjs from 'dayjs';
import NextLink from 'next/link';
import { Chip, Stack } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';

import { reviewStatusLabels } from './review-model';
import { formatAdmissionReference } from '../admission-reference';

export function ReviewQueueTable({
  items,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPage,
}: {
  items: ReviewQueueItem[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPage: (page: number, rowsPerPage: number) => void;
}) {
  const columns: IColumn[] = [
    {
      id: 'applicationNumber',
      label: 'Application',
      minWidth: 165,
      isSort: false,
      render: (value, row) => (
        <NextLink href={`${studentPaths.enrollment.applications}/${row.applicationId}`}>
          {formatAdmissionReference(String(value))}
        </NextLink>
      ),
    },
    { id: 'applicantName', label: 'Applicant', minWidth: 180, isSort: false },
    { id: 'stageName', label: 'Review stage', minWidth: 170, isSort: false },
    {
      id: 'assignedReviewerName',
      label: 'Reviewer',
      minWidth: 160,
      isSort: false,
      render: (value) => String(value || 'Unassigned'),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 180,
      isSort: false,
      render: (value, row) => (
        <Stack direction="row" gap={0.5} flexWrap="wrap">
          <Chip size="small" label={reviewStatusLabels[value as ReviewStatus] ?? String(value)} />
          {row.isStale && <Chip size="small" color="warning" label="Evidence changed" />}
        </Stack>
      ),
    },
    {
      id: 'dueAt',
      label: 'Deadline',
      minWidth: 200,
      isSort: false,
      render: (value, row) => (
        <Stack spacing={0.5} alignItems="flex-start">
          {value ? dayjs(String(value)).format('DD MMM YYYY, h:mm A') : 'No deadline'}
          {row.isOverdue && <Chip size="small" color="warning" label="Overdue" />}
        </Stack>
      ),
    },
  ];
  return (
    <CustomizableTable
      tableId="admission-review-queue"
      tableTitle="Application reviews"
      columns={columns}
      data={items}
      isLoading={loading}
      isSearch={false}
      isPagination
      serverSidePagination
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
      onServerPagination={(requestedPage, size) => onPage(requestedPage - 1, size)}
      rowsPerPageOptions={[10, 20, 50]}
      maxServerRowsPerPage={50}
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      noDataText="No reviews match these filters."
    />
  );
}
