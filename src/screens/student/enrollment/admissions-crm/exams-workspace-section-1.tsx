'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import NextLink from 'next/link';

import { Iconify } from 'src/components/iconify';

import { LoadingButton } from 'src/components/loading-button';

import CustomizableTable from 'src/components/customizabaleTable';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { AdmissionCrmExamAttendanceStatus } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { downloadExamResultTemplate } from './exam-result-import';

import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';

import { validateExamResultValues } from './exam-result-validation';

import { createApplicantRowNavigationProps } from './applicant-row-navigation';

import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import { useExamsWorkspaceWorkspace } from './exams-workspace-context';

import { ExamBulkFailureAlert } from './exam-bulk-failure-alert';

const pageSize = 50;

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

export function ExamsWorkspaceSection1() {
  const { state: controllerState, actions, meta } = useExamsWorkspaceWorkspace();
  const {
    applicantReturnHref,
    attendance,
    bulkAttendanceState,
    bulkCorrectionReason,
    bulkFailures,
    bulkMarksByExamId,
    bulkMarksOpen,
    bulkMarksReady,
    bulkPassingMarks,
    bulkResultsState,
    bulkTotalMarks,
    canBulkChangeExamAttendance,
    canBulkChangeExamResult,
    canOverrideExamResult,
    columnFilters,
    columns,
    eligibility,
    entranceExamRequired,
    exams,
    examsQuery,
    handleResultImportFile,
    isReadingResultFile,
    markSelectedAttendance,
    meritRank,
    obtainedMarks,
    openApplicant,
    openBulkMarksDialog,
    openResultImport,
    page,
    passingMarks,
    resultImportFileName,
    resultImportMode,
    resultImportOpen,
    resultImportPreview,
    search,
    selectedExam,
    selectedExamIds,
    selectedExams,
    selectedHasExistingResults,
    setBulkCorrectionReason,
    setBulkFailures,
    setBulkMarksByExamId,
    setBulkMarksOpen,
    setBulkPassingMarks,
    setBulkTotalMarks,
    setColumnFilters,
    setResultImportOpen,
    setSearch,
    setSelectedExam,
    setSelectedExamIds,
    state,
    tableFilters,
    targetActionLabel,
    targetExamQuery,
    totalMarks,
    updateBulkExamResult,
    updateState,
    uploadImportedResults,
    uploadSelectedResults,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <EnrollmentWorkspaceHeader
        title="Assessments"
        description="Process attendance, results, merit, and eligibility decisions from one queue."
      />
      {state.applicant ? (
        <Alert
          severity={targetExamQuery.isError ? 'error' : 'info'}
          action={
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {targetExamQuery.data && !selectedExam ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setSelectedExam(targetExamQuery.data!)}
                >
                  {targetActionLabel || 'Open Applicant Exam'}
                </Button>
              ) : null}
              {applicantReturnHref ? (
                <Button
                  component={NextLink}
                  href={applicantReturnHref}
                  color="inherit"
                  size="small"
                >
                  Back to Applicant
                </Button>
              ) : null}
            </Stack>
          }
        >
          {targetExamQuery.isFetching
            ? 'Loading the requested applicant exam.'
            : targetExamQuery.isError
              ? 'The requested applicant exam could not be resolved. Return to the applicant and retry.'
              : targetExamQuery.data
                ? `${targetActionLabel || 'Applicant exam'} for ${targetExamQuery.data.applicantName}.`
                : 'Opening the requested applicant exam.'}
        </Alert>
      ) : null}
      {!entranceExamRequired ? (
        <Alert severity="info">
          Entrance exams are disabled for this admission year. Applicants follow the exam-waived
          registration and admission readiness path.
        </Alert>
      ) : null}
      {entranceExamRequired && selectedExamIds.length > 0 ? (
        <Paper variant="outlined" role="region" aria-label="Bulk exam actions" sx={{ p: 1 }}>
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedExamIds.length} selected`} />
            {canBulkChangeExamAttendance ? (
              <>
                <LoadingButton
                  size="small"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Present)}
                >
                  Mark present
                </LoadingButton>
                <LoadingButton
                  size="small"
                  color="warning"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Absent)}
                >
                  Mark absent
                </LoadingButton>
                <LoadingButton
                  size="small"
                  color="warning"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.NoShow)}
                >
                  Mark no-show
                </LoadingButton>
                <LoadingButton
                  size="small"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Excused)}
                >
                  Mark excused
                </LoadingButton>
              </>
            ) : null}
            {canBulkChangeExamResult ? (
              <>
                <Button size="small" onClick={openBulkMarksDialog}>
                  Give Marks
                </Button>
                <Button size="small" onClick={() => openResultImport('spreadsheet')}>
                  Upload Results
                </Button>
                <Button size="small" onClick={() => openResultImport('omr')}>
                  OMR Import
                </Button>
              </>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedExamIds([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}
      {!bulkMarksOpen ? (
        <ExamBulkFailureAlert failures={bulkFailures} onClose={() => setBulkFailures([])} />
      ) : null}
      {entranceExamRequired && examsQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Entrance exams are unavailable."
          onRetry={() => examsQuery.refetch()}
        />
      ) : entranceExamRequired ? (
        <CustomizableTable
          tableId="student-enrollment-entrance-exams"
          tableTitle="Assessments"
          columns={columns}
          data={exams}
          isLoading={examsQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          serverSideFilter
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search applicant or exam slot',
            inputProps: { 'aria-label': 'Search assessments' },
          }}
          filters={[...tableFilters, ...columnFilters]}
          sorts={parseEnrollmentTableSorts(state.sorting || 'ExamStartTime ASC', columns)}
          totalCount={examsQuery.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={(value) => {
            setSearch(value);
            updateState({ page: 1 }, 'replace');
          }}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          onServerSort={(_column, sorts) => {
            const nextSorting = serializeEnrollmentTableSort(sorts);
            updateState(
              {
                sorting: nextSorting || undefined,
                page: 1,
              },
              'push'
            );
          }}
          onServerFilter={(filters) => {
            const stateColumns = new Set(['attendanceStatus', 'examStatus', 'eligibilityDecision']);
            setColumnFilters(filters.filter((filter) => !stateColumns.has(filter.column)));
            updateState(
              {
                attendance: getLatestEnumFilter(filters, 'attendanceStatus'),
                examStatus: getLatestEnumFilter(filters, 'examStatus'),
                eligibility: getLatestEnumFilter(filters, 'eligibilityDecision'),
                page: 1,
              },
              'push'
            );
          }}
          noDataText={
            <EnrollmentTableEmptyState
              title="No matching exams"
              description="Change the column filters or schedule an exam from Pipeline."
            />
          }
          rowProps={(row) => ({
            ...createApplicantRowNavigationProps({
              applicantName: row.applicantName,
              onOpen: () => openApplicant(row.leadId, 'exam'),
            }),
            'data-testid': 'student-enrollment-exam-row',
            'data-exam-id': row.id,
          })}
          wrapperProps={{ sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      ) : null}
      <Dialog open={bulkMarksOpen} onClose={() => setBulkMarksOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Give Marks</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">
              Enter individual marks for each selected applicant. Total and passing marks can stay
              shared unless a specific exam needs a different value.
            </Alert>
            {selectedHasExistingResults && !canOverrideExamResult ? (
              <Alert severity="error">
                Your role cannot replace recorded results. Remove those exams from the selection or
                ask an administrator for the exam-result override permission.
              </Alert>
            ) : selectedHasExistingResults ? (
              <TextField
                required
                label="Correction Reason"
                value={bulkCorrectionReason}
                onChange={(event) => setBulkCorrectionReason(event.target.value)}
                helperText="Required because at least 1 selected exam already has a recorded result."
                multiline
                minRows={2}
              />
            ) : null}
            <ExamBulkFailureAlert failures={bulkFailures} onClose={() => setBulkFailures([])} />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                label="Default total marks"
                type="number"
                value={bulkTotalMarks}
                onChange={(event) => {
                  const { value } = event.target;
                  setBulkTotalMarks(value);
                  setBulkMarksByExamId((current) =>
                    Object.fromEntries(
                      Object.entries(current).map(([examId, form]) => [
                        examId,
                        { ...form, totalMarks: value },
                      ])
                    )
                  );
                }}
              />
              <TextField
                fullWidth
                label="Default passing marks"
                type="number"
                value={bulkPassingMarks}
                onChange={(event) => {
                  const { value } = event.target;
                  setBulkPassingMarks(value);
                  setBulkMarksByExamId((current) =>
                    Object.fromEntries(
                      Object.entries(current).map(([examId, form]) => [
                        examId,
                        { ...form, passingMarks: value },
                      ])
                    )
                  );
                }}
              />
            </Stack>
            <Stack spacing={1}>
              {selectedExams.map((exam) => {
                const form = bulkMarksByExamId[exam.id] || {
                  totalMarks: bulkTotalMarks,
                  passingMarks: bulkPassingMarks,
                  obtainedMarks: '',
                  meritRank: '',
                };
                const errors = validateExamResultValues(form);

                return (
                  <Paper key={exam.id} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography variant="subtitle2">{exam.applicantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dateTimeFormatter.format(new Date(exam.examStartTime))}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(4, minmax(0, 1fr))',
                          },
                        }}
                      >
                        <TextField
                          label="Total marks"
                          type="number"
                          value={form.totalMarks}
                          error={Boolean(errors.totalMarks)}
                          helperText={errors.totalMarks}
                          slotProps={{ htmlInput: { min: 0 } }}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'totalMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Passing marks"
                          type="number"
                          value={form.passingMarks}
                          error={Boolean(errors.passingMarks)}
                          helperText={errors.passingMarks}
                          slotProps={{ htmlInput: { min: 0, max: form.totalMarks || undefined } }}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'passingMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Obtained marks"
                          type="number"
                          value={form.obtainedMarks}
                          error={Boolean(form.obtainedMarks && errors.obtainedMarks)}
                          helperText={form.obtainedMarks ? errors.obtainedMarks : undefined}
                          slotProps={{ htmlInput: { min: 0, max: form.totalMarks || undefined } }}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'obtainedMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Merit rank"
                          type="number"
                          value={form.meritRank}
                          error={Boolean(errors.meritRank)}
                          helperText={errors.meritRank}
                          slotProps={{ htmlInput: { min: 1, step: 1 } }}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'meritRank', event.target.value)
                          }
                        />
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkMarksOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkResultsState.isLoading}
            disabled={!bulkMarksReady}
            onClick={uploadSelectedResults}
          >
            Save Marks
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={resultImportOpen}
        onClose={() => setResultImportOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {resultImportMode === 'omr' ? 'Import OMR Results' : 'Upload Exam Results'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="info">
              {resultImportMode === 'omr'
                ? 'Upload the CSV or Excel result file exported by your OMR scanner. ShikshaMitra validates every selected applicant before saving.'
                : 'Download the selected-exam template, enter individual marks, then upload the completed CSV or Excel file.'}
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-download-outline" />}
                onClick={() => downloadExamResultTemplate(selectedExams)}
              >
                Download Template
              </Button>
              <Button
                component="label"
                variant="contained"
                startIcon={<Iconify icon="mdi:file-upload-outline" />}
                disabled={isReadingResultFile}
              >
                {isReadingResultFile ? 'Reading File…' : 'Choose Result File'}
                <input
                  hidden
                  type="file"
                  name="exam-result-file"
                  accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => handleResultImportFile(event.target.files?.[0])}
                />
              </Button>
            </Stack>
            {resultImportFileName ? (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                Selected: {resultImportFileName}
              </Typography>
            ) : null}
            {isReadingResultFile ? <LinearProgress aria-label="Reading exam result file" /> : null}
            {resultImportPreview?.errors.length ? (
              <Alert severity="error">
                <Typography variant="subtitle2">Fix these rows before importing:</Typography>
                <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
                  {resultImportPreview.errors.slice(0, 10).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </Box>
                {resultImportPreview.errors.length > 10
                  ? `${resultImportPreview.errors.length - 10} more errors are not shown.`
                  : null}
              </Alert>
            ) : null}
            {resultImportPreview && resultImportPreview.errors.length === 0 ? (
              <Alert severity="success">
                {resultImportPreview.items.length} result
                {resultImportPreview.items.length === 1 ? '' : 's'} validated and ready to import.
              </Alert>
            ) : null}
            {selectedHasExistingResults && !canOverrideExamResult ? (
              <Alert severity="error">
                Your role cannot replace recorded results. Import a selection without existing
                results or ask an administrator for the exam-result override permission.
              </Alert>
            ) : selectedHasExistingResults ? (
              <TextField
                required
                label="Correction Reason"
                value={bulkCorrectionReason}
                onChange={(event) => setBulkCorrectionReason(event.target.value)}
                helperText="Required because the selected set contains an existing result."
                multiline
                minRows={2}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultImportOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkResultsState.isLoading}
            disabled={
              !resultImportPreview ||
              resultImportPreview.items.length === 0 ||
              resultImportPreview.errors.length > 0 ||
              (selectedHasExistingResults &&
                (!canOverrideExamResult || !bulkCorrectionReason.trim()))
            }
            onClick={uploadImportedResults}
          >
            Import Results
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
