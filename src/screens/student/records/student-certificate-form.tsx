'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { CertificateType, CertificateResponse } from 'src/redux/student/records/student-record-documents-api';
import type { StudentDirectoryItem, StudentDirectoryOption, StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetStudentRecordTransitionsQuery } from 'src/redux/student/records/student-record-transitions-api';
import { Box, Grid, Stack, Alert, Button, Checkbox, TextField, Typography, DialogActions } from '@mui/material';
import { useGetStudentRecordsDirectoryQuery, useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';
import { useIssueRecordCertificateMutation, usePreviewRecordCertificateMutation } from 'src/redux/student/records/student-record-documents-api';

import CertificatePreviewDialog from './components/certificate-preview-dialog';

const nameOf = (student: StudentDirectoryItem) => [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity';

const firstAcademicScope = (
  options: StudentDirectoryOptions | undefined,
  boardId: string,
  mediumId = options?.mediums.find(item => item.parentId === boardId)?.id || '',
  academicMediumStageId = options?.stages?.find(item => item.parentId === mediumId)?.id || '',
  standardId = options?.standards.find(item => item.parentId === mediumId && item.stageId === academicMediumStageId)?.id || '',
) => ({
  boardId, mediumId, academicMediumStageId, standardId,
  divisionId: options?.divisions.find(item => item.parentId === standardId)?.id || '',
});

export default function StudentCertificateForm({ certificateType, certificateLabel, onClose, onGenerated }: {
  certificateType: CertificateType; certificateLabel: string; onClose: () => void; onGenerated: () => void;
}) {
  const globals = useSelector((state: RootState) => state.globalState);
  const academicYearId = globals.currentYear?.id;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const optionsQuery = useGetStudentRecordsDirectoryOptionsQuery({ academicYearId }, { skip: !academicYearId });
  const [selected, setSelected] = useState<Record<string, StudentDirectoryItem>>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [focusedStudent, setFocusedStudent] = useState('');
  const [previews, setPreviews] = useState<CertificateResponse[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const previewDialog = useBoolean();
  const keys = useRef<Record<string, string>>({});
  const defaultsApplied = useRef(false);
  const [previewCertificate] = usePreviewRecordCertificateMutation();
  const [issueCertificate] = useIssueRecordCertificateMutation();
  const form = useFormik({
    initialValues: { boardId: '', mediumId: '', academicMediumStageId: '', standardId: '', divisionId: '',
      reason: '', particulars: '', issueDate: dayjs().toISOString(), studentIds: [] as string[], exitCases: {} as Record<string, string> },
    validationSchema: Yup.object({
      boardId: Yup.string().required('Choose a board.'),
      mediumId: Yup.string().required('Choose a medium.'),
      academicMediumStageId: Yup.string().required('Choose a school level.'),
      standardId: Yup.string().required('Choose a class.'),
      divisionId: Yup.string().required('Choose a division.'),
      reason: Yup.string().max(4000, 'Use no more than 4000 characters.'),
      particulars: Yup.string().max(4000, 'Use no more than 4000 characters.'),
      issueDate: Yup.string().required('Choose an issue date.'),
      studentIds: Yup.array().of(Yup.string().required()).min(1, 'Select at least one student.').max(100, 'Select up to 100 students.'),
      exitCases: Yup.object().test('leaving-cases', 'Choose an exit case for every selected student.', (value, context) => certificateType !== 3 || context.parent.studentIds.every((id: string) => (value as Record<string, string> | undefined)?.[id])),
    }),
    onSubmit: async values => {
      setError(''); setPreviews([]); setBusy(true); previewDialog.onTrue();
      try {
        const prepared = await values.studentIds.reduce<Promise<CertificateResponse[]>>(async (previous, id) => {
          const completed = await previous;
          setProgress(`Preparing ${completed.length + 1} of ${values.studentIds.length} previews…`);
          const preview = await previewCertificate({ studentId: id, certificateType, issueDate: values.issueDate,
            certificateFields: { Reason: values.reason.trim(), ...(certificateType === 2 ? { Conduct: values.particulars.trim() } : certificateType === 4 ? { FirstTrialDetails: values.particulars.trim() } : {}) }, transitionId: certificateType === 3 ? values.exitCases[id] : undefined }).unwrap();
          return [...completed, preview];
        }, Promise.resolve([]));
        setPreviews(prepared);
      } catch { setError('Preview could not be prepared. Check student access and the selected exit cases, then retry.'); }
      finally { setBusy(false); setProgress(''); }
    },
  });
  const { values } = form;
  const options = optionsQuery.currentData;
  const boards = (options?.boards ?? []).filter(item => item.parentId === academicYearId);
  const mediums = (options?.mediums ?? []).filter(item => item.parentId === values.boardId);
  const stages = (options?.stages ?? []).filter(item => item.parentId === values.mediumId);
  const classes = (options?.standards ?? []).filter(item => item.parentId === values.mediumId && item.stageId === values.academicMediumStageId);
  const divisions = (options?.divisions ?? []).filter(item => item.parentId === values.standardId);
  const validSelection = !!academicYearId && boards.some(item => item.id === values.boardId) &&
    mediums.some(item => item.id === values.mediumId) && stages.some(item => item.id === values.academicMediumStageId) &&
    classes.some(item => item.id === values.standardId) && divisions.some(item => item.id === values.divisionId);
  useEffect(() => {
    if (!options || defaultsApplied.current) return;
    defaultsApplied.current = true;
    const availableBoards = options.boards.filter(item => item.parentId === academicYearId);
    const boardId = availableBoards.find(item => item.id === globals.currentBoard?.id)?.id ||
      availableBoards.find(item => options.mediums.some(medium => medium.parentId === item.id && medium.id === globals.currentMedium?.id))?.id ||
      availableBoards[0]?.id || '';
    const availableMediums = options.mediums.filter(item => item.parentId === boardId);
    const mediumId = availableMediums.find(item => item.id === globals.currentMedium?.id)?.id || availableMediums[0]?.id || '';
    form.resetForm({ values: { ...form.values, ...firstAcademicScope(options, boardId, mediumId) } });
  }, [options, academicYearId, globals.currentBoard?.id, globals.currentMedium?.id, form]);
  const directory = useGetStudentRecordsDirectoryQuery({ academicYearId, population: 'Active', includeActiveStudentList: true,
    boardId: values.boardId || undefined, mediumId: values.mediumId || undefined, academicMediumStageId: values.academicMediumStageId || undefined,
    standardId: values.standardId || undefined, divisionId: values.divisionId || undefined,
    search: search.trim() || undefined, maxResultCount: pageSize, skipCount: page * pageSize }, { skip: !validSelection });
  const rows = (validSelection ? directory.currentData?.items ?? [] : []).map(student => ({ ...student, grNumber: student.grNumber || student.grNo?.toString() || null }));
  const exits = useGetStudentRecordTransitionsQuery({ studentId: focusedStudent, maxResultCount: 100 },
    { skip: certificateType !== 3 || !focusedStudent || !hasGrantedPermission(permissions, 'Students.Records.Transitions.View') });
  const changeScope = (patch: Partial<typeof values>) => {
    form.setValues({ ...values, ...patch, studentIds: [], exitCases: {} });
    setSelected({}); setFocusedStudent(''); setPreviews([]); setPage(0); setError('');
  };
  const scopeSelect = (label: string, field: 'boardId' | 'mediumId' | 'academicMediumStageId' | 'standardId' | 'divisionId', choices: StudentDirectoryOption[], patch: (value: string) => Partial<typeof values>, enabled = true) => (
    <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={field}><CustomSelect size="small" label={label} value={values[field]}
      options={choices} labelKey="name" valueKey="id"
      onChange={value => changeScope(patch(String(value)))} isLoading={optionsQuery.isFetching}
      disabled={busy || !academicYearId || optionsQuery.isError || !enabled} formControlProps={{ fullWidth: true }} /></Grid>
  );
  const toggleRows = (students: StudentDirectoryItem[]) => {
    const next = { ...selected }; const remove = students.every(student => !!next[student.studentId]);
    students.forEach(student => {
      if (remove) delete next[student.studentId];
      else if (Object.keys(next).length < 100 && !student.maskedFields.includes('Identity')) next[student.studentId] = student;
    });
    setSelected(next); form.setFieldValue('studentIds', Object.keys(next)); setPreviews([]);
    setFocusedStudent(previous => next[previous] ? previous : Object.keys(next)[0] ?? '');
  };
  const columns: IColumn[] = [
    { id: 'selection', label: <Checkbox inputProps={{ 'aria-label': 'Select all students on this page' }} disabled={busy || !rows.length}
      checked={!!rows.length && rows.every(row => !!selected[row.studentId])} indeterminate={rows.some(row => !!selected[row.studentId]) && !rows.every(row => !!selected[row.studentId])}
      onChange={() => toggleRows(rows)} />, isSort: false, isFilter: false, excludeFromExport: true, width: 56,
      render: (_, row) => <Checkbox inputProps={{ 'aria-label': `Select ${nameOf(row as StudentDirectoryItem)}` }} checked={!!selected[row.studentId]}
        disabled={busy || row.maskedFields.includes('Identity') || (!selected[row.studentId] && values.studentIds.length >= 100)} onChange={() => toggleRows([row as StudentDirectoryItem])} /> },
    { id: 'firstName', label: 'Student', isSort: false, isFilter: false, render: (_, row) => nameOf(row as StudentDirectoryItem) },
    { id: 'grNumber', label: 'GR number', isSort: false, isFilter: false },
    { id: 'standardName', label: 'Class', isSort: false, isFilter: false },
    { id: 'divisionName', label: 'Division', isSort: false, isFilter: false },
  ];
  const generate = async () => {
    const fingerprint = JSON.stringify({ certificateType, ...values });
    const key = keys.current[fingerprint] ?? crypto.randomUUID(); keys.current[fingerprint] = key;
    setError(''); setBusy(true); let count = 0;
    try {
      await values.studentIds.reduce<Promise<void>>(async (previous, id) => {
        await previous;
        setProgress(`Generating ${count + 1} of ${values.studentIds.length} certificates…`);
        await issueCertificate({ studentId: id, certificateType, issueDate: values.issueDate,
          certificateFields: { Reason: values.reason.trim(), ...(certificateType === 2 ? { Conduct: values.particulars.trim() } : certificateType === 4 ? { FirstTrialDetails: values.particulars.trim() } : {}) }, transitionId: certificateType === 3 ? values.exitCases[id] : undefined,
          idempotencyKey: `${key}-${id}` }).unwrap(); count += 1;
      }, Promise.resolve());
      shikshaMitraToast.success({ message: `${count} ${certificateLabel} certificate${count === 1 ? '' : 's'} generated.` });
      previewDialog.onFalse(); onGenerated(); onClose();
    } catch { setError(`${count} of ${values.studentIds.length} certificates generated. Retry to finish this batch without duplicating certificates.`); }
    finally { setBusy(false); setProgress(''); }
  };
  return (
    <CustomDialog open handleClose={onClose} title={`Create ${certificateLabel} Certificates`}
      titleInfo="Choose the academic filters and select up to 100 students. Preview their certificates before generating them."
      maxWidth="lg" disableClose={busy}
      hasUnsavedChanges={form.dirty} onSubmit={event => { event.preventDefault(); form.submitForm(); }}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Grid container spacing={1}>
            {scopeSelect('Board', 'boardId', boards, boardId => firstAcademicScope(options, boardId), !!boards.length)}
            {scopeSelect('Medium', 'mediumId', mediums, mediumId => firstAcademicScope(options, values.boardId, mediumId), !!values.boardId)}
            {scopeSelect('School level', 'academicMediumStageId', stages, academicMediumStageId => firstAcademicScope(options, values.boardId, values.mediumId, academicMediumStageId), !!values.mediumId)}
            {scopeSelect('Class', 'standardId', classes, standardId => firstAcademicScope(options, values.boardId, values.mediumId, values.academicMediumStageId, standardId), !!values.academicMediumStageId)}
            {scopeSelect('Division', 'divisionId', divisions, divisionId => ({ divisionId }), !!values.standardId)}
            <Grid size={{ xs: 12, md: 8 }}><TextField fullWidth size="small" name="reason" label="Purpose / reason" value={values.reason}
              disabled={busy} onChange={form.handleChange} onBlur={form.handleBlur} error={!!form.touched.reason && !!form.errors.reason}
              helperText={form.touched.reason && form.errors.reason} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><DatePicker label="Issue date" value={dayjs(values.issueDate)} disabled={busy}
              onChange={value => form.setFieldValue('issueDate', value?.isValid() ? value.toISOString() : '')}
              slotProps={{ textField: { size: 'small', fullWidth: true, error: !!form.touched.issueDate && !!form.errors.issueDate, helperText: form.touched.issueDate && form.errors.issueDate } }} /></Grid>
          </Grid>
          {(certificateType === 2 || certificateType === 4) && <TextField fullWidth size="small" multiline minRows={2}
            name="particulars" label={certificateType === 2 ? 'Conduct assessment (optional)' : 'First trial particulars (optional)'}
            value={values.particulars} disabled={busy} onChange={form.handleChange} onBlur={form.handleBlur}
            error={!!form.touched.particulars && !!form.errors.particulars}
            helperText={form.touched.particulars && form.errors.particulars || 'Enter verified information. This text will appear on every selected student’s certificate.'} />}
          {optionsQuery.isError && <Alert severity="error" action={<Button size="small" startIcon={<Iconify icon="solar:restart-bold" />} onClick={() => optionsQuery.refetch()}>Retry</Button>}>Academic filters could not be loaded.</Alert>}
          {!academicYearId && <Alert severity="info">Select an academic year in the header to load students.</Alert>}
          <Typography variant="subtitle2">Students ({values.studentIds.length}/100 selected)</Typography>
          <Box sx={{ height: 360, minHeight: 0 }}>
            <CustomizableTable tableId="certificate-student-selection" tableTitle="Select students" columns={columns} data={rows}
              isLoading={validSelection && directory.isFetching} isPagination isSearch serverSidePagination serverSideSearch page={page} rowsPerPage={pageSize}
              totalCount={validSelection ? directory.currentData?.totalCount ?? 0 : 0} rowsPerPageOptions={[10, 25, 50, 100]}
              onServerPagination={(nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize); }}
              onServerSearch={value => { setSearch(value); setPage(0); }} noDataText={validSelection ? 'No active students match the selected filters.' : 'Choose a board, medium, school level, class and division to load students.'}
              errorContent={validSelection && directory.isError ? <Alert severity="error" action={<Button size="small" startIcon={<Iconify icon="solar:restart-bold" />} onClick={() => directory.refetch()}>Retry</Button>}>Students could not be loaded.</Alert> : undefined}
              wrapperProps={{ sx: { height: 1 } }} tableContainerProps={{ sx: { height: 1 } }} />
          </Box>
          {form.touched.studentIds && form.errors.studentIds && <Alert severity="error">{String(form.errors.studentIds)}</Alert>}
          {certificateType === 3 && values.studentIds.length > 0 && <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <CustomSelect size="small" label="Student exit case" value={focusedStudent} options={Object.values(selected).map(student => ({ id: student.studentId, name: nameOf(student) }))}
              labelKey="name" valueKey="id" onChange={value => setFocusedStudent(String(value))} disabled={busy} formControlProps={{ fullWidth: true }} />
            <CustomSelect size="small" label="Graduation / withdrawal / transfer case" value={values.exitCases[focusedStudent] ?? ''}
              options={[{ id: '', name: 'Select exit case' }, ...(exits.currentData?.items ?? []).filter(item => ['Withdraw', 'Transfer'].includes(item.outcome) || item.outcome === 'Graduate' && item.status === 'Applied').map(item => ({ id: item.id, name: `${item.outcome} · ${item.status}` }))]}
              labelKey="name" valueKey="id" onChange={value => form.setFieldValue('exitCases', { ...values.exitCases, [focusedStudent]: String(value) })}
              disabled={busy || exits.isFetching} isLoading={exits.isFetching} formControlProps={{ fullWidth: true }} />
          </Stack>}
          {form.touched.exitCases && form.errors.exitCases && <Alert severity="error">{String(form.errors.exitCases)}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button size="small" variant="outlined" startIcon={<Iconify icon="mingcute:close-line" />} onClick={onClose} disabled={busy}>Cancel</Button>
        <Button size="small" type="submit" variant="contained" startIcon={<Iconify icon="solar:eye-bold" />} loading={busy}
          disabled={busy || !validSelection}>Preview</Button>
      </DialogActions>
      <CertificatePreviewDialog open={previewDialog.value} title={`${certificateLabel} Certificate Preview`} certificates={previews}
        busy={busy} progress={progress} error={error} onClose={previewDialog.onFalse} onGenerate={generate} />
    </CustomDialog>
  );
}
