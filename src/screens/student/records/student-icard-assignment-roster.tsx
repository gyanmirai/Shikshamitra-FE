import type { IColumn } from 'src/components/customizabaleTable/types';
import type { IdCard } from 'src/redux/student/records/student-record-documents-api';
import type {
  AssignedICardRequest,
  ICardAssignmentClass,
  ICardAssignmentStudent,
} from 'src/redux/student/records/student-icard-assignment-api';

import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Paper, Stack, Button, Checkbox, Typography } from '@mui/material';
import {
  downloadRecordPdf,
  useGetRecordIdPhotoQuery,
} from 'src/redux/student/records/student-record-documents-api';
import {
  isICardAssignmentConflict,
  useIssueAssignedICardsMutation,
  useExportAssignedICardsMutation,
  usePreviewAssignedICardsMutation,
  useGetICardAssignmentRosterQuery,
} from 'src/redux/student/records/student-icard-assignment-api';

import { StudentCardPreview } from './components/student-card-preview';
import StudentAssignmentDrawer from '../onboarding/student-setup/student-assignment-drawer';

const maxStudents = 100;
export const rosterPageSizes = [10, 25, 50, 100];

export const rosterColumns: IColumn[] = [
  {
    id: 'studentName',
    label: 'Student',
    rowHeader: true,
    minWidth: 160,
    isSort: false,
    isFilter: false,
  },
  {
    id: 'grNumber',
    label: 'GR number',
    minWidth: 110,
    isSort: false,
    isFilter: false,
    render: (value) => value || '—',
  },
  {
    id: 'divisionName',
    label: 'Division',
    minWidth: 100,
    isSort: false,
    isFilter: false,
    render: (value) => value || '—',
  },
  {
    id: 'hasValidIssuedCard',
    label: 'Card status',
    minWidth: 132,
    isSort: false,
    isFilter: false,
    render: (value) => (
      <Label color={value ? 'success' : 'default'}>{value ? 'Issued' : 'Pending'}</Label>
    ),
  },
];

