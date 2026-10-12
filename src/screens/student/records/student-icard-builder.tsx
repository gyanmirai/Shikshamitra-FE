'use client';

import type { IdCard, IdCardTemplate, IdCardSelection } from 'src/redux/student/records/student-record-documents-api';
import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem, StudentDirectoryOption } from 'src/redux/student/records/student-records-types';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomSelect from 'src/components/custom-select';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetStudentRecordsDirectoryOptionsQuery, useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';
import {
  downloadRecordPdf,
  useExportRecordIdsMutation,
  useGetRecordIdTemplateQuery,
  useIssueRecordIdsMutation,
  useCreateRecordIdTemplateMutation,
  useUpdateRecordIdTemplateMutation,
  usePreviewRecordIdsMutation,
  useSaveRecordIdTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';
import {
  Box, Grid, Stack, Paper, Alert, Button, Checkbox, TextField, Typography,
  FormControlLabel, ToggleButton, ToggleButtonGroup, LinearProgress,
} from '@mui/material';

const steps = ['Template', 'Designer', 'Students', 'Review', 'Export'];
const presets = [
  { key: 'formal-student', label: 'Formal Student', description: 'Classic school identity card.', color: '#1D4ED8' },
  { key: 'modern-student', label: 'Modern Student', description: 'Clean badge with a strong accent.', color: '#0F766E' },
  { key: 'vertical-badge', label: 'Vertical Badge', description: 'Portrait layout for holders.', color: '#7C3AED' },
  { key: 'visitor-style', label: 'Visitor Style', description: 'High contrast card with compact details.', color: '#B45309' },
  { key: 'minimal', label: 'Minimal', description: 'Quiet, low ink layout.', color: '#334155' },
  { key: 'photo-first', label: 'Photo First', description: 'Prominent student photo.', color: '#BE123C' },
] as const;
const fieldChoices = [
  { id: 'StudentName', name: 'Student name' },
  { id: 'GRNumber', name: 'GR number' },
  { id: 'Class', name: 'Class' },
  { id: 'Division', name: 'Division' },
  { id: 'AcademicYear', name: 'Academic year' },
  { id: 'DateOfBirth', name: 'Date of birth' },
] as const;
const defaultTemplate: IdCardTemplate = {
  name: '', presetKey: 'formal-student', orientation: 'Horizontal', schoolName: '',
  schoolAddress: '', headerText: 'Student Identity Card',
  footerText: 'Please return this card to the school if found.',
  primaryColor: '#00897B', backgroundColor: '#FFFFFF', cardsPerPage: 8,
  showQrCode: false, showPhoto: true,
  fields: ['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear'],
};
const normalizeTemplate = (value: Partial<IdCardTemplate>, previous: IdCardTemplate = defaultTemplate): IdCardTemplate => ({
  ...previous, ...value,
  name: value.name ?? previous.name,
  presetKey: value.presetKey ?? previous.presetKey,
  orientation: value.orientation ?? previous.orientation,
  schoolName: value.schoolName ?? previous.schoolName,
  schoolAddress: value.schoolAddress ?? previous.schoolAddress,
  headerText: value.headerText ?? previous.headerText,
  footerText: value.footerText ?? previous.footerText,
  primaryColor: value.primaryColor ?? previous.primaryColor,
  backgroundColor: value.backgroundColor ?? previous.backgroundColor,
  cardsPerPage: value.cardsPerPage ?? previous.cardsPerPage,
  showQrCode: value.showQrCode ?? previous.showQrCode,
  showPhoto: value.showPhoto ?? previous.showPhoto,
  fields: value.fields ?? previous.fields,
  selection: value.selection ?? previous.selection,
});
type Scope = { boardIds: string[]; mediumIds: string[]; standardIds: string[]; divisionIds: string[] };
const emptyScope: Scope = { boardIds: [], mediumIds: [], standardIds: [], divisionIds: [] };
const asStringArray = (value: string[] | number[]) => value.map(String);
const studentName = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity';

export default function StudentICardBuilder({
  onClose,
  initialTemplate,
}: {
  onClose: () => void;
  initialTemplate?: IdCardTemplate | null;
}) {
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const templateQuery = useGetRecordIdTemplateQuery(undefined, { skip: initialTemplate !== undefined });
  const optionsQuery = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const [saveTemplate, saveState] = useSaveRecordIdTemplateMutation();
  const [createTemplate, createState] = useCreateRecordIdTemplateMutation();
  const [updateTemplate, updateState] = useUpdateRecordIdTemplateMutation();
  const [previewCards, previewState] = usePreviewRecordIdsMutation();
  const [exportCards, exportState] = useExportRecordIdsMutation();
  const [issueCards, issueState] = useIssueRecordIdsMutation();
  const [template, setTemplate] = useState<IdCardTemplate | null>(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [scope, setScope] = useState<Scope>(emptyScope);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sorting, setSorting] = useState('');
  const [selected, setSelected] = useState<Record<string, StudentDirectoryItem>>({});
  const [idsToHydrate, setIdsToHydrate] = useState<string[]>([]);
  const [selectionEdited, setSelectionEdited] = useState(false);
  const [selectionWarning, setSelectionWarning] = useState('');
  const [previews, setPreviews] = useState<IdCard[]>([]);
  const [error, setError] = useState('');
  const [templateNameTouched, setTemplateNameTouched] = useState(false);
  const issueKey = useRef('');
  const scopeYear = useRef(academicYearId);
  const loadedSelectionYear = useRef<string | undefined>();
  const busy = saveState.isLoading || createState.isLoading || updateState.isLoading || previewState.isLoading || exportState.isLoading || issueState.isLoading;
  const templateName = template?.name ?? '';
  const templateNameError = templateNameTouched && !templateName.trim();

  useEffect(() => {
    if (template) return;
    if (initialTemplate !== undefined) setTemplate(normalizeTemplate(initialTemplate ?? defaultTemplate));
    else if (templateQuery.currentData) setTemplate(normalizeTemplate(templateQuery.currentData));
  }, [initialTemplate, template, templateQuery.currentData]);

  useEffect(() => {
    if (scopeYear.current === academicYearId) return;
    scopeYear.current = academicYearId;
    setScope(emptyScope);
    setPage(0);
    setSelected({});
    setIdsToHydrate([]);
    setSelectionEdited(false);
    setSelectionWarning('');
    loadedSelectionYear.current = undefined;
    setPreviews([]);
    issueKey.current = '';
  }, [academicYearId]);

  useEffect(() => {
    if (!template || !academicYearId || loadedSelectionYear.current === academicYearId) return;
    loadedSelectionYear.current = academicYearId;
    const saved = template.selection;
    if (saved?.academicYearId !== academicYearId) return;
    setScope({
      boardIds: saved.boardIds ?? [], mediumIds: saved.mediumIds ?? [],
      standardIds: saved.standardIds ?? [], divisionIds: saved.divisionIds ?? [],
    });
    setIdsToHydrate(saved.studentIds ?? []);
  }, [template, academicYearId]);

  const hydrationBatch = idsToHydrate.slice(0, 30);
  const savedStudents = useGetStudentRecordsDirectoryQuery({
    population: 'Active', academicYearId, studentIds: hydrationBatch,
    maxResultCount: 100, skipCount: 0,
  }, { skip: !academicYearId || idsToHydrate.length === 0 });
  useEffect(() => {
    if (!idsToHydrate.length || !savedStudents.currentData || savedStudents.isFetching) return;
    const found = Object.fromEntries(savedStudents.currentData.items.map((row) => [row.studentId, row]));
    setSelected((previous) => ({ ...previous, ...found }));
    if (Object.keys(found).length < hydrationBatch.length) {
      setSelectionWarning('Some saved students are no longer active or visible in this academic year.');
    }
    setIdsToHydrate((previous) => previous.slice(hydrationBatch.length));
  }, [idsToHydrate, hydrationBatch.length, savedStudents.currentData, savedStudents.isFetching]);

  const currentScope = scopeYear.current === academicYearId ? scope : emptyScope;
  const options = academicYearId ? optionsQuery.currentData : undefined;
  const boardOptions = useMemo(
    () => (options?.boards ?? []).filter((item) => item.parentId === academicYearId),
    [options?.boards, academicYearId]
  );
  const mediumOptions = useMemo(() => (options?.mediums ?? []).filter((item) =>
    boardOptions.some((board) => board.id === item.parentId) &&
    (!currentScope.boardIds.length || currentScope.boardIds.includes(item.parentId ?? ''))
  ), [options?.mediums, boardOptions, currentScope.boardIds]);
  const classOptions = useMemo(() => (options?.standards ?? []).filter((item) =>
    mediumOptions.some((medium) => medium.id === item.parentId) &&
    (!currentScope.mediumIds.length || currentScope.mediumIds.includes(item.parentId ?? ''))
  ), [options?.standards, currentScope.mediumIds, mediumOptions]);
  const divisionOptions = useMemo(() => (options?.divisions ?? []).filter((item) =>
    classOptions.some((standard) => standard.id === item.parentId) &&
    (!currentScope.standardIds.length || currentScope.standardIds.includes(item.parentId ?? ''))
  ), [options?.divisions, currentScope.standardIds, classOptions]);
  const directory = useGetStudentRecordsDirectoryQuery({
    population: 'Active', maxResultCount: pageSize, skipCount: page * pageSize,
    academicYearId, search: search.trim() || undefined, sorting: sorting || undefined, ...currentScope,
  }, { skip: step < 2 || !academicYearId });
  const rows = directory.currentData?.items ?? [];
  const selectedRows = scopeYear.current === academicYearId ? Object.values(selected) : [];
  const sample = previews[0] ?? (selectedRows[0] ? {
    studentSnapshot: {
      StudentName: studentName(selectedRows[0]), GRNumber: selectedRows[0].grNumber ?? '',
      Class: selectedRows[0].standardName ?? '', Division: selectedRows[0].divisionName ?? '',
    }, hasPhoto: selectedRows[0].hasPhoto, cardNumber: 'Preview',
  } : undefined);
  const patchTemplate = (patch: Partial<IdCardTemplate>) => {
    if (!template) return;
    setTemplate({ ...template, ...patch });
    setPreviews([]);
  };
  const changeScope = (patch: Partial<Scope>) => {
    setSelectionEdited(true);
    setSelectionWarning('');
    setScope((previous) => ({ ...previous, ...patch }));
    setPage(0);
    setSelected({});
    setPreviews([]);
    issueKey.current = '';
  };
  const scopeSelect = (
    label: string, key: keyof Scope, choices: StudentDirectoryOption[], patch: (value: string[]) => Partial<Scope>
  ) => (
    <CustomSelect
      label={label} multiple value={currentScope[key]} options={choices}
      labelKey="name" valueKey="id" isSearch
      isLoading={optionsQuery.isFetching}
      onChange={(value) => changeScope(patch(asStringArray(value)))}
      disabled={busy || !academicYearId || optionsQuery.isError}
      formControlProps={{ sx: { width: '100%', minWidth: 0 } }}
    />
  );
  const toggleStudent = (student: StudentDirectoryItem) => {
    setSelectionEdited(true);
    setSelected((previous) => {
      const next = { ...previous };
      if (next[student.studentId]) delete next[student.studentId];
      else if (Object.keys(next).length < 100) next[student.studentId] = student;
      return next;
    });
    setPreviews([]);
    issueKey.current = '';
  };
  const togglePage = () => {
    setSelectionEdited(true);
    const allSelected = rows.every((row) => selected[row.studentId]);
    setSelected((previous) => {
      const next = { ...previous };
      rows.forEach((row) => {
        if (allSelected) delete next[row.studentId];
        else if (Object.keys(next).length < 100) next[row.studentId] = row;
      });
      return next;
    });
    setPreviews([]);
    issueKey.current = '';
  };
  const save = async () => {
    if (!template) return null;
    if (idsToHydrate.length) {
      setError('Wait for the saved student selection to load before saving.');
      return null;
    }
    if (!templateName.trim()) {
      setTemplateNameTouched(true);
      setStep(0);
      setError('');
      return null;
    }
    if (!template.fields.length) {
      setError('Choose at least one card field.');
      return null;
    }
    try {
      const selection: IdCardSelection = template.selection?.academicYearId &&
        template.selection.academicYearId !== academicYearId && !selectionEdited
        ? template.selection
        : { academicYearId, ...currentScope, studentIds: selectedRows.map((row) => row.studentId) };
      const payload = { ...template, selection };
      const saved = await (initialTemplate === undefined
        ? saveTemplate(payload)
        : template.id
          ? updateTemplate({ id: template.id, body: payload })
          : createTemplate(payload)).unwrap();
      setTemplate(normalizeTemplate(saved, payload));
      setSelectionEdited(false);
      setError('');
      shikshaMitraToast.success({ message: 'Student I-Card template saved.' });
      return saved;
    } catch {
      setError('The template could not be saved. Refresh if another user changed it.');
      return null;
    }
  };
  const preview = async (templateId = template?.id) => {
    if (!selectedRows.length) { setError('Select at least one student.'); return false; }
    try {
      const cards = await previewCards({ studentIds: selectedRows.map((row) => row.studentId), templateId: templateId ?? undefined }).unwrap();
      setPreviews(cards);
      setError('');
      return true;
    } catch {
      setError('Cards could not be previewed. Check student access and try again.');
      return false;
    }
  };
  const advance = async () => {
    if (step === 0 && !templateName.trim()) {
      setTemplateNameTouched(true);
      setError('');
      return;
    }
    if (step === 1 && !template?.fields.length) { setError('Choose at least one card field.'); return; }
    if (step === 2 && idsToHydrate.length) { setError('Wait for the saved student selection to load.'); return; }
    if (step === 2 && !selectedRows.length) { setError('Select at least one student.'); return; }
    if (step === 2) {
      const saved = await save();
      if (!saved || !(await preview(saved.id))) return;
    }
    if (step === 3 && !previews.length) {
      const saved = await save();
      if (!saved || !(await preview(saved.id))) return;
    }
    setError('');
    setCompleted((current) => current.includes(step) ? current : [...current, step]);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const exportPdf = async () => {
    if (!template || !selectedRows.length) return;
    const saved = await save();
    if (!saved) return;
    try {
      const pdf = await exportCards({ studentIds: selectedRows.map((row) => row.studentId), cardsPerPage: template.cardsPerPage, templateId: saved.id ?? undefined }).unwrap();
      if (!pdf.size || (pdf.type && !pdf.type.includes('pdf'))) throw new Error('Invalid PDF');
      downloadRecordPdf(pdf, `Student-I-Cards-${new Date().toISOString().slice(0, 10)}.pdf`);
      shikshaMitraToast.success({ message: 'Student I-Card PDF downloaded.' });
    } catch {
      setError('Bulk PDF could not be exported. Check student access and retry.');
    }
  };
  const issue = async () => {
    if (!selectedRows.length) return;
    const saved = await save();
    if (!saved) return;
    try {
      issueKey.current ||= crypto.randomUUID();
      await issueCards({ studentIds: selectedRows.map((row) => row.studentId), templateId: saved.id ?? undefined, idempotencyKey: issueKey.current }).unwrap();
      shikshaMitraToast.success({ message: 'Student I-Cards issued. Select a student to view history.' });
      onClose();
    } catch {
      setError('Cards could not be issued. You can retry without creating duplicates.');
    }
  };

  if (initialTemplate === undefined && templateQuery.isError) return <Alert severity="error" action={<Button onClick={() => templateQuery.refetch()}>Retry</Button>}>Student I-Card template could not be loaded.</Alert>;
  if (!template) return <LinearProgress aria-label="Loading student I-Card template" />;

  const columns: IColumn[] = [
    { id: 'select', label: '', isSort: false, isFilter: false, excludeFromExport: true, minWidth: 50,
      renderColumn: () => <Checkbox size="small" aria-label="Select all students on this page"
        checked={rows.length > 0 && rows.every((row) => !!selected[row.studentId])}
        indeterminate={rows.some((row) => !!selected[row.studentId]) && !rows.every((row) => !!selected[row.studentId])}
        disabled={!rows.length || busy} onChange={togglePage} />,
      render: (_value, data) => {
      const row = data as StudentDirectoryItem;
      return <Checkbox size="small" aria-label={`Select ${studentName(row)}`} checked={!!selected[row.studentId]}
        disabled={busy || (!selected[row.studentId] && selectedRows.length >= 100)} onChange={() => toggleStudent(row)} />;
    } },
    { id: 'firstName', label: 'Student', minWidth: 190, render: (_value, data) => studentName(data as StudentDirectoryItem) },
    { id: 'grNumber', label: 'GR number', minWidth: 110 },
    { id: 'standardName', label: 'Class', minWidth: 110, isSort: false },
    { id: 'divisionName', label: 'Division', minWidth: 110, isSort: false },
    { id: 'hasPhoto', label: 'Photo', minWidth: 80, isSort: false, render: (value) => value ? 'Ready' : 'Missing' },
  ];

  return (
    <Paper sx={{ height: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 1.5 }}>
      <CustomStepperWithFormik
        initialValues={{}}
        validationSchema={undefined}
        steps={steps}
        activeStep={step}
        completedSteps={completed}
        isStepClickable={(index) => index === step || completed.includes(index)}
        onStepClick={(index) => setStep(index)}
        handleBack={() => setStep((value) => Math.max(value - 1, 0))}
        onCancel={onClose}
        handleNext={async (isLastStep, _values, _formik, setLoading) => {
          if (isLastStep) { onClose(); return; }
          setLoading(true);
          try { await advance(); } finally { setLoading(false); }
        }}
        onSave={async (_isLastStep, _values, _formik, setLoading) => {
          setLoading(true);
          try { await save(); } finally { setLoading(false); }
        }}
        showSaveButton
        nextButtonLabel="Next"
        finalButtonLabel="Done"
        saveButtonProps={{ disabled: busy || idsToHydrate.length > 0, size: 'small' }}
        saveAndNextButtonProps={{
          disabled: busy || idsToHydrate.length > 0,
          size: 'small',
          startIcon: <Iconify icon={step === steps.length - 1 ? 'solar:check-circle-bold' : 'ic:round-arrow-forward'} width={18} />,
          endIcon: null,
        }}
        renderItem={() => <Box sx={{ p: 2 }}>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: step === 2 ? 12 : 7 }}>
            {step === 0 && <Stack spacing={2}>
              <Grid container spacing={1.25}>{presets.map((preset) =>
                <Grid key={preset.key} size={{ xs: 12, sm: 6 }}><Paper component="button" type="button" variant="outlined"
                  onClick={() => patchTemplate({ presetKey: preset.key, primaryColor: preset.color,
                    orientation: preset.key === 'vertical-badge' ? 'Vertical' : 'Horizontal' })}
                  sx={{ p: 1.5, width: 1, textAlign: 'left', cursor: 'pointer', borderColor: template.presetKey === preset.key ? 'primary.main' : 'divider', bgcolor: template.presetKey === preset.key ? 'action.selected' : 'background.paper' }}>
                  <Stack direction="row" spacing={1.25} alignItems="center"><Box sx={{ width: 34, height: 24, borderRadius: 0.75, bgcolor: preset.color, flexShrink: 0 }} />
                    <Box><Typography variant="subtitle2">{preset.label}</Typography><Typography variant="caption" color="text.secondary">{preset.description}</Typography></Box></Stack>
                </Paper></Grid>)}</Grid>
              <TextField
                size="small" required label="Template name" value={templateName}
                inputProps={{ maxLength: 150 }}
                onChange={(event) => patchTemplate({ name: event.target.value })}
                onBlur={() => setTemplateNameTouched(true)}
                error={templateNameError}
                helperText={templateNameError
                  ? 'Template name is required.'
                  : 'Name this design so you can find and reuse it.'}
              />
              <ToggleButtonGroup exclusive size="small" value={template.orientation} onChange={(_event, value) => value && patchTemplate({ orientation: value })} aria-label="Card orientation">
                <ToggleButton value="Horizontal">Horizontal</ToggleButton><ToggleButton value="Vertical">Vertical</ToggleButton>
              </ToggleButtonGroup>
            </Stack>}
            {step === 1 && <Stack spacing={2}>
              <TextField size="small" label="School name" value={template.schoolName} inputProps={{ maxLength: 150 }} onChange={(event) => patchTemplate({ schoolName: event.target.value })} />
              <TextField size="small" label="School address" value={template.schoolAddress} inputProps={{ maxLength: 300 }} onChange={(event) => patchTemplate({ schoolAddress: event.target.value })} />
              <TextField size="small" label="Card heading" value={template.headerText} inputProps={{ maxLength: 300 }} onChange={(event) => patchTemplate({ headerText: event.target.value })} />
              <TextField size="small" label="Card footer" value={template.footerText} inputProps={{ maxLength: 500 }} onChange={(event) => patchTemplate({ footerText: event.target.value })} />
              <Grid container spacing={1.5}><Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Accent color" type="color" value={template.primaryColor} onChange={(event) => patchTemplate({ primaryColor: event.target.value })} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Background color" type="color" value={template.backgroundColor} onChange={(event) => patchTemplate({ backgroundColor: event.target.value })} /></Grid></Grid>
              <FormControlLabel control={<Checkbox checked={template.showPhoto} onChange={(event) => patchTemplate({ showPhoto: event.target.checked })} />} label="Show student photo" />
              <FormControlLabel control={<Checkbox checked={template.showQrCode} onChange={(event) => patchTemplate({ showQrCode: event.target.checked })} />} label="Show student QR code" />
              <Typography variant="subtitle2">Information shown on the card</Typography>
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>{fieldChoices.map((field) => <FormControlLabel key={field.id} label={field.name}
                control={<Checkbox checked={template.fields.includes(field.id)} onChange={(_event, checked) => patchTemplate({ fields: checked ? [...template.fields, field.id] : template.fields.filter((item) => item !== field.id) })} />} />)}</Stack>
            </Stack>}
            {step === 2 && <Stack spacing={2}>
              <Typography variant="subtitle1">Choose students</Typography>
              <Typography variant="body2" color="text.secondary">Select one or more boards, mediums, classes, and divisions. The choices narrow from left to right.</Typography>
              {!academicYearId && <Alert severity="info">Select a global academic year to choose students.</Alert>}
              {template.selection?.academicYearId && template.selection.academicYearId !== academicYearId &&
                <Alert severity="info">This template's saved students belong to another academic year. Select students for the current year to replace that selection.</Alert>}
              {idsToHydrate.length > 0 && savedStudents.isFetching && <LinearProgress aria-label="Loading saved students" />}
              {savedStudents.isError && idsToHydrate.length > 0 && <Alert severity="error" action={<Button onClick={() => savedStudents.refetch()}>Retry</Button>}>Saved students could not be loaded.</Alert>}
              {selectionWarning && <Alert severity="warning" onClose={() => setSelectionWarning('')}>{selectionWarning}</Alert>}
              {optionsQuery.isError && <Alert severity="error" action={<Button onClick={() => optionsQuery.refetch()}>Retry</Button>}>Academic choices could not be loaded.</Alert>}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{scopeSelect('Board', 'boardIds', boardOptions, (value) => ({ boardIds: value, mediumIds: [], standardIds: [], divisionIds: [] }))}</Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{scopeSelect('Medium', 'mediumIds', mediumOptions, (value) => ({ mediumIds: value, standardIds: [], divisionIds: [] }))}</Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{scopeSelect('Class', 'standardIds', classOptions, (value) => ({ standardIds: value, divisionIds: [] }))}</Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{scopeSelect('Division', 'divisionIds', divisionOptions, (value) => ({ divisionIds: value }))}</Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary">{selectedRows.length}/100 students selected</Typography>
              {directory.isError && <Alert severity="error" action={<Button onClick={() => directory.refetch()}>Retry</Button>}>Students could not be loaded.</Alert>}
              <CustomizableTable tableId="student-icard-builder-selection" tableTitle="Students" columns={columns} data={rows}
                isLoading={directory.isFetching} totalCount={directory.currentData?.totalCount ?? 0}
                serverSidePagination serverSideSearch serverSideSort serverSideSortMode="single"
                page={page} rowsPerPage={pageSize} rowsPerPageOptions={[10, 25, 50, 100]}
                searchTerm={search} sorts={sorting ? [{ column: sorting.startsWith('grnumber') ? 'grNumber' : 'firstName',
                  direction: sorting.endsWith('desc') ? 'desc' : 'asc' }] : []}
                onServerPagination={(nextPage, nextPageSize) => { setPageSize(nextPageSize); setPage(nextPage - 1); }}
                onServerSearch={(value) => { if (value !== search) { setSearch(value); setPage(0); } }}
                onServerSort={(_column, nextSorts) => {
                  setSorting(nextSorts.length ? `${nextSorts[0].column === 'firstName' ? 'name' : 'grnumber'} ${nextSorts[0].direction}` : '');
                  setPage(0);
                }}
                searchFieldProps={{ placeholder: 'Search students by name or GR number',
                  inputProps: { 'aria-label': 'Search students' } }}
                noDataText="No active students match these selections."
                wrapperProps={{ sx: { minHeight: 280 } }} tableContainerProps={{ sx: { maxHeight: 360 } }} />
            </Stack>}
            {step === 3 && <Stack spacing={2}>
              <Typography variant="subtitle1">Review cards</Typography>
              <Typography variant="body2">{selectedRows.length} student{selectedRows.length === 1 ? '' : 's'} selected. {selectedRows.filter((row) => !row.hasPhoto).length} missing photo.</Typography>
              <Button variant="outlined" disabled={busy} onClick={() => preview()} sx={{ alignSelf: 'flex-start' }}>Refresh preview</Button>
              <Grid container spacing={1.5}>{previews.map((card) => <Grid key={card.studentId} size={{ xs: 12, sm: 6 }}><StudentCardPreview template={template} card={card} /></Grid>)}</Grid>
            </Stack>}
            {step === 4 && <Stack spacing={2}>
              <Typography variant="subtitle1">Export student I-Cards</Typography>
              <Typography variant="body2">{selectedRows.length} cards are ready. Export creates a print PDF. Issue records numbered cards in student history.</Typography>
              <TextField size="small" type="number" label="Cards per A4 page" value={template.cardsPerPage}
                onChange={(event) => patchTemplate({ cardsPerPage: Math.max(1, Math.min(10, Number(event.target.value) || 1)) })}
                inputProps={{ min: 1, max: 10 }} sx={{ maxWidth: 220 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" disabled={busy || !selectedRows.length} onClick={exportPdf}>Export bulk PDF</Button>
                <Button variant="outlined" disabled={busy || !selectedRows.length} onClick={issue}>Issue cards</Button>
              </Stack>
            </Stack>}
          </Grid>
          {step !== 2 && <Grid size={{ xs: 12, md: 5 }}><Paper variant="outlined" sx={{ p: 1.5, position: 'sticky', top: 0 }}>
            <Typography variant="subtitle2">Live Preview</Typography>
            <Typography variant="caption" color="text.secondary">Student card composition</Typography>
            <StudentCardPreview template={template} card={sample} />
          </Paper></Grid>}
        </Grid>
        </Box>}
      />
    </Paper>
  );
}

export function StudentCardPreview({ template, card }: { template: IdCardTemplate; card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'> }) {
  const vertical = template.orientation === 'Vertical';
  return <Box sx={{ overflowX: 'auto', mt: 1.5, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
    <Box sx={{ width: vertical ? 260 : 420, height: vertical ? 420 : 260, bgcolor: template.backgroundColor, color: 'text.primary', border: '1px solid', borderColor: template.primaryColor, borderRadius: 1.5, p: 2, boxSizing: 'border-box', boxShadow: 2 }}>
      <Typography variant="subtitle1" noWrap sx={{ color: template.primaryColor, fontWeight: 700 }}>{template.schoolName || 'School Name'}</Typography>
      {template.schoolAddress && <Typography variant="caption" noWrap display="block">{template.schoolAddress}</Typography>}
      {template.presetKey !== 'minimal' && <Box sx={{ borderTop: '2px solid', borderColor: template.primaryColor, mt: 0.5, mb: 1 }} />}
      <Typography variant="caption" fontWeight={700}>{template.headerText}</Typography>
      <Stack direction={vertical ? 'column' : 'row'} spacing={1.5} sx={{ mt: 1 }}>
        {template.showPhoto && <Box sx={{ width: template.presetKey === 'photo-first' ? 108 : vertical ? 72 : 80, height: template.presetKey === 'photo-first' ? 112 : vertical ? 84 : 96, border: '1px solid', borderColor: template.primaryColor, borderRadius: template.presetKey === 'modern-student' ? '50%' : 1, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Typography variant="caption">{card?.hasPhoto ? 'PHOTO' : 'NO PHOTO'}</Typography></Box>}
        <Stack spacing={0.25} minWidth={0}>{template.fields.map((field) => <Typography key={field} variant="caption" noWrap><strong>{fieldChoices.find((item) => item.id === field)?.name ?? field}:</strong> {card?.studentSnapshot[field] || '—'}</Typography>)}
          {card?.cardNumber && card.cardNumber !== 'Preview' && <Typography variant="caption">Card: {card.cardNumber}</Typography>}</Stack>
        {template.showQrCode && <Box sx={{ width: 44, height: 44, border: '1px solid', borderColor: 'divider', bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Typography variant="caption" sx={{ color: '#111827' }}>QR</Typography></Box>}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontSize: 10 }}>{template.footerText}</Typography>
    </Box>
  </Box>;
}
