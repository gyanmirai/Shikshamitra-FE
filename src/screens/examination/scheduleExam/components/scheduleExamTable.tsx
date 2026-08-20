import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { formatWallClockTime } from 'src/utils/time-of-day';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Paper,
  Stack,
  Button,
  MenuList,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import {
  usePublishExamMutation,
  useGetExamsQuery,
  useLazyGetExamScheduleQuery,
  useUpdateExamStatusMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import ScheduleExamKpiStrip from './ScheduleExamKpiStrip';
import ScheduleExamPreviewDrawer from './ScheduleExamPreviewDrawer';
import {
  EXAM_STATUS_META,
  getEffectiveExamStatus,
  filterExamsByEffectiveStatus,
} from '../scheduleExamStatus';

import type { IExamFormValues, IScheduledExamTableProps } from '../type';

function flattenScheduledSubjects(subjects: any[]): any[] {
  return subjects.flatMap((subject) => {
    if (
      subject.electiveGroupId &&
      Array.isArray(subject.electiveGroupSubjects) &&
      subject.electiveGroupSubjects.length > 0
    ) {
      return subject.electiveGroupSubjects.map((electiveSubject: any) => ({
        ...subject,
        ...electiveSubject,
        subjectName: electiveSubject.subjectName || '',
        subjectCode: electiveSubject.subjectCode || electiveSubject.code || '',
        examDate: electiveSubject.examDate ?? subject.examDate,
        startTime: electiveSubject.startTime ?? subject.startTime,
        endTime: electiveSubject.endTime ?? subject.endTime,
        totalMarks: electiveSubject.totalMarks ?? subject.totalMarks,
        passingMarks: electiveSubject.passingMarks ?? subject.passingMarks,
        notes: electiveSubject.notes ?? subject.notes,
      }));
    }
    return [subject];
  });
}

function mergeTimetableSubjects(apiSubjects: any[], fallbackSubjects: any[]): any[] {
  const fallbackById = new Map(
    fallbackSubjects.map((subject) => [subject.subjectId || subject.subjectName, subject])
  );

  return apiSubjects.map((subject) => {
    const fallback = fallbackById.get(subject.subjectId || subject.subjectName) || {};
    return {
      ...fallback,
      ...subject,
      examDate: subject.examDate ?? subject.date ?? subject.scheduleDate ?? fallback.examDate,
      startTime: subject.startTime ?? subject.fromTime ?? subject.start ?? fallback.startTime,
      endTime: subject.endTime ?? subject.toTime ?? subject.end ?? fallback.endTime,
      totalMarks: subject.totalMarks ?? subject.marks ?? fallback.totalMarks,
      passingMarks: subject.passingMarks ?? subject.passingMark ?? fallback.passingMarks,
      notes: subject.notes ?? fallback.notes,
    };
  });
}

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  onViewTimetable,
  isScheduleExamButton = true,
  isAction = true,
  getExams,
  activeStatus,
  onStatusChange,
}) => {
  const publishExamDialog = useBoolean();
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.Delete`
  );

  const [publishExam] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishExamMutation,
  });

  const [updateExamStatus, { isLoading: isPublishing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamStatusMutation,
  });
  // Initialize tabs with the current active status driven by the parent
  const tabs = useTabs(activeStatus ?? examScheduledStatus.Pending);
  // Add this outside your component
  // const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<IExamFormValues | null>(null);
  const [previewExam, setPreviewExam] = useState<IExamFormValues | null>(null);
  const [printingExamId, setPrintingExamId] = useState<string | null>(null);
  const [getExamSchedule] = useLazyGetExamScheduleQuery();
  const [currentTime, setCurrentTime] = useState(() => dayjs());
  const { data: publishedExamsData } = useGetExamsQuery(
    { AcademicMediumId: medium?.id, Status: examScheduledStatus.Published },
    { skip: !medium?.id }
  );

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(dayjs()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handlePublishExam = async () => {
    try {
      if (selectedTimetable?.examId) {
        await updateExamStatus({
          examId: selectedTimetable.examId,
          body: { status: examScheduledStatus.Published },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Exam Time Table Published Successfully' });
        publishExamDialog.onFalse();
        setSelectedTimetable(null);
      }
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail });
    }
  };

  const requestPublishExam = (row: any) => {
    publishExamDialog.onTrue();
    setSelectedTimetable(row);
  };

  const handlePrintTimetable = async (row: IExamFormValues) => {
    if (!row.examId) return;

    setPrintingExamId(row.examId);
    try {
      const schedule = await getExamSchedule({ examId: row.examId }).unwrap();
      const apiSubjects = flattenScheduledSubjects(
        schedule?.subjects ?? schedule?.data?.subjects ?? []
      );
      const fallbackSubjects = flattenScheduledSubjects(row.subjects || []);
      const subjects = apiSubjects.length
        ? mergeTimetableSubjects(apiSubjects, fallbackSubjects)
        : fallbackSubjects;
      // eslint-disable-next-line new-cap
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const title = row.examName || 'Exam Timetable';
      const filename = `${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'exam-timetable'}.pdf`;

      doc.setFontSize(16);
      doc.text(title, 14, 16);
      doc.setFontSize(10);
      doc.text(`${row.className || row.standardName || 'Class'} · Exam Timetable`, 14, 23);

      autoTable(doc, {
        startY: 30,
        columns: [
          { header: 'Subject', dataKey: 'subject' },
          { header: 'Date', dataKey: 'date' },
          { header: 'Start Time', dataKey: 'startTime' },
          { header: 'End Time', dataKey: 'endTime' },
          { header: 'Total Marks', dataKey: 'totalMarks' },
          { header: 'Passing Marks', dataKey: 'passingMarks' },
          { header: 'Notes', dataKey: 'notes' },
        ],
        head: [
          ['Subject', 'Date', 'Start Time', 'End Time', 'Total Marks', 'Passing Marks', 'Notes'],
        ],
        body: subjects.map((subject: any) => [
          `${subject.subjectName || '-'}${subject.subjectCode ? ` (${subject.subjectCode})` : ''}`,
          (subject.examDate ?? subject.date ?? subject.scheduleDate) &&
          dayjs(subject.examDate ?? subject.date ?? subject.scheduleDate).isValid()
            ? dayjs(subject.examDate ?? subject.date ?? subject.scheduleDate).format('DD-MM-YYYY')
            : '-',
          formatWallClockTime(subject.startTime ?? subject.fromTime ?? subject.start),
          formatWallClockTime(subject.endTime ?? subject.toTime ?? subject.end),
          subject.totalMarks ?? subject.marks ?? '-',
          subject.passingMarks ?? subject.passingMark ?? '-',
          subject.notes || '-',
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [35, 48, 61] },
        margin: { left: 14, right: 14 },
      });

      doc.save(filename);
      shikshaMitraToast.success({ message: 'Timetable downloaded successfully.' });
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail || 'Unable to download the timetable.' });
    } finally {
      setPrintingExamId(null);
    }
  };

  // Define tab configuration with labels, values, counts and colors
  const publishedRows = useMemo(() => publishedExamsData?.items || [], [publishedExamsData?.items]);
  const derivedOngoingCount = useMemo(
    () =>
      filterExamsByEffectiveStatus(publishedRows, examScheduledStatus.Ongoing, currentTime).length,
    [currentTime, publishedRows]
  );
  const ongoingCount = Number(publishedExamsData?.ongoingCount ?? derivedOngoingCount);
  // `publishedCount` is the API lifecycle count. Ongoing is a derived view over
  // published exams, so do not subtract it here or the tab count will disagree
  // with the rows returned by the Published endpoint.
  const publishedCount = Number(publishedExamsData?.publishedCount ?? publishedRows.length);

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: examScheduledStatus.Pending,
        count: getExams?.data?.pendingCount || 0,
        color: 'warning',
      },
      {
        label: 'Published',
        value: examScheduledStatus.Published,
        count: publishedCount,
        color: 'info',
      },
      {
        label: 'Ongoing',
        value: examScheduledStatus.Ongoing,
        count: ongoingCount,
        color: 'primary',
      },
      {
        label: 'Completed',
        value: examScheduledStatus.Completed,
        count: getExams?.data?.completedCount || 0,
        color: 'success',
      },
    ],
    [getExams?.data?.pendingCount, getExams?.data?.completedCount, ongoingCount, publishedCount]
  );

  // Handle tab change event — update UI state, notify parent, and refetch with new Status
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    onStatusChange?.(newValue as number);
  };

  const handleKpiClick = (label: string) => {
    const statusByCard: Record<string, examScheduledStatus> = {
      'Draft Exams': examScheduledStatus.Pending,
      Published: examScheduledStatus.Published,
      'Upcoming 7 Days': examScheduledStatus.Published,
      'Unassigned Rooms': examScheduledStatus.Pending,
      'Needs Attention': examScheduledStatus.Pending,
      Completed: examScheduledStatus.Completed,
    };
    const status = statusByCard[label];
    if (status === undefined) return;
    tabs.setValue(status);
    onStatusChange?.(status);
  };

  // Ongoing is a derived view over the Published lifecycle status. Keep the raw
  // lifecycle status authoritative for the normal tabs so a valid API row (for
  // example, "Question Paper") cannot disappear because the summary endpoint's
  // date range differs from its detailed subject schedule. Only the Ongoing tab
  // applies the client-side time window.
  const tableData = useMemo(
    () => {
      const rows = getExams?.data?.items || [];
      const requestedStatus = Number(activeStatus ?? examScheduledStatus.Pending) as examScheduledStatus;
      const visibleRows =
        requestedStatus === examScheduledStatus.Ongoing
          ? filterExamsByEffectiveStatus(rows, requestedStatus, currentTime)
          : rows.filter((row: any) => Number(row.status) === requestedStatus);

      return visibleRows.map((row: any) => ({
        ...row,
        effectiveStatus: getEffectiveExamStatus(row, currentTime),
      }));
    },
    [activeStatus, currentTime, getExams?.data?.items]
  );

  // Actions component for the three dots menu
  // Renders menu items for printing and publishing timetables
  // Uses useCallback to memoize the component for performance
  const actions = ({ popover: pop, row }: any) =>
    canView || canAdd ? (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setPreviewExam(row);
              pop.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Preview
          </MenuItem>

          <MenuItem
            onClick={() => {
              onViewTimetable?.(row as IExamFormValues);
              pop.onClose();
            }}
          >
            <Iconify icon="solar:calendar-bold-duotone" />
            View Timetable
          </MenuItem>

          {/* Menu item for printing the timetable */}
          <MenuItem
            onClick={() => {
              handlePrintTimetable(row as IExamFormValues);
              pop.onClose();
            }}
            disabled={printingExamId === row.examId}
          >
            <Iconify icon="solar:printer-outline" />
            Print Timetable
          </MenuItem>

          {/* Menu item for publishing the timetable 
              Sets the selected timetable name and shows confirmation dialog */}
          {canAdd && row.status === examScheduledStatus.Pending && (
            <MenuItem
              onClick={() => {
                requestPublishExam(row);
                pop.onClose();
              }}
            >
              <Iconify icon="solar:cloud-upload-outline" />
              Publish Exam
            </MenuItem>
          )}
        </MenuList>
      </>
    ) : null;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
        <ScheduleExamKpiStrip
          summary={getExams?.data}
          rows={tableData}
          publishedCount={publishedCount}
          onCardClick={handleKpiClick}
        />
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            px: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tabs.value}
            onChange={handleTabChange}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, flexGrow: 1 }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}{' '}
                    <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                  </Box>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
          {isScheduleExamButton && canAdd && (
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                setOpenDialog?.(true);
              }}
              sx={{ px: '32px' }}
            >
              Schedule Exam
            </Button>
          )}
        </Paper>
      </Box>
      {isAction ? (
        <CustomizableTable
          tableId="schedule-exam-table"
          tableTitle="Scheduled Exams"
          isLoading={getExams?.isLoading || getExams?.isFetching}
          noDataText={
            <Stack alignItems="center" spacing={0.5}>
              <Box component="span">
                {activeStatus === examScheduledStatus.Ongoing
                  ? 'No exams are ongoing right now'
                  : 'Exam Data Not Found'}
              </Box>
              {activeStatus === examScheduledStatus.Ongoing ? (
                <Typography variant="caption" color="text.secondary">
                  Published exams appear here automatically during their scheduled time.
                </Typography>
              ) : (
                <Box
                  component="span"
                  onClick={() => {
                    setOpenDialog?.(true);
                    setEditData?.(null);
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create Exam
                </Box>
              )}
            </Stack>
          }
          columns={[
            {
              id: 'examName',
              label: 'Exam Name',
              align: 'left',
              sticky: true,
              stickyPosition: 'left',
              minWidth: 260,
              render: (value, row) => (
                <Box>
                  <Typography variant="subtitle2">{value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.subjectCount ?? 0} subjects
                    {row.lastUpdatedAt
                      ? ` · Updated ${dayjs(row.lastUpdatedAt).format('DD MMM')}`
                      : ''}
                  </Typography>
                </Box>
              ),
            },
            { id: 'examTypeName', label: 'Exam Type', align: 'left' },
            { id: 'standardName', label: 'Class', align: 'left' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (value) => (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(value || []).slice(0, 2).map((division: string) => (
                    <Chip key={division} label={division} size="small" variant="soft" />
                  ))}
                  {(value || []).length > 2 && (
                    <Chip label={`+${(value || []).length - 2}`} size="small" variant="outlined" />
                  )}
                </Stack>
              ),
            },
            {
              id: 'startDate',
              label: 'Date Range',
              align: 'left',
              filterType: 'date',
              render: (_value, row) => {
                if (!row.startDate) return 'Not scheduled';
                const start = dayjs(row.startDate).format('DD-MM-YYYY');
                const end = row.endDate ? dayjs(row.endDate).format('DD-MM-YYYY') : start;
                return start === end ? start : `${start} - ${end}`;
              },
            },
            {
              id: 'issueCount',
              label: 'Issues',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(row.issueCount ?? 0) > 0 ? (
                    <Chip
                      label={`${row.issueCount} issue${row.issueCount > 1 ? 's' : ''}`}
                      color="error"
                      size="small"
                      variant="soft"
                    />
                  ) : (
                    <Chip label="Ready" color="success" size="small" variant="soft" />
                  )}
                  {(row.missingRoomAssignmentCount ?? 0) > 0 && (
                    <Chip label="Missing rooms" color="warning" size="small" variant="outlined" />
                  )}
                </Stack>
              ),
            },
            { id: 'creatorName', label: 'Created By', align: 'left', isFilter: false },
            {
              id: 'effectiveStatus',
              label: 'Status',
              align: 'left',
              sticky: true,
              stickyPosition: 'right',
              minWidth: 120,
              filterType: 'enum',
              enumOptions: [
                { label: 'Draft', value: examScheduledStatus.Pending },
                { label: 'Published', value: examScheduledStatus.Published },
                { label: 'Ongoing', value: examScheduledStatus.Ongoing },
                { label: 'Completed', value: examScheduledStatus.Completed },
              ],
              render: (value) => {
                const meta =
                  EXAM_STATUS_META[Number(value) as examScheduledStatus] ??
                  EXAM_STATUS_META[examScheduledStatus.Pending];
                return <Label color={meta.color as LabelColor}>{meta.label}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              minWidth: 50,
              width: 50,
              align: 'left',
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              isFilter: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showViewIcon={canView}
                    showDeleteIcon={tabs.value === examScheduledStatus.Pending && canDelete}
                    showEditIcon={tabs.value === examScheduledStatus.Pending && canAdd}
                    handleViewClick={() => setPreviewExam(row as IExamFormValues)}
                    handleDeleteClick={() => {
                      onDelete?.(row as IExamFormValues);
                    }}
                    handleEditClick={() => {
                      setOpenDialog?.(true);
                      setEditData?.(row as IExamFormValues);
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading || getExams?.isFetching}
          noDataText={
            <Stack alignItems="center" spacing={0.5}>
              <Box component="span">Exam Data Not Found</Box>
              <Box
                component="span"
                onClick={() => {
                  setOpenDialog?.(true);
                  setEditData?.(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Create Exam
              </Box>
            </Stack>
          }
          columns={[
            { id: 'examName', label: 'Exam Name', align: 'left', sticky: true },
            { id: 'examType', label: 'Exam Type', align: 'left' },
            { id: 'className', label: 'Class', align: 'left', filterType: 'number' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (value) => <Box>{(value || []).join(', ')}</Box>,
            },
            { id: 'createdBy', label: 'Created By', align: 'left', isFilter: false },
          ]}
          data={tableData || []}
        />
      )}

      <ConfirmDialog
        open={publishExamDialog.value}
        onClose={() => {
          publishExamDialog.onFalse();
          setSelectedTimetable(null);
        }}
        title="Publish"
        content={
          <Stack spacing={1}>
            <Box>
              Are you sure you want to publish{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {selectedTimetable?.examName}
              </Box>
              ?
            </Box>
            {(selectedTimetable?.issueCount ?? 0) > 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {selectedTimetable?.issueCount} blocking issue
                  {(selectedTimetable?.issueCount ?? 0) > 1 ? 's' : ''} detected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Publishing will fail. Open the exam schedule and fill in all required fields
                  first.
                </Typography>
              </Alert>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isPublishing}
            disabled={isPublishing || (selectedTimetable?.issueCount ?? 0) > 0}
            startIcon={<Iconify icon="solar:cloud-upload-outline" />}
            onClick={handlePublishExam}
            size="small"
          >
            Publish
          </LoadingButton>
        }
      />
      <ScheduleExamPreviewDrawer
        open={!!previewExam}
        exam={previewExam}
        canEdit={canAdd}
        onClose={() => setPreviewExam(null)}
        onEdit={(row) => {
          setPreviewExam(null);
          setOpenDialog?.(true);
          setEditData?.(row as IExamFormValues);
        }}
        onViewTimetable={(row) => {
          setPreviewExam(null);
          onViewTimetable?.(row as IExamFormValues);
        }}
        onPublish={(row) => {
          setPreviewExam(null);
          requestPublishExam(row);
        }}
      />
    </>
  );
};

export default ScheduledExamTable;