type Props = {
  academicYearId: string;
  assignment: ICardAssignmentClass;
  divisionId?: string;
  assignmentRefreshing: boolean;
  search: string;
  page: number;
  pageSize: number;
  canIssue: boolean;
  canManageTemplate: boolean;
  onSearch: (value: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onClearFilters: () => void;
  onBusyChange: (busy: boolean) => void;
  onTemplateSelectionChange: (eligible: boolean) => void;
  onReloadAssignment: () => void;
};

type CardReview = {
  key: string;
  cards: IdCard[];
  studentId: string;
  pendingIssue: string[] | null;
};

export default function StudentICardAssignmentRoster({
  reviewKey,
  academicYearId,
  assignment,
  divisionId,
  assignmentRefreshing,
  search,
  page,
  pageSize,
  canIssue,
  canManageTemplate,
  onSearch,
  onPageChange,
  onClearFilters,
  onBusyChange,
  onTemplateSelectionChange,
  onReloadAssignment,
}: Props & { reviewKey: string }) {
  const router = useRouter();
  const { standardId, standardName, templateName, concurrencyStamp, templateConcurrencyStamp } =
    assignment;
  const assigned = Boolean(assignment.templateId && concurrencyStamp && templateConcurrencyStamp);
  const [selected, setSelected] = useState<Record<string, ICardAssignmentStudent>>({});
  const [cardReview, setCardReview] = useState<CardReview | null>(null);
  const review = cardReview?.key === reviewKey ? cardReview : null;
  const pendingIssue = review?.pendingIssue;
  const [previewCards, { isLoading: previewing }] = usePreviewAssignedICardsMutation();
  const [exportCards, { isLoading: exporting }] = useExportAssignedICardsMutation();
  const [issueCards, { isLoading: issuing }] = useIssueAssignedICardsMutation();
  const issueKey = useRef<{ signature: string; key: string } | null>(null);
  const requestLock = useRef(false);
  const busy = Boolean(previewing || exporting || issuing);
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  useUnsavedNavigation(false, {
    push: router.push,
    guardContextChanges: true,
    blockNavigation: busy,
  });

  const roster = useGetICardAssignmentRosterQuery(
    {
      academicYearId,
      standardId,
      divisionId,
      search: search || undefined,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { refetchOnMountOrArgChange: true }
  );

  const rows = roster.isError ? [] : (roster.currentData?.items ?? []);
  const selectedIds = Object.keys(selected);
  const canSelect = assigned || canManageTemplate;
  const isTableLoading = !roster.isError && (assignmentRefreshing || roster.isFetching);
  const selectionReady = Boolean(
    selectedIds.length > 0 && !busy && !roster.isError && !isTableLoading
  );
  const templateSelectionReady = canManageTemplate && selectionReady;
  useEffect(() => {
    onTemplateSelectionChange(templateSelectionReady);
    return () => onTemplateSelectionChange(false);
  }, [onTemplateSelectionChange, templateSelectionReady]);
  const issueIds = selectedIds.filter(
    (id) => !(rows.find((student) => student.studentId === id) ?? selected[id]).hasValidIssuedCard
  );
  const existingCount = selectedIds.length - issueIds.length;
  const currentCard =
    review?.cards.find((card) => card.studentId === review.studentId) ?? review?.cards[0];
  const photo = useGetRecordIdPhotoQuery(currentCard?.studentId ?? '', {
    skip: !currentCard?.hasPhoto || !currentCard.templateSnapshot.showPhoto,
  });
  const canProcess = assigned && selectionReady;
  const studentsOnPage = rows.filter((student) => selected[student.studentId]);
  const allOnPage = Boolean(rows.length && studentsOnPage.length === rows.length);
  const pageExceedsLimit = selectedIds.length + rows.length - studentsOnPage.length > maxStudents;

  const getRequest = (studentIds: string[]): AssignedICardRequest | undefined =>
    concurrencyStamp && templateConcurrencyStamp
      ? { academicYearId, standardId, studentIds, concurrencyStamp, templateConcurrencyStamp }
      : undefined;

  const handleFailure = (error: unknown, message: string) => {
    if (isICardAssignmentConflict(error)) {
      setCardReview(null);
      setSelected({});
      onReloadAssignment();
      roster.refetch();
      shikshaMitraToast.error({
        message:
          'The class template, roster, or issued cards changed. Check the refreshed roster and select students again.',
      });
    } else {
      shikshaMitraToast.error({ message });
    }
  };

  const startPreview = async () => {
    const request = getRequest(selectedIds);
    if (!request || !canProcess || requestLock.current) return;
    requestLock.current = true;
    try {
      const cards = await previewCards(request).unwrap();
      if (!cards.length) throw new Error('Empty card preview');
      setCardReview({ key: reviewKey, cards, studentId: cards[0].studentId, pendingIssue: null });
    } catch (error) {
      handleFailure(error, 'I-Cards could not be previewed. Please try again.');
    } finally {
      requestLock.current = false;
    }
  };

  const downloadSheet = async () => {
    const request = getRequest(selectedIds);
    if (!request || !canProcess || !canIssue || !currentCard || requestLock.current) return;
    requestLock.current = true;
    try {
      const pdf = await exportCards({
        ...request,
        cardsPerPage: currentCard.templateSnapshot.cardsPerPage,
      }).unwrap();
      if (!pdf.size || (pdf.type && !pdf.type.includes('pdf')))
        throw new Error('Invalid I-Card print sheet');
      downloadRecordPdf(pdf, 'Student-I-Cards.pdf');
      shikshaMitraToast.success({ message: 'I-Card print sheet downloaded.' });
    } catch (error) {
      handleFailure(error, 'The print sheet could not be downloaded. Please try again.');
    } finally {
      requestLock.current = false;
    }
  };

  const issue = async () => {
    if (!pendingIssue || !canIssue || !canProcess || requestLock.current) return;
    const request = getRequest(pendingIssue);
    if (!request) return;
    const signature = JSON.stringify([reviewKey, [...pendingIssue].sort()]);
    if (issueKey.current?.signature !== signature) {
      issueKey.current = { signature, key: crypto.randomUUID() };
    }
    requestLock.current = true;
    try {
      const cards = await issueCards({ ...request, idempotencyKey: issueKey.current.key }).unwrap();
      shikshaMitraToast.success({
        message: `${cards.length} ${cards.length === 1 ? 'I-Card' : 'I-Cards'} issued.`,
      });
      setCardReview(null);
      setSelected({});
      issueKey.current = null;
    } catch (error) {
      handleFailure(
        error,
        'I-Cards could not be issued. Retry the same selection to check the outcome.'
      );
    } finally {
      requestLock.current = false;
    }
  };

  const columns: IColumn[] = [
    ...(canSelect
      ? [
          {
            id: 'selection',
            label: (
              <Box component="span" sx={{ position: 'absolute', clipPath: 'inset(50%)' }}>
                Select
              </Box>
            ),
            width: 64,
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            renderColumn: () => (
              <Checkbox
                size="small"
                checked={allOnPage}
                indeterminate={!allOnPage && studentsOnPage.length > 0}
                disabled={
                  busy || roster.isFetching || !rows.length || (!allOnPage && pageExceedsLimit)
                }
                slotProps={{ input: { 'aria-label': 'Select students on this page' } }}
                onChange={(event) => {
                  const next = { ...selected };
                  rows.forEach((student) => {
                    if (event.target.checked) next[student.studentId] = student;
                    else delete next[student.studentId];
                  });
                  setSelected(next);
                }}
              />
            ),
            render: (_value: unknown, data: Record<string, unknown>) => {
              const student = data as ICardAssignmentStudent;
              return (
                <Checkbox
                  size="small"
                  checked={Boolean(selected[student.studentId])}
                  disabled={
                    busy ||
                    roster.isFetching ||
                    (!selected[student.studentId] && selectedIds.length >= maxStudents)
                  }
                  slotProps={{ input: { 'aria-label': `Select ${student.studentName}` } }}
                  onChange={(event) => {
                    const next = { ...selected };
                    if (event.target.checked) next[student.studentId] = student;
                    else delete next[student.studentId];
                    setSelected(next);
                  }}
                />
              );
            },
          },
        ]
      : []),
    ...rosterColumns,
  ];

  return (
    <>
      <Paper
        component="section"
        aria-label="I-Card selection"
        variant="outlined"
        sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ minWidth: 0 }}>
            <Typography variant="body2">Template</Typography>
            <Label color="default" sx={{ maxWidth: 1, overflowWrap: 'anywhere' }}>
              {templateName || 'Unassigned'}
            </Label>
          </Stack>
          {canSelect && (
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Typography
                variant="body2"
                color="text.secondary"
                role="status"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {selectedIds.length} of {maxStudents} selected
              </Typography>
              <Button
                size="small"
                disabled={busy || selectedIds.length === 0}
                onClick={() => setSelected({})}
              >
                Clear selection
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.eye} />}
                loadingPosition="start"
                loading={previewing}
                disabled={!canProcess}
                onClick={startPreview}
              >
                Preview cards
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
      <Box sx={{ flex: 1, minHeight: { xs: 360, sm: 0 }, minWidth: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-icard-assignment-roster"
          tableTitle={`Students in ${standardName}`}
          columns={columns}
          data={rows}
          isLoading={isTableLoading}
          serverSidePagination
          serverSideSearch
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={rosterPageSizes}
          totalCount={roster.isError ? 0 : (roster.currentData?.totalCount ?? 0)}
          searchTerm={search}
          paginationDisabled={busy}
          onServerSearch={(value) => {
            if (value !== search) onSearch(value);
          }}
          onServerPagination={(nextPage, nextSize) => onPageChange(nextPage - 1, nextSize)}
          searchFieldProps={{
            placeholder: 'Search student or GR number',
            disabled: busy,
            inputProps: { 'aria-label': 'Search class roster', maxLength: 150 },
          }}
          noDataText={
            search || divisionId ? (
              <Stack spacing={1} alignItems="center">
                No eligible students match your filters.
                <Button size="small" onClick={onClearFilters}>
                  Clear filters
                </Button>
              </Stack>
            ) : (
              'No eligible students are enrolled in this class for the selected year.'
            )
          }
          errorContent={
            roster.isError ? (
              <StudentFeedback
                notificationKey="i-card-assignment-roster"
                severity="error"
                toastAction={
                  <Button size="small" onClick={() => roster.refetch()}>
                    Retry
                  </Button>
                }
              >
                The class roster could not be loaded.
              </StudentFeedback>
            ) : undefined
          }
          showColumns
          showExport={false}
          showFullScreen
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{
            sx: { height: 1 },
            'aria-label': 'Class roster',
            'aria-busy': isTableLoading || undefined,
          }}
        />
      </Box>
      {review && currentCard && (
        <StudentAssignmentDrawer
          title={`Preview I-Cards for ${standardName}`}
          titleInfo="Review and print the selected cards, or issue numbered cards where needed."
          busy={busy}
          onClose={() => setCardReview(null)}
          actions={
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{ px: 2, py: 1.75 }}
            >
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                disabled={busy}
                onClick={() => setCardReview(null)}
              >
                Close
              </Button>
              {canIssue && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.download} />}
                    loadingPosition="start"
                    loading={exporting}
                    disabled={!canProcess}
                    onClick={downloadSheet}
                  >
                    Download print sheet
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.assigned} />}
                    disabled={!canProcess || !issueIds.length}
                    onClick={() => setCardReview({ ...review, pendingIssue: issueIds })}
                  >
                    Issue cards
                  </Button>
                </>
              )}
            </Stack>
          }
        >
          <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto', minWidth: 0 }}>
            <CustomSelect
              label="Student to preview"
              value={currentCard.studentId}
              options={review.cards.map((card) => ({
                id: card.studentId,
                name:
                  card.studentSnapshot.StudentName ??
                  selected[card.studentId]?.studentName ??
                  'Student',
              }))}
              labelKey="name"
              valueKey="id"
              isSearch
              disabled={busy}
              onChange={(value) => setCardReview({ ...review, studentId: String(value) })}
            />
            <StudentCardPreview
              template={currentCard.templateSnapshot}
              card={currentCard}
              photoUrl={photo.currentData?.imageData}
            />
            {existingCount > 0 && (
              <Typography variant="body2">{existingCount} already issued</Typography>
            )}
          </Stack>
        </StudentAssignmentDrawer>
      )}
      <ConfirmDialog
        open={Boolean(pendingIssue && canIssue)}
        title="Issue I-Cards?"
        icon="info"
        bodyBusy={issuing}
        onClose={() => {
          if (review) setCardReview({ ...review, pendingIssue: null });
        }}
        content={`Issue numbered I-Cards for ${pendingIssue?.length ?? 0} ${pendingIssue?.length === 1 ? 'student' : 'students'} in ${standardName}?`}
        action={
          <Button
            size="small"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.assigned} />}
            loading={issuing}
            disabled={!canProcess || !pendingIssue?.length}
            onClick={issue}
          >
            Issue cards
          </Button>
        }
      />
    </>
  );
}
