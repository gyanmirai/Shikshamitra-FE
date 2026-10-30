'use client';

import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import { Box, Stack, Button, LinearProgress } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { TIMETABLE_STATUS_LABEL, normalizeTimetableStatus } from 'src/utils/timetable-capacity';
import { useGetWeeklyLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/weeklyLecturesApi';
import { AcademicSetupManagerHeader as CustomBreadcrumbs } from 'src/screens/academic/setup/embedding';
import { TimetableSettingsSummaryCards } from 'src/screens/academic/components/AcademicSummaryInsights';

import CreateNoOfLecture from './createWeeklyLectures';
import { useWeeklyLectureColumns } from './hooks/useWeeklyLectureColumns';
import { useWeeklyLecturesDialogs } from './hooks/useWeeklyLecturesDialogs';

import type { ISubject, ISubjectFormValues } from './type';

const WeeklyLectures = () => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.settings.weeklyLectures}.Add`
  );

  const {
    currentData: weeklyLectureData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
    popupConfig: { error: false },
  });

  const {
    selected,
    isEdit,
    disabled,
    formDialog,
    viewDialog,
    openCreate,
    openEdit,
    openView,
    closeForm,
    closeView,
  } = useWeeklyLecturesDialogs();

  const columns = useWeeklyLectureColumns({ onView: openView, onEdit: openEdit, canAdd });

  /**
   * `useMemo` is justified: `tableData` is the row source for a memoized
   * `CustomizableTable` and is also passed into the dialog. Recomputing on
   * every parent render would invalidate downstream memos.
   */
  const tableData = useMemo<ISubjectFormValues[]>(
    () =>
      weeklyLectureData?.items?.map((item: ISubjectFormValues & { subjects: ISubject[] }) => {
        const normalizedStatus = normalizeTimetableStatus(item.status);

        return {
          ...item,
          statusLabel: normalizedStatus ? TIMETABLE_STATUS_LABEL[normalizedStatus] : '',
          newSubject: item.subjects
            .map(
              (subject) =>
                `${subject.electiveGroupName || subject.subjectName} (${subject.weeklyLectures})`
            )
            .join(' '),
        };
      }) ?? [],
    [weeklyLectureData]
  );

  const summaryCards = useMemo(() => {
    const total = tableData.length;
    const configured = tableData.filter((item) => (item.totalLectures ?? 0) > 0).length;
    const balanced = tableData.filter(
      (item) => normalizeTimetableStatus(item.status) === 'Balanced'
    ).length;
    const capacityIssues = tableData.filter(
      (item) => normalizeTimetableStatus(item.status) === 'OverCapacity'
    ).length;

    return [
      {
        label: 'Total Classes',
        value: total,
        icon: 'mdi:google-classroom',
        color: 'primary' as const,
      },
      {
        label: 'Configured Weekly Lectures',
        value: configured,
        icon: 'mdi:check-circle-outline',
        color: 'info' as const,
      },
      {
        label: 'Pending Configuration',
        value: total - configured,
        icon: 'mdi:clock-alert-outline',
        color: 'warning' as const,
      },
      {
        label: 'Balanced Classes',
        value: balanced,
        icon: 'mdi:scale-balance',
        color: 'success' as const,
      },
      {
        label: 'Capacity Issues',
        value: capacityIssues,
        icon: 'mdi:alert-circle-outline',
        color: 'error' as const,
      },
    ];
  }, [tableData]);

  return (
    <Box height="100%" minHeight={0} display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Weekly Lectures Slots"
        description="Configure and manage weekly lecture slots for each class."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Timetable', href: '/academic/newTimetable' },
          { name: 'Settings' },
          { name: 'Weekly Lectures Slots' },
        ]}
        action={
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <TimetableSettingsSummaryCards cards={summaryCards} buttonSx={{ mb: 0 }} />
            {canAdd && (
              <Button
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={openCreate}
              >
                Weekly Lecture
              </Button>
            )}
          </Stack>
        }
      />

      {(isLoading || isFetching) && (
        <LinearProgress aria-label="Loading weekly lectures" sx={{ flexShrink: 0 }} />
      )}
      <CustomizableTable
        tableTitle="Weekly Lectures"
        tableId="weekly-lectures-setting-table"
        isLoading={isLoading || isFetching}
        error={isError && !isFetching ? error : undefined}
        onRetry={refetch}
        noDataText={
          <>
            Weekly lectures not configured{' '}
            {canAdd && (
              <Box
                onClick={openCreate}
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
                Add Weekly Lectures
              </Box>
            )}
          </>
        }
        columns={columns}
        data={tableData}
      />

      <CustomDialog
        title={isEdit ? 'Update Weekly Lectures' : 'Add Weekly Lectures'}
        titleInfo="Set the weekly lecture target for each subject in a class."
        open={formDialog.value}
        handleClose={() => closeForm(null, false)}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          disabled={disabled}
          onClose={closeForm}
          editData={selected}
          isEdit={isEdit}
          tableData={tableData}
        />
      </CustomDialog>

      <CustomDialog
        title="Weekly Lectures Details"
        titleInfo="Review class lecture totals and subject targets."
        hasForm={false}
        open={viewDialog.value}
        handleClose={closeView}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          disabled={disabled}
          isEdit={false}
          onClose={closeForm}
          editData={selected}
          tableData={tableData}
        />
      </CustomDialog>
    </Box>
  );
};

export default WeeklyLectures;
