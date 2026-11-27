import type { ReactNode } from 'react';
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
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Paper, Stack, Button, Checkbox, Typography } from '@mui/material';
import { downloadRecordPdf } from 'src/redux/student/records/student-record-documents-api';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import {
  isICardAssignmentConflict,
  useIssueAssignedICardsMutation,
  useExportAssignedICardsMutation,
  usePreviewAssignedICardsMutation,
  useGetICardAssignmentRosterQuery,
} from 'src/redux/student/records/student-icard-assignment-api';

import StudentICardAssignmentPreview from './student-icard-assignment-preview';
import { useStudentICardRosterExport } from './use-student-icard-roster-export';
import { StudentICardRosterAvatar } from './components/student-icard-roster-avatar';
import {
  cardStatusLabel,
  readRosterFilters,
  rosterTableFilters,
  serializeRosterFilters,
} from './student-icard-roster-filters';

const maxStudents = 100;
export const rosterPageSizes = [10, 25, 50, 100];

export const rosterColumns: IColumn[] = [
  {
    id: 'studentName',
    label: 'Student',
    rowHeader: true,
    minWidth: 210,
    isSort: false,
    isFilter: true,
    filterType: 'string',
    filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
    render: (_value, data) => {
      const { studentId, studentName, hasPhoto } = data as ICardAssignmentStudent;
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <StudentICardRosterAvatar
            studentId={studentId}
            studentName={studentName}
            hasPhoto={hasPhoto}
          />
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {studentName}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'rollNumber',
    label: 'Roll number',
    minWidth: 110,
    isSort: false,
    isFilter: true,
    filterType: 'number',
    filterOperators: ['equals', 'greaterThan', 'lessThan', 'between'],
    exportValue: (value) => (typeof value === 'number' ? value : null),
    render: (value) => value ?? '—',
  },
  {
    id: 'grNumber',
    label: 'GR number',
    minWidth: 110,
    isSort: false,
    isFilter: true,
    filterType: 'string',
    filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
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
    id: 'templateName',
    label: 'I-Card template',
    minWidth: 160,
    isSort: false,
    isFilter: false,
  },
  {
    id: 'hasValidIssuedCard',
    label: 'Card status',
    minWidth: 132,
    isSort: false,
    isFilter: true,
    filterType: 'enum',
    enumOptions: [
      { label: 'Issued', value: true },
      { label: 'Pending', value: false },
    ],
    exportValue: cardStatusLabel,
    render: (value) => (
      <Label color={value === true ? 'success' : 'default'}>{cardStatusLabel(value)}</Label>
    ),
  },
];

type Props = {
  academicYearId: string;
  assignment: ICardAssignmentClass;
  divisionId?: string;
  assignmentRefreshing: boolean;
  ruleActions?: ReactNode;
  search: string;
  columnFilters: string | null;
  page: number;
  pageSize: number;
  canIssue: boolean;
  canManageTemplate: boolean;
  onSearch: (value: string) => void;
  onColumnFilters: (value: string | undefined) => void;
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
  printError?: string;
};

export default function StudentICardAssignmentRoster({
  reviewKey,
  academicYearId,
  assignment,
  divisionId,
  assignmentRefreshing,
  ruleActions,
  search,
  columnFilters,
  page,
  pageSize,
  canIssue,
  canManageTemplate,
  onSearch,
  onColumnFilters,
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
  const reviewExit = useStudentDrawerExit();
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

  const filters = useMemo(() => readRosterFilters(columnFilters), [columnFilters]);
  const tableFilters = useMemo(() => rosterTableFilters(filters), [filters]);
  const scope = { academicYearId, standardId, divisionId };
  const tableTitle = `Students in ${standardName}`;
  const displayTemplateName = templateName || 'Unassigned';
  const exportRoster = useStudentICardRosterExport(scope, tableTitle, displayTemplateName);
  const roster = useGetICardAssignmentRosterQuery(
    {
      ...scope,
      search: search || undefined,
      columnFilters: filters.length ? filters : undefined,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { refetchOnMountOrArgChange: true }
  );

  const rosterData = roster.isError ? undefined : roster.currentData;
  const rows = useMemo(
    () =>
      (rosterData?.items ?? []).map((student) => ({
        ...student,
        templateName: displayTemplateName,
      })),
    [rosterData, displayTemplateName]
  );
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
  const canProcess = assigned && selectionReady;
  const studentsOnPage = rows.filter((student) => selected[student.studentId]);
  const allOnPage = Boolean(rows.length && studentsOnPage.length === rows.length);
  const pageExceedsLimit = selectedIds.length + rows.length - studentsOnPage.length > maxStudents;

  const getRequest = (studentIds: string[]): AssignedICardRequest | undefined =>
    concurrencyStamp && templateConcurrencyStamp
      ? { academicYearId, standardId, studentIds, concurrencyStamp, templateConcurrencyStamp }
      : undefined;

  const handleFailure = (error: unknown, message: string, operation?: 'print') => {
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
      const problem = parseApiProblemDetail(error);
      if (problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration') {
        if (operation === 'print') {
          setCardReview((current) =>
            current?.key === reviewKey ? { ...current, printError: problem.detail } : current
          );
        } else {
          shikshaMitraToast.error({ message: problem.detail });
        }
      } else {
        shikshaMitraToast.error({ message });
      }
    }
  };

  const startPreview = async () => {
    const request = getRequest(selectedIds);
    if (!request || !canProcess || requestLock.current) return;
    requestLock.current = true;
    try {
      const cards = await previewCards(request).unwrap();
      if (!cards.length) throw new Error('Empty card preview');
      reviewExit.reopen();
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
    setCardReview((current) => (current ? { ...current, printError: undefined } : current));
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
      handleFailure(error, 'The print sheet could not be downloaded. Please try again.', 'print');
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
      issueKey.current = null;
      reviewExit.closeAfterExit(() => {
        setCardReview(null);
        setSelected({});
      });
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
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              flexWrap="wrap"
              justifyContent={{ sm: 'flex-end' }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                role="status"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {selectedIds.length} of {maxStudents} selected
              </Typography>
              {ruleActions}
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
          tableTitle={tableTitle}
          columns={columns}
          data={rows}
          isLoading={isTableLoading}
          serverSidePagination
          serverSideSearch
          serverSideFilter
          filters={tableFilters}
          externalFiltersActive={Boolean(divisionId)}
          onServerFilter={(nextFilters) => onColumnFilters(serializeRosterFilters(nextFilters))}
          onClearCriteria={onClearFilters}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={rosterPageSizes}
          totalCount={rosterData?.totalCount ?? 0}
          searchTerm={search}
          paginationDisabled={busy}
          onServerSearch={(value) => {
            if (value !== search) onSearch(value);
          }}
          onServerPagination={(nextPage, nextSize) => onPageChange(nextPage - 1, nextSize)}
          searchFieldProps={{
            placeholder: 'Search name, GR or roll number',
            disabled: busy,
            inputProps: { 'aria-label': 'Search class roster', maxLength: 150 },
          }}
          noDataText={
            search || divisionId || filters.length > 0 ? (
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
          showExport
          exportScope="all"
          onExport={exportRoster}
          exportDisabled={busy || isTableLoading || !rosterData?.totalCount}
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
        <StudentICardAssignmentPreview
          open={!reviewExit.closing}
          onExited={reviewExit.onExited}
          standardName={standardName}
          busy={busy}
          printError={review.printError}
          cards={review.cards}
          currentCard={currentCard}
          existingCount={existingCount}
          getStudentName={(card) =>
            card.studentSnapshot.StudentName ?? selected[card.studentId]?.studentName ?? 'Student'
          }
          onStudentChange={(studentId) => setCardReview({ ...review, studentId })}
          onClose={() => reviewExit.closeAfterExit(() => setCardReview(null))}
          actions={
            canIssue && (
              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ px: 2, py: 1.75 }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 'auto' }}>
                  A4 · Actual size / 100%
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.printer} />}
                  loadingPosition="start"
                  loading={exporting}
                  disabled={!canProcess}
                  onClick={downloadSheet}
                >
                  Print Sheet
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
              </Stack>
            )
          }
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingIssue && canIssue) && !reviewExit.closing}
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
