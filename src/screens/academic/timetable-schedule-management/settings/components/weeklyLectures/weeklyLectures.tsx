'use client';

import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TIMETABLE_STATUS_LABEL, normalizeTimetableStatus } from 'src/utils/timetable-capacity';
import { useGetWeeklyLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/weeklyLecturesApi';
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
    data: weeklyLectureData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
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
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Weekly Lectures Slots"
        description="Configure and manage weekly lecture slots for each class."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Timetable', href: '/academic/newTimetable' },
          { name: 'Settings' },
          { name: 'Weekly Lectures Slots' },
        ]}
        action={<TimetableSettingsSummaryCards cards={summaryCards} buttonSx={{ mb: 0 }} />}
      />

      <CustomizableTable
        tableId="weekly-lectures-setting-table"
        isLoading={isLoading || isFetching}
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Weekly Lectures' : 'Add Weekly Lectures'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Update weekly lecture details the total number of lectures scheduled per week.'
                  : 'You can add weekly lectures by specifying the class and total weekly number of lectures.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Weekly Lectures Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View weekly lecture details such as class, total lectures, and distribution by subject."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
