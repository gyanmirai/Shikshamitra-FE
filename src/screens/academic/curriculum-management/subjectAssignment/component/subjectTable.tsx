'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Typography } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';

import { getSubjectDisplayLabel } from '../utils/getSubjectDisplayLabel';
import { useSubjectTableRows } from './subjectTable/useSubjectTableRows';
import { SubjectScheduleDrawer } from './subjectTable/SubjectScheduleDrawer';
import { useSubjectTableColumns } from './subjectTable/useSubjectTableColumns';

import type { ISubjectFormValues, ISubjectTableProps } from './type';

const SubjectTable = ({
  isLoading,
  addSubjectDialog,
  subjectTableData,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onToggleStatus,
  setQuery,
  totalCount,
}: ISubjectTableProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const scheduleDrawer = useBoolean();
  const { onTrue: openScheduleDrawer } = scheduleDrawer;
  const [scheduleSubject, setScheduleSubject] = useState<ISubjectFormValues | null>(null);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Delete`
  );

  /**
   * Memoization Justification:
   * Passed into memoized table column configuration and used by every Periods/Wk cell.
   * A stable callback prevents the table from rebuilding its columns on drawer state changes.
   */
  const handleViewSchedule = useCallback(
    (subject: ISubjectFormValues) => {
      setScheduleSubject(subject);
      openScheduleDrawer();
    },
    [openScheduleDrawer]
  );

  const rows = useSubjectTableRows(subjectTableData);
  const columns = useSubjectTableColumns({
    canAdd,
    canView,
    canDelete,
    onView,
    onEdit,
    onDelete,
    onArchive,
    onRestore,
    onToggleStatus,
    onViewSchedule: handleViewSchedule,
  });

  return (
    <>
      <CustomizableTable
        tableId="subject-table"
        isLoading={isLoading}
        totalCount={totalCount}
        noDataText={
          <Box width="100%" display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body2" color="text.secondary" mb={1}>
              No subjects allocated for this class yet.
            </Typography>
            {canAdd && (
              <Button variant="text" onClick={addSubjectDialog.onTrue}>
                + Allocate Subjects
              </Button>
            )}
          </Box>
        }
        serverSidePagination
        onServerPagination={(page, rowPerPage) => {
          setQuery((previous) => ({ ...previous, page: page - 1, pageSize: rowPerPage }));
        }}
        columns={columns}
        data={rows}
      />

      <SubjectScheduleDrawer
        assignmentId={scheduleSubject?.id ? String(scheduleSubject.id) : undefined}
        subjectLabel={getSubjectDisplayLabel(scheduleSubject) || scheduleSubject?.subjectName || ''}
        open={scheduleDrawer.value}
        onClose={scheduleDrawer.onFalse}
      />
    </>
  );
};

export default SubjectTable;
