'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { PendingAssignmentStudent } from 'src/redux/student/pending-assignment/type';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { StudentApi } from 'src/redux/student';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Save, Refresh, ChecklistOutlined } from '@mui/icons-material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useLazyGetPendingAssignmentStudentsQuery } from 'src/redux/student/pending-assignment/pending-assignment-api';
import {
  useUpdateStudentRollNumberMutation,
  useLazyGetRollNumberProjectionsQuery,
} from 'src/redux/student/roll-number/roll-number-api';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Chip,
  Paper,
  Button,
  Backdrop,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { extractRollNumberProjectionItems } from '../roll-generation/roll-number-projections';
import { getGrNumberChanges, hasAssignedGrNumber, buildGrNumberUpdates } from '../gr-generation/gr-number-updates';
import {
  hasRollNumberValidationErrors,
  buildRollNumberValidationErrors,
} from '../roll-generation/roll-number-validation';

// ─── Tab values ───────────────────────────────────────────────────────────────
const TAB_GR = 'grAssignment';
const TAB_ROLL = 'rollAssignment';
type ActiveTab = typeof TAB_GR | typeof TAB_ROLL;

// ─── Fixed column width for editable cells ────────────────────────────────────
const EDIT_COLUMN_WIDTH = 180;

// ─── CSV export helper ────────────────────────────────────────────────────────
const exportToCSV = (rows: PendingAssignmentStudent[], tab: ActiveTab) => {
  const headers =
    tab === TAB_GR
      ? ['Student Name', 'Admission Date', 'Class', 'Division', 'GR No.']
      : ['Student Name', 'Admission Date', 'GR No.', 'Roll No.'];

  const dataRows = rows.map((s) =>
    tab === TAB_GR
      ? [
          s.studentName,
          s.admissionDate ?? '-',
          s.standardName ?? '-',
          s.divisionName ?? '-',
          s.grNo ?? '-',
        ]
      : [s.studentName, s.admissionDate ?? '-', s.grNo ?? '-', s.rollNo ?? '-']
  );

  const csv = [headers, ...dataRows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pending-${tab === TAB_GR ? 'gr' : 'roll'}-assignments.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Component ────────────────────────────────────────────────────────────────
const PendingAssignmentScreen = ({ division, classes }: { division: string; classes: string }) => {
  // ── Active tab (GR / Roll) — same useTabs-style pattern as admission screen ─
  const [activeTab, setActiveTab] = useState<ActiveTab>(TAB_GR);

  // ── Date range filter — same pattern as entrance-exam screen ──────────────
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // ── Table data ─────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState<PendingAssignmentStudent[]>([]);
  const [initialData, setInitialData] = useState<PendingAssignmentStudent[]>([]);

  // ── Modified row highlight ─────────────────────────────────────────────────
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());

  // ── Manual edit mode (resets on tab change) ────────────────────────────────
  const [isManual, setIsManual] = useState(false);

  // ── Roll arrangement selectors (same as roll-generation screen) ───────────
  const [arrangementType, setArrangementType] = useState('');
  const [arrangeBy, setArrangeBy] = useState('');

  // ── Dialogs ────────────────────────────────────────────────────────────────
  const autoGenerateConfirmDialog = useBoolean();
  const saveConfirmDialog = useBoolean();

  // ── Redux ──────────────────────────────────────────────────────────────────
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // ── API — pending students ─────────────────────────────────────────────────
  const [fetchPendingStudents, { isLoading: isPendingLoading, isFetching: isPendingFetching }] =
    useLazyGetPendingAssignmentStudentsQuery();

  // ── API — GR ──────────────────────────────────────────────────────────────
  const [fetchGrProjections, { isLoading: isGrProjectionsLoading }] =
    useLazyGetStudentForGrNumberQuery();

  const [updateGrNumbers, { isLoading: isGrSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGrNumberMutation,
    popupConfig: { error: false },
  });

  // ── API — Roll ─────────────────────────────────────────────────────────────
  const [fetchRollProjections, { isLoading: isRollProjectionsLoading }] =
    useLazyGetRollNumberProjectionsQuery();

  const [updateRollNumbers, { isLoading: isRollSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentRollNumberMutation,
    popupConfig: { error: false },
  });

  // ── Fetch when filters change ──────────────────────────────────────────────
  useEffect(() => {
    if (classes && division) {
      fetchPendingStudents({
        standardId: classes,
        divisionId: division,
        ...(startDate ? { admissionDateFrom: startDate.format('YYYY-MM-DD') } : {}),
        ...(endDate ? { admissionDateTo: endDate.format('YYYY-MM-DD') } : {}),
      })
        .unwrap()
        .then((result: any) => {
          const items: PendingAssignmentStudent[] = Array.isArray(result)
            ? result
            : (result?.items ?? result?.data?.items ?? result?.data ?? []);
          setTableData(items);
          setInitialData(items);
          setModifiedRowIds(new Set());
        })
        .catch(() => {
          // errors surfaced by the toast system
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, division, startDate, endDate]);

  // ── Tab-specific table rows ────────────────────────────────────────────────
  const grTabData = useMemo(
    () => tableData.filter((s) => !hasAssignedGrNumber(s)),
    [tableData]
  );

  const rollTabData = useMemo(
    () => tableData.filter((s) => s.rollNo === null || s.rollNo === undefined),
    [tableData]
  );

  // ── Changes summaries ─────────────────────────────────────────────────────
  const grChangesSummary = useMemo(
    () => getGrNumberChanges(tableData, initialData),
    [tableData, initialData]
  );

  const rollChangesSummary = useMemo(() => {
    const changes: { studentName: string; oldRollNo: number | null; newRollNo: number | null }[] =
      [];
    tableData.forEach((current) => {
      const original = initialData.find((item) => item.studentId === current.studentId);
      if (original && original.rollNo !== current.rollNo) {
        changes.push({
          studentName: current.studentName || 'Unknown',
          oldRollNo: original.rollNo ?? null,
          newRollNo: current.rollNo ?? null,
        });
      }
    });
    return changes;
  }, [tableData, initialData]);

  const activeChangesSummary = activeTab === TAB_GR ? grChangesSummary : rollChangesSummary;

  // ── Roll validation ───────────────────────────────────────────────────────
  const rollNumberLimit = rollTabData.length;
  const rollNumberErrors = useMemo(
    () => buildRollNumberValidationErrors(rollTabData, rollNumberLimit),
    [rollTabData, rollNumberLimit]
  );
  const hasRollErrors = hasRollNumberValidationErrors(rollNumberErrors);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const isApiLoading =
    isGrProjectionsLoading || isGrSaving || isRollProjectionsLoading || isRollSaving;
  const isTableLoading = isPendingLoading || isPendingFetching;

  const isAutoDisabled =
    activeTab === TAB_GR
      ? grTabData.length === 0 || isGrProjectionsLoading
      : isRollProjectionsLoading || rollTabData.length === 0 || !arrangementType || !arrangeBy;

  // ── Tab change ─────────────────────────────────────────────────────────────
  const handleTabChange = (_: React.SyntheticEvent, newValue: ActiveTab) => {
    setActiveTab(newValue);
    setIsManual(false);
    setArrangementType('');
    setArrangeBy('');
  };

  // ── Inline edit handlers ───────────────────────────────────────────────────
  const handleGrNumberChange = (id: string, newValue: number | null) => {
    setTableData((prev) =>
      prev.map((item) => (item.studentId === id ? { ...item, grNo: newValue } : item))
    );
    setModifiedRowIds((prev) => new Set(prev).add(id));
  };

  const handleRollNoChange = (id: string, newValue: number | null) => {
    setTableData((prev) =>
      prev.map((item) => (item.studentId === id ? { ...item, rollNo: newValue } : item))
    );
    setModifiedRowIds((prev) => new Set(prev).add(id));
  };

  // ── Auto Generate — GR ────────────────────────────────────────────────────
  const handleGrAutoGenerate = async () => {
    if (!division) return;
    autoGenerateConfirmDialog.onFalse();
    try {
      const result = await fetchGrProjections(division).unwrap();
      if (result?.data && Array.isArray(result.data)) {
        const studentGrMap = new Map<string, number>();
        result.data.forEach((student: any) => {
          if (student.studentId && !student.currentGrNumber?.trim() && student.grNumber !== null && student.grNumber !== undefined) {
            studentGrMap.set(student.studentId, student.grNumber);
          }
        });

        const newModifiedIds = new Set(modifiedRowIds);
        let generatedCount = 0;

        setTableData((prev) =>
          prev.map((item) => {
            const autoGr = studentGrMap.get(item.studentId);
            if (!hasAssignedGrNumber(item) && autoGr !== undefined) {
              newModifiedIds.add(item.studentId);
              generatedCount += 1;
              return { ...item, grNo: autoGr };
            }
            return item;
          })
        );
        setModifiedRowIds(newModifiedIds);
        shikshaMitraToast.success({
          message:
            generatedCount === 1
              ? 'Successfully generated 1 GR No.'
              : `Successfully generated ${generatedCount} GR Nos.`,
        });
      }
    } catch (err) {
      shikshaMitraToast.error({ message: 'Failed to auto-generate GR numbers' });
    }
  };

  // ── Auto Generate — Roll ──────────────────────────────────────────────────
  const handleRollAutoGenerate = async () => {
    autoGenerateConfirmDialog.onFalse();
    try {
      const result = await fetchRollProjections({
        divisionId: division,
        arrangementType: arrangementType === 'mix' ? 0 : arrangementType === 'boysFirst' ? 1 : 2,
        arrangementBy: arrangeBy === 'firstName' ? 0 : 1,
      }).unwrap();

      const projectedStudents = extractRollNumberProjectionItems(result);
      if (projectedStudents) {
        const rollMap = new Map<string, number>();
        projectedStudents.forEach((s: any) => {
          if (s.studentId && s.rollNo !== null && s.rollNo !== undefined) {
            rollMap.set(s.studentId, s.rollNo);
          }
        });

        const newModifiedIds = new Set(modifiedRowIds);
        let generatedCount = 0;

        setTableData((prev) =>
          prev.map((item) => {
            const projectedRoll = rollMap.get(item.studentId);
            if (
              (item.rollNo === null || item.rollNo === undefined) &&
              projectedRoll !== undefined
            ) {
              newModifiedIds.add(item.studentId);
              generatedCount += 1;
              return { ...item, rollNo: projectedRoll };
            }
            return item;
          })
        );
        setModifiedRowIds(newModifiedIds);
        shikshaMitraToast.success({
          message:
            generatedCount === 1
              ? 'Successfully generated 1 Roll No.'
              : `Successfully generated ${generatedCount} Roll Nos.`,
        });
      } else {
        shikshaMitraToast.error({ message: 'Invalid response from server' });
      }
    } catch (err: any) {
      const parsed = parseApiProblemDetail(err);
      shikshaMitraToast.error({ message: parsed.detail || 'Failed to generate roll numbers' });
    }
  };

  const confirmAutoGenerate = () => {
    if (activeTab === TAB_GR) handleGrAutoGenerate();
    else handleRollAutoGenerate();
  };

  // ── Save — GR ─────────────────────────────────────────────────────────────
  const handleGrSave = async () => {
    if (!grChangesSummary.length) return;
    saveConfirmDialog.onFalse();
    const requestBody = buildGrNumberUpdates(grChangesSummary, {});
    try {
      await updateGrNumbers({ body: requestBody }).unwrap();
      const count = grChangesSummary.length;
      shikshaMitraToast.success({
        message:
          count === 1 ? 'Successfully updated 1 GR No.' : `Successfully updated ${count} GR Nos.`,
      });
      const savedData = tableData.map((item) => grChangesSummary.some((change) => change.studentId === item.studentId)
        ? { ...item, grNumber: item.grNo?.toString() ?? null } : item);
      setTableData(savedData);
      setInitialData(savedData);
      setIsManual(false);
      setModifiedRowIds(new Set());
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail || 'Failed to update GR Numbers.' });
    }
  };

  // ── Save — Roll ───────────────────────────────────────────────────────────
  const handleRollSave = async () => {
    saveConfirmDialog.onFalse();
    if (hasRollErrors) {
      shikshaMitraToast.error({
        message: 'Please fix roll number validation errors before saving.',
      });
      return;
    }
    const requestBody = tableData.map((item) => ({
      studentId: item.studentId,
      rollNo: item.rollNo,
    }));
    try {
      await updateRollNumbers({
        divisionId: division,
        arrangementType: arrangementType === 'mix' ? 0 : arrangementType === 'boysFirst' ? 1 : 2,
        arrangementBy: arrangeBy === 'firstName' ? 0 : 1,
        body: requestBody,
      }).unwrap();
      const count = rollChangesSummary.length;
      shikshaMitraToast.success({
        message:
          count === 1
            ? 'Successfully updated 1 Roll No.'
            : `Successfully updated ${count} Roll Nos.`,
      });
      setInitialData(tableData);
      setIsManual(false);
      setModifiedRowIds(new Set());
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      const parsed = parseApiProblemDetail(err);
      shikshaMitraToast.error({ message: parsed.detail || 'Failed to update Roll Numbers.' });
    }
  };

  const handleSaveClick = () => {
    if (activeChangesSummary.length > 0) saveConfirmDialog.onTrue();
    else if (activeTab === TAB_GR) handleGrSave();
    else handleRollSave();
  };

  const confirmSave = () => {
    if (activeTab === TAB_GR) handleGrSave();
    else handleRollSave();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
      {/* Loading backdrop */}
      <Backdrop
        open={isApiLoading}
        sx={{
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.modal - 1,
          color: 'primary.main',
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* ── Filter bar + Tabs — same Paper pattern as admission screen ──────── */}
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          px: 2,
          mb: 0,
          borderRadius: '15px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Date range — same pattern as entrance-exam screen */}
        <Box display="flex" gap={1}>
          <CustomDateRangePicker
            label="Admission From - To"
            value={[startDate, endDate]}
            dateFormat="DD/MM/YYYY"
            onChange={(value) => {
              setStartDate(value[0]);
              setEndDate(value[1] ? value[1].endOf('day') : null);
            }}
          />
        </Box>

        {/* Tab switcher — right-aligned, same MUI Tabs pattern as admission screen */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, ml: 'auto' }}
        >
          <Tab
            sx={{ fontSize: '12px' }}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                <Iconify icon="cil:badge" width={16} />
                GR No. Assignment
              </Box>
            }
            value={TAB_GR}
          />
          <Tab
            sx={{ fontSize: '12px' }}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                <Iconify icon="token:scroll" width={16} />
                Roll No. Assignment
              </Box>
            }
            value={TAB_ROLL}
          />
        </Tabs>
      </Paper>

      {/* ── Main Content Card ─────────────────────────────────────────────── */}
      <Card sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* Roll arrangement selectors — visible only on Roll tab */}
            {activeTab === TAB_ROLL && (
              <Box display="flex" gap={1}>
                <CustomSelect
                  options={[
                    { id: 'mix', name: 'Mix' },
                    { id: 'boysFirst', name: 'Boys First' },
                    { id: 'girlsFirst', name: 'Girls First' },
                  ]}
                  label="Arrangement Type"
                  value={arrangementType}
                  onChange={(val) => setArrangementType(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { width: '180px' } }}
                />
                <CustomSelect
                  options={[
                    { id: 'firstName', name: 'First Name' },
                    { id: 'lastName', name: 'Last Name' },
                  ]}
                  label="Arrangement By"
                  value={arrangeBy}
                  onChange={(val) => setArrangeBy(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { width: '180px' } }}
                  disabled={!arrangementType}
                />
              </Box>
            )}

            {/* Action buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                ml: activeTab === TAB_GR ? 'auto' : undefined,
              }}
            >
              {activeChangesSummary.length > 0 && (
                <Chip
                  label={`${activeChangesSummary.length} change${activeChangesSummary.length > 1 ? 's' : ''} pending`}
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              )}

              <Button
                id="pending-assignment-manual-btn"
                size="small"
                startIcon={isManual ? <ChecklistOutlined /> : <Iconify icon="solar:pen-bold" />}
                variant={isManual ? 'contained' : 'outlined'}
                onClick={() => setIsManual((prev) => !prev)}
                color={isManual ? 'primary' : 'inherit'}
              >
                Manual
              </Button>

              <Button
                id="pending-assignment-auto-btn"
                size="small"
                startIcon={<Refresh />}
                variant="outlined"
                onClick={autoGenerateConfirmDialog.onTrue}
                disabled={isAutoDisabled}
              >
                {isGrProjectionsLoading || isRollProjectionsLoading ? 'Loading...' : 'Auto'}
              </Button>

              <LoadingButton
                id="pending-assignment-save-btn"
                startIcon={<Save />}
                variant="contained"
                onClick={handleSaveClick}
                loading={isGrSaving || isRollSaving}
                disabled={!isChanges || (activeTab === TAB_ROLL && hasRollErrors)}
                size="small"
              >
                Save
              </LoadingButton>
            </Box>
          </Box>

          {/* ── GR No. Assignment Table ──────────────────────────────────── */}
          {activeTab === TAB_GR && (
            <CustomizableTable
              tableTitle="GR No. Assignment"
              tableId="pending-assignment-gr-table"
              isLoading={isTableLoading}
              noDataText={<>No students with pending GR No. found</>}
              columns={[
                { id: 'studentName', label: 'Student Name', align: 'left' },
                {
                  id: 'admissionDate',
                  label: 'Admission Date',
                  align: 'left',
                  render: (value) => (
                    <Typography variant="body2">
                      {value ? dayjs(value as string).format('DD/MM/YYYY') : '-'}
                    </Typography>
                  ),
                },
                { id: 'standardName', label: 'Class', align: 'left' },
                { id: 'divisionName', label: 'Division', align: 'left' },
                {
                  id: 'grNo',
                  label: 'GR No.',
                  align: 'left',
                  isFilter: false,
                  isSort: false,
                  minWidth: EDIT_COLUMN_WIDTH,
                  render(value, row) {
                    const isModified = modifiedRowIds.has(row.studentId);
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: EDIT_COLUMN_WIDTH - 32,
                          minWidth: EDIT_COLUMN_WIDTH - 32,
                          backgroundColor: isModified ? 'action.hover' : 'transparent',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          mx: -1,
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {isManual ? (
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="Enter GR No."
                            type="number"
                            inputProps={{ min: 0 }}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            value={row.grNo ?? ''}
                            onChange={(e) =>
                              handleGrNumberChange(
                                row.studentId,
                                e.target.value ? +e.target.value : null
                              )
                            }
                            sx={{ width: '100%', '& .MuiInputBase-input': { py: 0.5 } }}
                          />
                        ) : (
                          <Typography variant="body2">{value ?? '-'}</Typography>
                        )}
                      </Box>
                    );
                  },
                },
              ]}
              data={grTabData}
            />
          )}

          {/* ── Roll No. Assignment Table ────────────────────────────────── */}
          {activeTab === TAB_ROLL && (
            <CustomizableTable
              tableTitle="Roll No. Assignment"
              tableId="pending-assignment-roll-table"
              isLoading={isTableLoading}
              noDataText={<>No students with pending Roll No. found</>}
              columns={[
                { id: 'studentName', label: 'Student Name', align: 'left' },
                {
                  id: 'admissionDate',
                  label: 'Admission Date',
                  align: 'left',
                  render: (value) => (
                    <Typography variant="body2">
                      {value ? dayjs(value as string).format('DD/MM/YYYY') : '-'}
                    </Typography>
                  ),
                },
                { id: 'grNo', label: 'GR No.', align: 'left', filterType: 'number' },
                {
                  id: 'rollNo',
                  label: 'Roll No.',
                  align: 'left',
                  isFilter: false,
                  isSort: false,
                  minWidth: EDIT_COLUMN_WIDTH,
                  render(value, row) {
                    const isModified = modifiedRowIds.has(row.studentId);
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: EDIT_COLUMN_WIDTH - 32,
                          minWidth: EDIT_COLUMN_WIDTH - 32,
                          backgroundColor: isModified ? 'action.hover' : 'transparent',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          mx: -1,
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {isManual ? (
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="Enter Roll No."
                            type="number"
                            value={row.rollNo ?? ''}
                            inputProps={{ min: 1, max: rollNumberLimit }}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onChange={(e) =>
                              handleRollNoChange(
                                row.studentId,
                                e.target.value ? +e.target.value : null
                              )
                            }
                            error={Boolean(rollNumberErrors[row.studentId])}
                            helperText={rollNumberErrors[row.studentId]}
                            sx={{ width: '100%', '& .MuiInputBase-input': { py: 0.5 } }}
                          />
                        ) : (
                          <Typography variant="body2">{value ?? '-'}</Typography>
                        )}
                      </Box>
                    );
                  },
                },
              ]}
              data={rollTabData}
            />
          )}
        </BackPopUpChecked>
      </Card>

      {/* ── Auto Generate Confirmation ─────────────────────────────────────── */}
      <CustomDialog
        open={autoGenerateConfirmDialog.value}
        handleClose={autoGenerateConfirmDialog.onFalse}
        title="Confirm Auto Generate"
        maxWidth="xs"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary">
            This will automatically assign {activeTab === TAB_GR ? 'GR numbers' : 'Roll numbers'} to{' '}
            <strong>{activeTab === TAB_GR ? grTabData.length : rollTabData.length}</strong> students
            who don&apos;t have them yet. Do you want to continue?
          </Typography>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={autoGenerateConfirmDialog.onFalse}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={isGrProjectionsLoading || isRollProjectionsLoading}
            variant="contained"
            size="small"
            onClick={confirmAutoGenerate}
          >
            Generate
          </LoadingButton>
        </DialogActions>
      </CustomDialog>

      {/* ── Save Confirmation ──────────────────────────────────────────────── */}
      <CustomDialog
        open={saveConfirmDialog.value}
        handleClose={saveConfirmDialog.onFalse}
        title={activeTab === TAB_GR ? 'GR Number Changes' : 'Roll Number Changes'}
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            You are about to save the following changes:
          </Typography>
          <Scrollbar sx={{ maxHeight: 320 }}>
            <Box>
              {activeChangesSummary.map((change: any, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    mt: index === 0 ? 0 : 0.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {change.studentName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', textDecoration: 'line-through', opacity: 0.7 }}
                    >
                      {(activeTab === TAB_GR ? change.oldGrNo : change.oldRollNo) ?? '-'}
                    </Typography>
                    <Iconify icon="mdi:arrow-right" width={16} sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                      {(activeTab === TAB_GR ? change.newGrNo : change.newRollNo) ?? '-'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Scrollbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2.5,
              py: 1.5,
            }}
          >
            <Typography variant="body2" color="text.primary">
              Total students to update
            </Typography>
            <Typography variant="body2" color="primary.main">
              {activeChangesSummary.length}
            </Typography>
          </Box>
        </DialogScrollContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={saveConfirmDialog.onFalse}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={isGrSaving || isRollSaving}
            variant="contained"
            size="small"
            onClick={confirmSave}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default PendingAssignmentScreen;
