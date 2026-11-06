'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  IdCard,
  IdCardTemplate,
} from 'src/redux/student/records/student-record-documents-api';
import type {
  StudentDirectoryItem,
  StudentDirectoryOption,
} from 'src/redux/student/records/student-records-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomStepper from 'src/components/custom-stepper';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { getIdentityCardSheetLayout } from 'src/components/identity-card-designer';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';
import {
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsDirectoryOptionsQuery,
} from 'src/redux/student/records/student-records-api';
import {
  Box,
  Grid,
  Stack,
  Paper,
  Button,
  Checkbox,
  TextField,
  Typography,
  ToggleButton,
  LinearProgress,
  InputAdornment,
  ToggleButtonGroup,
} from '@mui/material';
import {
  downloadRecordPdf,
  useIssueRecordIdsMutation,
  useExportRecordIdsMutation,
  useGetRecordIdTemplateQuery,
  usePreviewRecordIdsMutation,
  useSaveRecordIdTemplateMutation,
  useCreateRecordIdTemplateMutation,
  useUpdateRecordIdTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { StudentICardDesigner } from './components/student-icard-designer';
import { StudentICardSheetPreview } from './components/student-icard-sheet-preview';
import { StudentConfiguredCardPreview } from './components/student-configured-card-preview';
import {
  getStudentICardLayout,
  applyStudentICardDesign,
  createStudentICardTemplate,
  getStudentICardDesignErrors,
  getStudentICardPrintSettings,
} from './student-icard-design';

const steps = ['Template', 'Designer', 'Students', 'Review', 'Export'];
const presets = [
  {
    key: 'classic-identity', label: 'Classic Identity',
    description: 'Configurable front and back with exact print dimensions.', color: '#007867',
  },
  {
    key: 'formal-student',
    label: 'Formal Student',
    description: 'Classic school identity card.',
    color: '#1D4ED8',
  },
  {
    key: 'modern-student',
    label: 'Modern Student',
    description: 'Clean badge with a strong accent.',
    color: '#0F766E',
  },
  {
    key: 'vertical-badge',
    label: 'Vertical Badge',
    description: 'Portrait layout for holders.',
    color: '#7C3AED',
  },
  {
    key: 'visitor-style',
    label: 'Visitor Style',
    description: 'High contrast card with compact details.',
    color: '#B45309',
  },
  { key: 'minimal', label: 'Minimal', description: 'Quiet, low ink layout.', color: '#334155' },
  {
    key: 'photo-first',
    label: 'Photo First',
    description: 'Prominent student photo.',
    color: '#BE123C',
  },
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
  name: '',
  presetKey: 'formal-student',
  orientation: 'Horizontal',
  schoolName: '',
  schoolAddress: '',
  headerText: 'Student Identity Card',
  footerText: 'Please return this card to the school if found.',
  primaryColor: '#00897B',
  backgroundColor: '#FFFFFF',
  cardsPerPage: 8,
  showQrCode: false,
  showPhoto: true,
  fields: ['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear'],
};
const normalizeTemplate = (
  value: Partial<IdCardTemplate>,
  previous: IdCardTemplate = defaultTemplate
): IdCardTemplate => ({
  ...previous,
  ...value,
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
});
export type StudentICardAcademicScope = {
  boardIds: string[];
  mediumIds: string[];
  standardIds: string[];
  divisionIds: string[];
};
type Scope = StudentICardAcademicScope;
const emptyScope: Scope = { boardIds: [], mediumIds: [], standardIds: [], divisionIds: [] };
const studentName = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Restricted identity';

export default function StudentICardBuilder({
  onClose,
  initialTemplate,
  initialStudents,
  initialAcademicScope,
  lockAcademicScope = false,
  academicYearId: openerAcademicYearId,
  contextInvalid = false,
  onBusyChange,
  onDirtyChange,
}: {
  onClose: () => void;
  initialTemplate?: IdCardTemplate | null;
  initialStudents?: StudentDirectoryItem[];
  initialAcademicScope?: StudentICardAcademicScope;
  lockAcademicScope?: boolean;
  academicYearId?: string;
  contextInvalid?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const directoryMode = initialStudents !== undefined;
  const firstStep = directoryMode ? 2 : 0;
  const visibleSteps = directoryMode ? steps.slice(2) : steps;
  const [initialSelection] = useState(() =>
    (initialStudents ?? [])
      .filter(
        (student, index, all) =>
          !student.maskedFields.includes('Identity') &&
          (!openerAcademicYearId ||
            !student.academicYearId ||
            student.academicYearId === openerAcademicYearId) &&
          all.findIndex((item) => item.studentId === student.studentId) === index
      )
      .slice(0, 100)
  );
  const [academicYearId, setAcademicYearId] = useState(
    (!directoryMode && initialTemplate?.selection?.academicYearId) || openerAcademicYearId
  );
  const [selectionRestricted, setSelectionRestricted] = useState(
    !directoryMode && initialTemplate?.selectionRestricted === true
  );
  const [hydrationIds, setHydrationIds] = useState<string[]>(() =>
    directoryMode ? [] : [...(initialTemplate?.selection?.studentIds ?? [])]
  );
  const [hydrationPage, setHydrationPage] = useState(0);
  const [identityUploading, setIdentityUploading] = useState(false);
  const templateQuery = useGetRecordIdTemplateQuery(undefined, {
    skip: initialTemplate !== undefined,
  });
  const optionsQuery = useGetStudentRecordsDirectoryOptionsQuery(
    academicYearId ? { academicYearId } : {}
  );
  const [saveTemplate, saveState] = useSaveRecordIdTemplateMutation();
  const [createTemplate, createState] = useCreateRecordIdTemplateMutation();
  const [updateTemplate, updateState] = useUpdateRecordIdTemplateMutation();
  const [previewCards, previewState] = usePreviewRecordIdsMutation();
  const [exportCards, exportState] = useExportRecordIdsMutation();
  const [issueCards, issueState] = useIssueRecordIdsMutation();
  const [template, setTemplate] = useState<IdCardTemplate | null>(() =>
    initialTemplate === undefined ? null : initialTemplate === null
      ? createStudentICardTemplate() : normalizeTemplate(initialTemplate)
  );
  const [savedTemplateJson, setSavedTemplateJson] = useState(() => JSON.stringify(
    initialTemplate === null ? createStudentICardTemplate() : initialTemplate ? normalizeTemplate(initialTemplate) : null
  ));
  const [step, setStep] = useState(firstStep);
  const [completed, setCompleted] = useState<number[]>([]);
  const [storedScope, setScope] = useState<Scope>(() =>
    initialAcademicScope
      ? {
          boardIds: [...initialAcademicScope.boardIds],
          mediumIds: [...initialAcademicScope.mediumIds],
          standardIds: [...initialAcademicScope.standardIds],
          divisionIds: [...initialAcademicScope.divisionIds],
        }
      : !directoryMode && initialTemplate?.selection
        ? {
            boardIds: [...(initialTemplate.selection.boardIds ?? [])],
            mediumIds: [...(initialTemplate.selection.mediumIds ?? [])],
            standardIds: [...(initialTemplate.selection.standardIds ?? [])],
            divisionIds: [...(initialTemplate.selection.divisionIds ?? [])],
          }
        : initialSelection.length
          ? {
              boardIds: [],
              mediumIds: [
                ...new Set(
                  initialSelection.flatMap((student) =>
                    student.academicMediumId ? [student.academicMediumId] : []
                  )
                ),
              ],
              standardIds: [
                ...new Set(
                  initialSelection.flatMap((student) =>
                    student.standardId ? [student.standardId] : []
                  )
                ),
              ],
              divisionIds: [
                ...new Set(
                  initialSelection.flatMap((student) =>
                    student.divisionId ? [student.divisionId] : []
                  )
                ),
              ],
            }
          : emptyScope
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Record<string, StudentDirectoryItem | undefined>>(() =>
    Object.fromEntries(
      directoryMode
        ? initialSelection.map((student) => [student.studentId, student])
        : (initialTemplate?.selection?.studentIds ?? []).map((id) => [id, undefined])
    )
  );
  const [previews, setPreviews] = useState<IdCard[]>([]);
  const [previewStudentId, setPreviewStudentId] = useState(initialSelection[0]?.studentId ?? '');
  const [sheetPage, setSheetPage] = useState(0);
  const [error, setError] = useState('');
  const [selectionChanged, setSelectionChanged] = useState(false);
  const [templateNameTouched, setTemplateNameTouched] = useState(false);
  const issueKey = useRef('');
  const latestContext = useRef({ invalid: contextInvalid, generation: 0 });
  useLayoutEffect(() => {
    latestContext.current = {
      invalid: contextInvalid,
      generation: latestContext.current.generation + 1,
    };
    return () => {
      latestContext.current = { invalid: true, generation: latestContext.current.generation + 1 };
    };
  }, [contextInvalid]);
  const isCurrentContext = (generation: number) =>
    !latestContext.current.invalid && latestContext.current.generation === generation;
  const busy =
    identityUploading ||
    saveState.isLoading ||
    createState.isLoading ||
    updateState.isLoading ||
    previewState.isLoading ||
    exportState.isLoading ||
    issueState.isLoading;
  const templateName = template?.name ?? '';
  const schoolName = template?.schoolName ?? '';
  const templateNameError = templateNameTouched && !templateName.trim();
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  const currentTemplateJson = JSON.stringify(template);
  useEffect(() => {
    onDirtyChange?.(!directoryMode && (currentTemplateJson !== savedTemplateJson || selectionChanged));
  }, [currentTemplateJson, directoryMode, onDirtyChange, savedTemplateJson, selectionChanged]);

  useEffect(() => {
    if (initialTemplate === undefined && templateQuery.currentData && !template) {
      const loaded = templateQuery.currentData;
      setTemplate(normalizeTemplate(loaded));
      setSavedTemplateJson(JSON.stringify(normalizeTemplate(loaded)));
      if (!directoryMode && loaded.selectionRestricted) {
        setSelectionRestricted(true);
      } else if (!directoryMode && loaded.selection) {
        setAcademicYearId(loaded.selection.academicYearId || openerAcademicYearId);
        setScope({
          boardIds: [...(loaded.selection.boardIds ?? [])],
          mediumIds: [...(loaded.selection.mediumIds ?? [])],
          standardIds: [...(loaded.selection.standardIds ?? [])],
          divisionIds: [...(loaded.selection.divisionIds ?? [])],
        });
        setSelected(Object.fromEntries(loaded.selection.studentIds.map((id) => [id, undefined])));
        setHydrationIds([...loaded.selection.studentIds]);
        setHydrationPage(0);
      }
    }
  }, [directoryMode, initialTemplate, openerAcademicYearId, template, templateQuery.currentData]);

  const hydrationChunk = useMemo(
    () => hydrationIds.slice(hydrationPage * 100, (hydrationPage + 1) * 100),
    [hydrationIds, hydrationPage]
  );
  const savedStudents = useGetStudentRecordsDirectoryQuery(
    {
      population: 'All',
      ...(academicYearId ? { academicYearId } : {}),
      studentIds: hydrationChunk,
      skipCount: 0,
      maxResultCount: 100,
    },
    { skip: directoryMode || contextInvalid || selectionRestricted || !hydrationChunk.length }
  );
  useEffect(() => {
    if (
      directoryMode ||
      contextInvalid ||
      selectionRestricted ||
      !hydrationChunk.length ||
      savedStudents.isFetching ||
      savedStudents.isError ||
      !savedStudents.currentData
    )
      return;
    setSelected((previous) => {
      const next = { ...previous };
      savedStudents.currentData!.items.forEach((student) => {
        if (
          Object.prototype.hasOwnProperty.call(next, student.studentId) &&
          !student.maskedFields.includes('Identity')
        )
          next[student.studentId] = student;
      });
      return next;
    });
    setHydrationPage((current) => current + 1);
  }, [
    contextInvalid,
    directoryMode,
    hydrationChunk,
    savedStudents.currentData,
    savedStudents.isError,
    savedStudents.isFetching,
    selectionRestricted,
  ]);

  const options = optionsQuery.currentData;
  const scope = useMemo<Scope>(() => {
    const boardId = storedScope.boardIds[0] ?? options?.boards[0]?.id;
    const mediumId = options?.mediums.find((item) => item.parentId === boardId)?.id;
    return {
      ...storedScope,
      boardIds: storedScope.boardIds.length ? storedScope.boardIds : boardId ? [boardId] : [],
      mediumIds: storedScope.mediumIds.length ? storedScope.mediumIds : mediumId ? [mediumId] : [],
    };
  }, [storedScope, options]);
  const singleScope = Object.values(scope).every((ids) => ids.length <= 1);
  const mediumOptions = useMemo(
    () =>
      (options?.mediums ?? []).filter(
        (item) => scope.boardIds.length === 1 && item.parentId === scope.boardIds[0]
      ),
    [options?.mediums, scope.boardIds]
  );
  const classOptions = useMemo(
    () =>
      (options?.standards ?? [])
        .filter((item) => scope.mediumIds.length === 1 && item.parentId === scope.mediumIds[0])
        .filter(
          (item) =>
            !scope.boardIds.length || mediumOptions.some((medium) => medium.id === item.parentId)
        ),
    [options?.standards, scope.mediumIds, scope.boardIds, mediumOptions]
  );
  const divisionOptions = useMemo(
    () =>
      (options?.divisions ?? [])
        .filter((item) => scope.standardIds.length === 1 && item.parentId === scope.standardIds[0])
        .filter(
          (item) =>
            (!scope.mediumIds.length && !scope.boardIds.length) ||
            classOptions.some((standard) => standard.id === item.parentId)
        ),
    [options?.divisions, scope.standardIds, scope.mediumIds, scope.boardIds, classOptions]
  );
  const scopeReady =
    singleScope &&
    !!options?.boards.some((item) => item.id === scope.boardIds[0]) &&
    mediumOptions.some((item) => item.id === scope.mediumIds[0]) &&
    (!scope.standardIds.length || classOptions.some((item) => item.id === scope.standardIds[0])) &&
    (!scope.divisionIds.length || divisionOptions.some((item) => item.id === scope.divisionIds[0]));
  const directory = useGetStudentRecordsDirectoryQuery(
    {
      population: 'Active',
      ...(academicYearId ? { academicYearId } : {}),
      maxResultCount: 25,
      skipCount: page * 25,
      search: search.trim() || undefined,
      ...scope,
    },
    { skip: step < 2 || contextInvalid || selectionRestricted || !scopeReady }
  );
  const rows = selectionRestricted || !scopeReady ? [] : (directory.currentData?.items ?? []);
  const selectedIds = Object.keys(selected);
  const selectedRows = Object.values(selected).filter((student): student is StudentDirectoryItem =>
    Boolean(student)
  );
  const isSelected = (studentId: string) =>
    Object.prototype.hasOwnProperty.call(selected, studentId);
  const missingPhotoCount = selectedRows.filter((row) => !row.hasPhoto).length;
  const reviewStudent =
    selectedRows.find((student) => student.studentId === previewStudentId) ?? selectedRows[0];
  const reviewIndex = reviewStudent ? selectedRows.indexOf(reviewStudent) : 0;
  const reviewCard = previews.find((card) => card.studentId === reviewStudent?.studentId);
  const configuredSheet = template?.schemaVersion === 2
    ? getIdentityCardSheetLayout(getStudentICardLayout(template), getStudentICardPrintSettings(template)) : null;
  const configuredPrintSettings = template?.schemaVersion === 2 ? getStudentICardPrintSettings(template) : null;
  const cardSizedOutput = configuredPrintSettings?.pageSize === 'Card';
  const cardsPerSheet = Math.max(1, configuredSheet?.effectiveCardsPerPage ?? Math.min(
    template?.cardsPerPage ?? 8, template?.orientation === 'Vertical' ? 9 : 10
  ));
  const sheetCount = Math.max(1, Math.ceil(selectedRows.length / cardsPerSheet));
  const currentSheetPage = Math.min(sheetPage, sheetCount - 1);
  const sheetStudents = selectedRows.slice(
    currentSheetPage * cardsPerSheet,
    (currentSheetPage + 1) * cardsPerSheet
  );
  const contextSummary = [
    ...scope.boardIds.map((id) => options?.boards?.find((item) => item.id === id)?.name),
    ...scope.mediumIds.map((id) => options?.mediums?.find((item) => item.id === id)?.name),
    ...scope.standardIds.map((id) => options?.standards?.find((item) => item.id === id)?.name),
    ...scope.divisionIds.map((id) => options?.divisions?.find((item) => item.id === id)?.name),
    options?.academicYears?.find((item) => item.id === academicYearId)?.name,
  ]
    .filter(Boolean)
    .join(' · ');
  const sample =
    previews[0] ??
    (selectedRows[0]
      ? {
          studentSnapshot: {
            StudentName: studentName(selectedRows[0]),
            GRNumber: selectedRows[0].grNumber ?? '',
            Class: selectedRows[0].standardName ?? '',
            Division: selectedRows[0].divisionName ?? '',
          },
          hasPhoto: selectedRows[0].hasPhoto,
          cardNumber: 'Preview',
        }
      : undefined);
  const patchTemplate = (patch: Partial<IdCardTemplate>) => {
    if (!template) return;
    setTemplate({ ...template, ...patch });
    setPreviews([]);
    setCompleted((current) => current.filter((value) => value < 1));
    issueKey.current = '';
  };
  const changeScope = (patch: Partial<Scope>) => {
    if (lockAcademicScope || selectionRestricted) return;
    setSelectionChanged(true);
    setScope({ ...scope, ...patch });
    setPage(0);
    setSelected({});
    setHydrationIds([]);
    setHydrationPage(0);
    setPreviews([]);
    setCompleted((current) => current.filter((value) => value < 2));
    issueKey.current = '';
  };
  const scopeSelect = (
    label: string,
    key: keyof Scope,
    choices: StudentDirectoryOption[],
    patch: (value: string[]) => Partial<Scope>,
    enabled = true
  ) =>
    lockAcademicScope ? (
      <TextField
        fullWidth
        size="small"
        label={label}
        value={
          scope[key]
            .map(
              (id) =>
                choices.find((item) => item.id === id)?.name ??
                (optionsQuery.isFetching ? 'Loading…' : 'Unavailable')
            )
            .join(', ') || 'All'
        }
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon={GlobalIcons.lockIcon} width={16} />
              </InputAdornment>
            ),
          },
        }}
      />
    ) : (
      <CustomSelect
        label={label}
        value={
          scope[key].length === 1
            ? scope[key][0]
            : key === 'standardIds' || key === 'divisionIds'
              ? 'all'
              : ''
        }
        options={
          key === 'standardIds' || key === 'divisionIds'
            ? [
                { id: 'all', name: key === 'standardIds' ? 'All Classes' : 'All Divisions' },
                ...choices,
              ]
            : choices
        }
        labelKey="name"
        valueKey="id"
        isLoading={optionsQuery.isFetching}
        onChange={(value) => changeScope(patch(value === 'all' ? [] : [String(value)]))}
        disabled={busy || optionsQuery.isError || selectionRestricted || !enabled}
        formControlProps={{ sx: { width: '100%', minWidth: 0 } }}
      />
    );
  const toggleStudent = (student: StudentDirectoryItem) => {
    if (selectionRestricted) return;
    setSelectionChanged(true);
    setSelected((previous) => {
      const next = { ...previous };
      if (Object.prototype.hasOwnProperty.call(next, student.studentId))
        delete next[student.studentId];
      else if (Object.keys(next).length < 100) next[student.studentId] = student;
      return next;
    });
    setPreviews([]);
    setCompleted((current) => current.filter((value) => value < 2));
    issueKey.current = '';
  };
  const togglePage = () => {
    if (selectionRestricted) return;
    setSelectionChanged(true);
    const allSelected = rows.every((row) => isSelected(row.studentId));
    setSelected((previous) => {
      const next = { ...previous };
      rows.forEach((row) => {
        if (allSelected) delete next[row.studentId];
        else if (Object.keys(next).length < 100) next[row.studentId] = row;
      });
      return next;
    });
    setPreviews([]);
    setCompleted((current) => current.filter((value) => value < 2));
    issueKey.current = '';
  };
  const save = async () => {
    if (!template || contextInvalid) return null;
    if (!templateName.trim()) {
      setTemplateNameTouched(true);
      setStep(0);
      setError('');
      return null;
    }
    if (!schoolName.trim() || !template.fields.length) {
      setError('Enter a school name and choose at least one card field.');
      return null;
    }
    const designErrors = getStudentICardDesignErrors(template);
    if (designErrors.length) { setError(designErrors[0]); return null; }
    try {
      const body = { ...template };
      delete body.selectionRestricted;
      const persistedAssignment =
        template.selection &&
        [
          template.selection.studentIds,
          template.selection.boardIds,
          template.selection.mediumIds,
          template.selection.standardIds,
          template.selection.divisionIds,
        ].some((ids) => ids?.length);
      const currentAssignment =
        selectedIds.length > 0 || Object.values(storedScope).some((ids) => ids.length > 0);
      if (selectionRestricted || (!currentAssignment && !persistedAssignment))
        delete body.selection;
      else
        body.selection = {
          academicYearId: academicYearId ?? null,
          boardIds: [...storedScope.boardIds],
          mediumIds: [...storedScope.mediumIds],
          standardIds: [...storedScope.standardIds],
          divisionIds: [...storedScope.divisionIds],
          studentIds: selectedIds,
        };
      const saved =
        initialTemplate === undefined
          ? await saveTemplate(body).unwrap()
          : template.id
            ? await updateTemplate({ id: template.id, body }).unwrap()
            : await createTemplate(body).unwrap();
      const normalized = normalizeTemplate(saved, body);
      setTemplate(normalized);
      setSavedTemplateJson(JSON.stringify(normalized));
      setSelectionChanged(false);
      if (saved.selectionRestricted && !directoryMode) {
        setSelectionRestricted(true);
        setSelected({});
        setHydrationIds([]);
        setScope(emptyScope);
        setPreviews([]);
        setPreviewStudentId('');
        setCompleted((current) => current.filter((value) => value < 2));
        setStep((current) => Math.min(current, 2));
      }
      setError('');
      shikshaMitraToast.success({ message: 'Student I-Card template saved.' });
      return saved;
    } catch (failure: unknown) {
      const problem = parseApiProblemDetail(failure);
      setError(problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration'
        ? problem.detail : 'The template could not be saved. Refresh if another user changed it.');
      return null;
    }
  };
  const preview = async (templateId = template?.id ?? undefined) => {
    if (contextInvalid || selectionRestricted) return false;
    const { generation } = latestContext.current;
    if (!selectedIds.length) {
      setError('Select at least one student.');
      return false;
    }
    if (selectedIds.length > 100 || selectedRows.length !== selectedIds.length) {
      setError(
        'Preview requires up to 100 students with available directory details. Saved selections are retained.'
      );
      return false;
    }
    try {
      const cards = await previewCards({
        studentIds: selectedIds,
        templateId,
      }).unwrap();
      if (!isCurrentContext(generation)) return false;
      setPreviews(cards);
      if (directoryMode && cards[0]?.templateSnapshot) {
        setTemplate((current) => ({
          ...normalizeTemplate(cards[0].templateSnapshot, current ?? defaultTemplate),
          cardsPerPage: current?.cardsPerPage ?? cards[0].templateSnapshot.cardsPerPage,
        }));
        setSheetPage(0);
      }
      setError('');
      return true;
    } catch {
      if (isCurrentContext(generation))
        setError('Cards could not be previewed. Check student access and try again.');
      return false;
    }
  };
  const advance = async () => {
    if (contextInvalid || (step === 2 && selectionRestricted)) return;
    const { generation } = latestContext.current;
    if (step === 0 && !templateName.trim()) {
      setTemplateNameTouched(true);
      setError('');
      return;
    }
    if (step === 1 && !schoolName.trim()) {
      setError('Enter a school name.');
      return;
    }
    if (step === 1 && !template?.fields.length) {
      setError('Choose at least one card field.');
      return;
    }
    if (step === 1 && template) {
      const designErrors = getStudentICardDesignErrors(template);
      if (designErrors.length) { setError(designErrors[0]); return; }
    }
    if (step === 0 && template && template.schemaVersion !== 2) {
      patchTemplate(applyStudentICardDesign(template, getStudentICardLayout(template),
        getStudentICardPrintSettings(template)));
    }
    if (step === 2 && !selectedIds.length) {
      setError('Select at least one student.');
      return;
    }
    const saved = step === 2 ? (directoryMode ? template : await save()) : null;
    if (!isCurrentContext(generation)) return;
    if (step === 2 && !saved) return;
    if (step === 2 && !directoryMode && saved?.selectionRestricted) return;
    if (step === 2 && !(await preview(saved?.id ?? undefined))) return;
    if (step === 3 && !previews.length && !(await preview())) return;
    if (!isCurrentContext(generation)) return;
    setError('');
    setCompleted((current) => (current.includes(step) ? current : [...current, step]));
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const exportPdf = async () => {
    if (contextInvalid || selectionRestricted || !template || !selectedIds.length) return;
    const { generation } = latestContext.current;
    if (selectedIds.length > 100 || selectedRows.length !== selectedIds.length) {
      setError(
        'Export requires up to 100 students with available directory details. Saved selections are retained.'
      );
      return;
    }
    const saved = directoryMode ? template : await save();
    if (!saved || (!directoryMode && saved.selectionRestricted) || !isCurrentContext(generation))
      return;
    try {
      const pdf = await exportCards({
        studentIds: selectedIds,
        cardsPerPage: template.cardsPerPage,
        templateId: saved.id ?? undefined,
      }).unwrap();
      if (!isCurrentContext(generation)) return;
      if (!pdf.size || (pdf.type && !pdf.type.includes('pdf'))) throw new Error('Invalid PDF');
      downloadRecordPdf(pdf, `Student-I-Cards-${new Date().toISOString().slice(0, 10)}.pdf`);
      shikshaMitraToast.success({ message: 'Student I-Card PDF downloaded.' });
    } catch (failure: unknown) {
      const problem = parseApiProblemDetail(failure);
      if (isCurrentContext(generation))
        setError(problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration'
          ? problem.detail : 'Bulk PDF could not be exported. Check student access and retry.');
    }
  };
  const issue = async () => {
    if (contextInvalid || selectionRestricted || !selectedIds.length) return;
    const { generation } = latestContext.current;
    if (selectedIds.length > 100 || selectedRows.length !== selectedIds.length) {
      setError(
        'Issuing cards requires up to 100 students with available directory details. Saved selections are retained.'
      );
      return;
    }
    const saved = directoryMode ? template : await save();
    if (!saved || (!directoryMode && saved.selectionRestricted) || !isCurrentContext(generation))
      return;
    try {
      issueKey.current ||= crypto.randomUUID();
      await issueCards({
        studentIds: selectedIds,
        idempotencyKey: issueKey.current,
        templateId: saved.id ?? undefined,
      }).unwrap();
      if (!isCurrentContext(generation)) return;
      shikshaMitraToast.success({
        message: 'Student I-Cards issued. Select a student to view history.',
      });
      onClose();
    } catch {
      if (isCurrentContext(generation))
        setError('Cards could not be issued. You can retry without creating duplicates.');
    }
  };

  if (initialTemplate === undefined && templateQuery.isError)
    return (
      <StudentFeedback
        notificationKey="STU-0863"
        presentation="toast"
        severity="error"
        action={<Button onClick={() => templateQuery.refetch()}>Retry</Button>}
      >
        Student I-Card template could not be loaded.
      </StudentFeedback>
    );
  if (!template) return <LinearProgress aria-label="Loading student I-Card template" />;

  const columns: IColumn[] = [
    {
      id: 'select',
      label: '',
      isSort: false,
      isFilter: false,
      minWidth: 50,
      render: (_value, data) => {
        const row = data as StudentDirectoryItem;
        return (
          <Checkbox
            size="small"
            slotProps={{ input: { 'aria-label': `Select ${studentName(row)}` } }}
            checked={isSelected(row.studentId)}
            disabled={
              busy ||
              selectionRestricted ||
              (!isSelected(row.studentId) && selectedIds.length >= 100)
            }
            onChange={() => toggleStudent(row)}
          />
        );
      },
    },
    {
      id: 'firstName',
      label: 'Student',
      minWidth: 190,
      render: (_value, data) => studentName(data as StudentDirectoryItem),
    },
    { id: 'grNumber', label: 'GR number', minWidth: 110 },
    { id: 'standardName', label: 'Class', minWidth: 110 },
    { id: 'divisionName', label: 'Division', minWidth: 110 },
    {
      id: 'hasPhoto',
      label: 'Photo',
      minWidth: 80,
      render: (value) => (value ? 'Ready' : 'Missing'),
    },
  ];

  return (
    <Paper
      sx={{
        height: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2,
        gap: 2,
      }}
    >
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <CustomStepper
          steps={visibleSteps}
          activeStep={step - firstStep}
          ariaLabel="Student I-Card creation steps"
          stepStates={visibleSteps.map((_, index) =>
            completed.includes(index + firstStep)
              ? 'completed'
              : index + firstStep === step
                ? 'active'
                : 'pending'
          )}
        />
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ display: { xs: 'block', sm: 'none' } }}
        aria-live="polite"
      >
        Step {step - firstStep + 1} of {visibleSteps.length}: {steps[step]}
      </Typography>
      {contextInvalid && (
        <Typography role="alert" variant="body2" color="warning.main">
          The academic year changed. Close this workspace and select students again.
        </Typography>
      )}
      {error && (
        <StudentFeedback
          notificationKey="STU-0864"
          presentation="persistent"
          severity="error"
          onClose={() => setError('')}
        >
          {error}
        </StudentFeedback>
      )}
      <Box
        component="fieldset"
        disabled={busy || contextInvalid}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: step === 1 ? 'hidden' : 'auto',
          border: 0,
          m: 0,
          p: 0,
          pr: 0.5,
        }}
      >
        <Grid container spacing={2} sx={{ height: step === 1 ? 1 : undefined, minHeight: 0 }}>
          <Grid size={{ xs: 12, md: step >= 1 ? 12 : 7 }} sx={{ minWidth: 0, height: step === 1 ? 1 : undefined, minHeight: 0 }}>
            {step === 0 && (
              <Stack spacing={2}>
                <Grid container spacing={1.25}>
                  {presets.map((preset) => (
                    <Grid key={preset.key} size={{ xs: 12, sm: 6 }}>
                      <Paper
                        component="button"
                        type="button"
                        variant="outlined"
                        onClick={() =>
                          patchTemplate(preset.key === 'classic-identity'
                            ? { ...createStudentICardTemplate(), name: template.name,
                                schoolName: template.schoolName, schoolAddress: template.schoolAddress,
                                headerText: template.headerText, footerText: template.footerText,
                                logo: template.logo }
                            : { presetKey: preset.key, primaryColor: preset.color,
                                orientation: preset.key === 'vertical-badge' ? 'Vertical' : 'Horizontal',
                                schemaVersion: 1, layoutJson: null, printSettingsJson: null, backSideEnabled: false })
                        }
                        sx={{
                          p: 1.5,
                          width: 1,
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderColor:
                            template.presetKey === preset.key ? 'primary.main' : 'divider',
                          bgcolor:
                            template.presetKey === preset.key
                              ? 'action.selected'
                              : 'background.paper',
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Box
                            sx={{
                              width: 34,
                              height: 24,
                              borderRadius: 0.75,
                              bgcolor: preset.color,
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">{preset.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {preset.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <ShakingTextField error={templateNameError}><TextField
                  size="small"
                  required
                  label="Template name"
                  value={templateName}
                  inputProps={{ maxLength: 150 }}
                  onChange={(event) => patchTemplate({ name: event.target.value })}
                  onBlur={() => setTemplateNameTouched(true)}
                  error={templateNameError}
                  helperText={
                    templateNameError
                      ? 'Template name is required.'
                      : 'Name this design so you can find and reuse it.'
                  }
                /></ShakingTextField>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={template.orientation}
                  disabled={template.schemaVersion === 2}
                  onChange={(_event, value) => value && patchTemplate({ orientation: value })}
                  aria-label="Card orientation"
                >
                  <ToggleButton value="Horizontal">Horizontal</ToggleButton>
                  <ToggleButton value="Vertical">Vertical</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
            {step === 1 && (
              <StudentICardDesigner template={template} card={sample} disabled={busy}
                onBusyChange={setIdentityUploading} onChange={patchTemplate} />
            )}
            {step === 2 && (
              <Stack spacing={2}>
                <FormSectionHeader
                  title="Choose Students"
                  icon={GlobalIcons.assigned}
                  titleTypographyProps={{ fontWeight: 600 }}
                  descriptionTooltip={
                    lockAcademicScope
                      ? 'Academic filters come from Student List and stay read-only for bulk printing. Choose which students to include below.'
                      : 'Choose one board and medium. All Classes and All Divisions keep those filters open; choose a class to enable Division.'
                  }
                />
                {optionsQuery.isError && (
                  <StudentFeedback
                    notificationKey="STU-0865"
                    presentation="toast"
                    severity="error"
                    action={<Button onClick={() => optionsQuery.refetch()}>Retry</Button>}
                  >
                    Academic choices could not be loaded.
                  </StudentFeedback>
                )}
                {selectionRestricted && (
                  <Typography role="status" variant="body2" color="text.secondary">
                    Student assignments are restricted in your current academic scope. You can still
                    save design changes.
                  </Typography>
                )}
                {!singleScope && !lockAcademicScope && (
                  <Typography role="status" variant="body2" color="text.secondary">
                    Saved filters contain multiple selections. Choose one board, medium, class or
                    division to update the student scope. Saved students are retained until you
                    change a filter.
                  </Typography>
                )}
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    {scopeSelect('Board', 'boardIds', options?.boards ?? [], (value) => ({
                      boardIds: value,
                      mediumIds: [],
                      standardIds: [],
                      divisionIds: [],
                    }))}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    {scopeSelect(
                      'Medium',
                      'mediumIds',
                      mediumOptions,
                      (value) => ({
                        mediumIds: value,
                        standardIds: [],
                        divisionIds: [],
                      }),
                      scope.boardIds.length === 1
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    {scopeSelect(
                      'Class',
                      'standardIds',
                      classOptions,
                      (value) => ({
                        standardIds: value,
                        divisionIds: [],
                      }),
                      scope.mediumIds.length === 1
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    {scopeSelect(
                      'Division',
                      'divisionIds',
                      divisionOptions,
                      (value) => ({
                        divisionIds: value,
                      }),
                      scope.standardIds.length === 1
                    )}
                  </Grid>
                </Grid>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                >
                  <TextField
                    size="small"
                    label="Search students"
                    disabled={selectionRestricted}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(0);
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    disabled={!rows.length || busy || selectionRestricted}
                    onClick={togglePage}
                  >
                    {rows.length && rows.every((row) => isSelected(row.studentId))
                      ? 'Clear page'
                      : 'Select page'}
                  </Button>
                  <Typography variant="body2">{selectedIds.length}/100 selected</Typography>
                </Stack>
                {directory.isError && (
                  <StudentFeedback
                    notificationKey="STU-0866"
                    presentation="toast"
                    severity="error"
                    action={<Button onClick={() => directory.refetch()}>Retry</Button>}
                  >
                    Students could not be loaded.
                  </StudentFeedback>
                )}
                <CustomizableTable
                  tableId="student-icard-builder-selection"
                  columns={columns}
                  data={rows}
                  isLoading={directory.isFetching}
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  isShowedDense={false}
                  noDataText="No active students match these selections."
                  wrapperProps={{ sx: { minHeight: 280 } }}
                  tableContainerProps={{ sx: { maxHeight: 360 } }}
                />
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                  <Typography variant="caption">
                    {directory.currentData?.totalCount ?? 0} matching students
                  </Typography>
                  <Button
                    disabled={page === 0 || directory.isFetching}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </Button>
                  <Typography variant="caption">Page {page + 1}</Typography>
                  <Button
                    disabled={
                      directory.isFetching ||
                      (page + 1) * 25 >= (directory.currentData?.totalCount ?? 0)
                    }
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            )}
            {step === 3 && (
              <Stack spacing={2}>
                <FormSectionHeader
                  title="Review Cards"
                  actionFullWidthOnMobile
                  icon={GlobalIcons.eye}
                  titleTypographyProps={{ fontWeight: 600 }}
                  descriptionTooltip="Review each selected student's card before exporting or issuing. Refresh preview to reload the card data."
                  action={
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={busy || contextInvalid}
                      onClick={() => preview()}
                      startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                    >
                      Refresh preview
                    </Button>
                  }
                />
                {contextSummary && (
                  <Typography variant="body2" color="text.secondary">
                    {contextSummary}
                  </Typography>
                )}
                <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
                  <Typography variant="body2">
                    {selectedRows.length} {selectedRows.length === 1 ? 'student' : 'students'}{' '}
                    selected
                  </Typography>
                  <Typography
                    variant="body2"
                    color={missingPhotoCount ? 'warning.main' : 'text.secondary'}
                  >
                    {missingPhotoCount} missing {missingPhotoCount === 1 ? 'photo' : 'photos'}
                  </Typography>
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems="center"
                  sx={{ width: 1, maxWidth: 600, mx: 'auto' }}
                >
                  <CustomSelect
                    label="Student to preview"
                    value={reviewStudent?.studentId ?? ''}
                    options={selectedRows.map((student) => ({
                      id: student.studentId,
                      name: `${studentName(student)}${student.grNumber ? ` · ${student.grNumber}` : ''}`,
                    }))}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => setPreviewStudentId(String(value))}
                    disabled={busy}
                    isSearch
                    formControlProps={{ sx: { flex: 1, minWidth: 0 } }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                    <Button
                      size="small"
                      variant="outlined"
                      aria-label="Previous student"
                      disabled={busy || reviewIndex === 0}
                      onClick={() => setPreviewStudentId(selectedRows[reviewIndex - 1].studentId)}
                    >
                      Previous
                    </Button>
                    <Typography variant="caption" aria-live="polite">
                      {reviewIndex + 1} of {selectedRows.length}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      aria-label="Next student"
                      disabled={busy || reviewIndex >= selectedRows.length - 1}
                      onClick={() => setPreviewStudentId(selectedRows[reviewIndex + 1].studentId)}
                    >
                      Next
                    </Button>
                  </Stack>
                </Stack>
                <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.neutral', borderRadius: 2 }}>
                  <Box
                    sx={{
                      width: 1,
                      maxWidth: template.orientation === 'Vertical' ? 320 : 560,
                      mx: 'auto',
                    }}
                  >
                    <StudentCardPreview template={template} card={reviewCard} />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {reviewCard?.hasPhoto ? 'Photo is available in the PDF.' : 'Photo unavailable'}
                </Typography>
              </Stack>
            )}
            {step === 4 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                    <FormSectionHeader
                      title="Export Student I-Cards"
                      icon={GlobalIcons.printer}
                      titleTypographyProps={{ fontWeight: 600 }}
                      descriptionTooltip="Download a printable PDF or issue numbered cards to student history. These are separate actions."
                    />
                    {contextSummary && (
                      <Typography variant="body2" color="text.secondary">
                        {contextSummary}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {selectedRows.length} {selectedRows.length === 1 ? 'card' : 'cards'} selected
                      · {sheetCount * (template.backSideEnabled && configuredPrintSettings?.sideMode === 'both' ? 2 : 1)}{' '}
                      {cardSizedOutput ? 'card-sized PDF pages' : 'A4 pages'}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      label="Cards per A4 page"
                      value={cardSizedOutput ? 1 : template.cardsPerPage}
                      disabled={cardSizedOutput}
                      helperText={configuredSheet && !cardSizedOutput
                        ? `${configuredSheet.effectiveCardsPerPage} fit at the configured size; cards are never shrunk.` : undefined}
                      onChange={(event) => {
                        setSheetPage(0);
                        const cardsPerPage = Math.max(1, Math.min(10, Number(event.target.value) || 1));
                        setTemplate({
                          ...template,
                          cardsPerPage,
                          ...(configuredPrintSettings ? { printSettingsJson: JSON.stringify(
                            { ...configuredPrintSettings, cardsPerPage }) } : {}),
                        });
                      }}
                      inputProps={{ min: 1, max: 10 }}
                      sx={{ maxWidth: 220 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Layout: {template.orientation}
                    </Typography>
                    {!configuredSheet && template.orientation === 'Vertical' && template.cardsPerPage === 10 && (
                      <Typography variant="caption" color="text.secondary">
                        Portrait cards fit up to 9 per A4 page.
                      </Typography>
                    )}
                    <Stack spacing={2} alignItems="flex-start">
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Iconify icon={GlobalIcons.download} width={18} />}
                          disabled={busy || contextInvalid || !selectedRows.length}
                          onClick={exportPdf}
                        >
                          Export bulk PDF
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          Download a printable PDF.
                        </Typography>
                      </Stack>
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon={GlobalIcons.assigned} width={18} />}
                          disabled={busy || contextInvalid || !selectedRows.length}
                          onClick={issue}
                        >
                          Issue cards
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          Save numbered cards in student history.
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0 }}>
                    <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>
                      {configuredSheet ? 'PDF Print Preview' : 'A4 Print Preview'}
                    </Typography>
                    {configuredSheet ? <StudentICardSheetPreview template={template}
                      cards={sheetStudents.map((student) => previews.find((item) => item.studentId === student.studentId))} /> : <Box
                      sx={{
                        width: 1,
                        maxWidth: 320,
                        mx: 'auto',
                        aspectRatio: '210 / 297',
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        p: '3.333%',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          // The PDF uses 85.6/54 mm cards within the 196 mm A4 content width.
                          gridTemplateColumns:
                            template.orientation === 'Vertical'
                              ? 'repeat(3, minmax(0, 27.551%))'
                              : 'repeat(2, minmax(0, 43.673%))',
                          columnGap: '1.0204%',
                          rowGap: 0.5,
                        }}
                      >
                        {Array.from({ length: cardsPerSheet }, (_, index) => {
                          const student = sheetStudents[index];
                          const card = previews.find(
                            (item) => item.studentId === student?.studentId
                          );
                          return student ? (
                            <StudentCardPreview
                              key={student.studentId}
                              template={template}
                              card={card}
                            />
                          ) : (
                            <Box
                              key={`empty-${index}`}
                              aria-label="Unused card slot"
                              sx={{
                                aspectRatio:
                                  template.orientation === 'Vertical' ? '260 / 420' : '420 / 260',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 0.5,
                                bgcolor: 'background.neutral',
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>}
                    <Typography variant="caption" component="p" textAlign="center" sx={{ mt: 1 }}>
                      {cardsPerSheet} {cardsPerSheet === 1 ? 'slot' : 'slots'} per page ·{' '}
                      {sheetStudents.length} {sheetStudents.length === 1 ? 'card' : 'cards'} on this
                      page
                    </Typography>
                    {sheetCount > 1 && (
                      <Stack
                        direction="row"
                        justifyContent="center"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 1 }}
                      >
                        <Button
                          size="small"
                          aria-label="Previous A4 page"
                          disabled={busy || currentSheetPage === 0}
                          onClick={() => setSheetPage(currentSheetPage - 1)}
                        >
                          Previous
                        </Button>
                        <Typography variant="caption" aria-live="polite">
                          Page {currentSheetPage + 1} of {sheetCount}
                        </Typography>
                        <Button
                          size="small"
                          aria-label="Next A4 page"
                          disabled={busy || currentSheetPage >= sheetCount - 1}
                          onClick={() => setSheetPage(currentSheetPage + 1)}
                        >
                          Next
                        </Button>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Grid>
          {step === 0 && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, position: 'sticky', top: 0 }}>
                <Typography variant="subtitle2">Live Preview</Typography>
                <Typography variant="caption" color="text.secondary">
                  Student card composition
                </Typography>
                <StudentCardPreview template={template} card={sample} />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1}
        sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}
      >
        <Button
          variant="outlined"
          disabled={busy}
          onClick={() => (step === firstStep ? onClose() : setStep((value) => value - 1))}
        >
          {step === firstStep ? 'Cancel' : 'Back'}
        </Button>
        <Stack direction="row" spacing={1}>
          {!directoryMode && (
            <Button variant="outlined" disabled={busy || contextInvalid} onClick={save}>
              Save
            </Button>
          )}
          {step < 4 ? (
            <Button
              variant="contained"
              disabled={busy || contextInvalid || (step === 2 && selectionRestricted)}
              onClick={advance}
            >
              Next
            </Button>
          ) : (
            <Button variant="contained" disabled={busy} onClick={onClose}>
              Done
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function StudentCardPreview({
  template,
  card,
  side,
  interactive = true,
}: {
  template: IdCardTemplate;
  card?: Pick<IdCard, 'studentSnapshot' | 'hasPhoto' | 'cardNumber'>;
  side?: 'front' | 'back';
  interactive?: boolean;
}) {
  const vertical = template.orientation === 'Vertical';
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const cardWidth = vertical ? 260 : 420;
  const cardHeight = vertical ? 420 : 260;
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const measure = () => setAvailableWidth(element.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (template.schemaVersion === 2) return <StudentConfiguredCardPreview
    template={template} card={card} side={side} interactive={interactive} />;
  return (
    <Box
      ref={containerRef}
      role="img"
      aria-label={
        card?.studentSnapshot.StudentName
          ? `I-card preview for ${card.studentSnapshot.StudentName}`
          : 'I-card composition preview'
      }
      sx={{
        width: 1,
        minWidth: 0,
        position: 'relative',
        aspectRatio: `${cardWidth} / ${cardHeight}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: cardWidth,
          height: cardHeight,
          transform: `scale(${availableWidth ? availableWidth / cardWidth : 0})`,
          transformOrigin: 'top left',
          bgcolor: template.backgroundColor,
          color: 'text.primary',
          border: '1px solid',
          borderColor: template.primaryColor,
          borderRadius: 1.5,
          p: 2,
          boxSizing: 'border-box',
          boxShadow: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={{ color: template.primaryColor, fontWeight: 700 }}
        >
          {template.schoolName || 'School Name'}
        </Typography>
        {template.schoolAddress && (
          <Typography variant="caption" noWrap display="block">
            {template.schoolAddress}
          </Typography>
        )}
        {template.presetKey !== 'minimal' && (
          <Box
            sx={{ borderTop: '2px solid', borderColor: template.primaryColor, mt: 0.5, mb: 1 }}
          />
        )}
        <Typography variant="caption" fontWeight={700}>
          {template.headerText}
        </Typography>
        <Stack direction={vertical ? 'column' : 'row'} spacing={1.5} sx={{ mt: 1 }}>
          {template.showPhoto && (
            <Box
              sx={{
                width: template.presetKey === 'photo-first' ? 108 : vertical ? 72 : 80,
                height: template.presetKey === 'photo-first' ? 112 : vertical ? 84 : 96,
                border: '1px solid',
                borderColor: template.primaryColor,
                borderRadius: template.presetKey === 'modern-student' ? '50%' : 1,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption">{card?.hasPhoto ? 'PHOTO' : 'NO PHOTO'}</Typography>
            </Box>
          )}
          <Stack spacing={0.25} minWidth={0}>
            {template.fields.map((field) => (
              <Typography key={field} variant="caption" noWrap>
                <strong>{fieldChoices.find((item) => item.id === field)?.name ?? field}:</strong>{' '}
                {card?.studentSnapshot[field] || '—'}
              </Typography>
            ))}
            {card?.cardNumber && card.cardNumber !== 'Preview' && (
              <Typography variant="caption">Card: {card.cardNumber}</Typography>
            )}
          </Stack>
          {template.showQrCode && (
            <Box
              sx={{
                width: 44,
                height: 44,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" color="text.primary">
                QR
              </Typography>
            </Box>
          )}
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontSize: 10 }}>
          {template.footerText}
        </Typography>
      </Box>
    </Box>
  );
}
