'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetSubjectUsageQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  Box,
  Chip,
  Alert,
  Drawer,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import SettingSubjectForm from './subjectForm';
import SubjectAddDrawer from './subjectAddDrawer';
import SettingSubjectTable from './settingSubjectTable';
import { useSubjectCreation } from './hooks/useSubjectCreation';

const SubjectCreation = () => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.Delete`
  );
  const [archiveReason, setArchiveReason] = useState('');

  const {
    deleteSubjectDialog,
    open,
    setOpen,
    addSubjectDialog,
    drawerOpen,
    usageDrawer,
    archiveDialog,
    isDeleteLoading,
    isArchiveLoading,
    currentMedium,
    selectedSubject,
    setSelectedSubject,
    deleteSubject,
    archiveSubject,
    restoreSubject,
    handleClose,
  } = useSubjectCreation();

  const { data: usageData, isFetching: isUsageFetching } = useGetSubjectUsageQuery(
    {
      academicMediumId: (currentMedium as any)?.id,
      id: selectedSubject?.id,
    },
    { skip: !(currentMedium as any)?.id || !selectedSubject?.id || !usageDrawer.value }
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Subject Creation"
        description="Manage master subjects used across curriculum, timetable, exams, lesson plans, and reports."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Subject Creation' },
        ]}
        action={
          canAdd && (
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                sx={{ px: '24px' }}
                startIcon={<Add />}
                variant="contained"
                onClick={() => {
                  setSelectedSubject(null);
                  addSubjectDialog.onTrue();
                }}
                size="small"
              >
                Subject
              </Button>
              <Button variant="outlined" size="small" onClick={drawerOpen.onTrue}>
                Bulk Add
              </Button>
            </Box>
          )
        }
      />

      <SettingSubjectTable
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        onViewUsage={(data) => {
          setSelectedSubject(data);
          usageDrawer.onTrue();
        }}
        onArchive={(data) => {
          setSelectedSubject(data);
          setArchiveReason('');
          archiveDialog.onTrue();
        }}
        onRestore={async (data) => {
          try {
            await restoreSubject({
              academicMediumId: (currentMedium as any).id,
              id: data.id,
            }).unwrap();
            shikshaMitraToast.success({ message: 'Subject restored successfully.' });
          } catch (error: any) {
            shikshaMitraToast.error({
              message: error?.data?.message || 'Failed to restore subject.',
            });
          }
        }}
        onDelete={(data) => {
          setSelectedSubject(data);
          deleteSubjectDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedSubject(data);
          addSubjectDialog.onTrue();
        }}
        open={open}
        setOpenDialog={setOpen}
        setEditData={setSelectedSubject}
        onOpenDrawer={drawerOpen.onTrue}
      />

      <SubjectAddDrawer open={drawerOpen.value} onClose={drawerOpen.onFalse} />

      <CustomDialog
        open={addSubjectDialog.value}
        handleClose={() => {
          addSubjectDialog.onFalse();
          setTimeout(() => {
            setSelectedSubject(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{selectedSubject ? 'Edit Subject' : 'Add Subject'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can update the subject details including name and color."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SettingSubjectForm
          open={addSubjectDialog}
          onClose={handleClose}
          editData={selectedSubject}
        />
      </CustomDialog>

      <Drawer
        anchor="right"
        open={usageDrawer.value}
        onClose={() => {
          usageDrawer.onFalse();
          setSelectedSubject(null);
        }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{selectedSubject?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Usage across the system
            </Typography>
          </Box>
          <IconButton onClick={usageDrawer.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isUsageFetching ? (
            <Typography variant="body2">Loading usage...</Typography>
          ) : (
            <>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <UsageRow
                  icon="lucide:layout-grid"
                  title="Subject Allocation"
                  items={
                    usageData?.usage?.subjectAllocations?.map(
                      (item: any) => `${item.standard || 'Class'} - ${item.code || 'No code'}`
                    ) || []
                  }
                />
                <UsageRow
                  icon="lucide:users"
                  title="Elective Groups"
                  items={usageData?.usage?.electiveGroups || []}
                />
                <UsageRow
                  icon="lucide:book-open"
                  title="Syllabus"
                  count={usageData?.usage?.chaptersCount}
                  suffix="chapters"
                />
                <UsageRow
                  icon="lucide:calendar-clock"
                  title="Timetable"
                  count={usageData?.usage?.timetablePeriodsCount}
                  suffix="periods"
                />
                <UsageRow
                  icon="lucide:file-check"
                  title="Examination"
                  count={usageData?.usage?.examSchedulesCount}
                  suffix="exam schedules"
                />
                <UsageRow
                  icon="lucide:notebook-pen"
                  title="Lesson Plan"
                  count={usageData?.usage?.lessonPlansCount}
                  suffix="lesson plans"
                />
                <UsageRow
                  icon="lucide:clipboard-list"
                  title="Homework"
                  count={usageData?.usage?.homeworkCount}
                  suffix="homework records"
                />
                <UsageRow
                  icon="lucide:user-check"
                  title="Teacher Mapping"
                  count={usageData?.usage?.teacherMappingsCount}
                  suffix="teachers assigned"
                />
              </Box>
              <Alert severity={usageData?.canDelete ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {usageData?.canDelete
                  ? 'Safe to delete because this subject is not used.'
                  : 'Safe to edit display name, color, and icon. Not safe to delete. Archive is recommended if no longer used.'}
              </Alert>
            </>
          )}
        </Box>
      </Drawer>

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          archiveDialog.onFalse();
        }}
        title="Archive Subject"
        content={
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Archived subjects will not be available for new allocations but will remain visible in
              old records.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason for archiving"
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
            />
          </Box>
        }
        action={
          <LoadingButton
            loading={isArchiveLoading}
            variant="contained"
            color="warning"
            size="small"
            onClick={async () => {
              try {
                await archiveSubject({
                  academicMediumId: (currentMedium as any).id,
                  id: selectedSubject?.id,
                  body: { reason: archiveReason },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Subject archived successfully.' });
                archiveDialog.onFalse();
                setSelectedSubject(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive subject.',
                });
              }
            }}
          >
            Archive
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteSubjectDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          deleteSubjectDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            {selectedSubject?.canDelete ? (
              <>
                Are you sure you want to delete subject{' '}
                <strong>&quot;{selectedSubject?.name}&quot;</strong>?
              </>
            ) : (
              <>
                <strong>&quot;{selectedSubject?.name}&quot;</strong> cannot be deleted because it is
                already used. You can archive this subject instead.
              </>
            )}
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            disabled={!selectedSubject?.canDelete}
            onClick={async () => {
              try {
                await deleteSubject({
                  academicMediumId: (currentMedium as any).id,
                  id: (selectedSubject as any).id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Subject deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete subject.',
                });
              }
              deleteSubjectDialog.onFalse();
              setSelectedSubject(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default SubjectCreation;

const UsageRow = ({
  icon,
  title,
  items,
  count,
  suffix,
}: {
  icon: string;
  title: string;
  items?: string[];
  count?: number;
  suffix?: string;
}) => {
  const hasItems = items !== undefined;
  const value = hasItems ? items.length : count || 0;
  const isEmpty = value === 0;

  return (
    <Box
      sx={{
        p: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isEmpty ? 'action.hover' : 'primary.lighter',
          }}
        >
          <Iconify
            icon={icon}
            width={16}
            height={16}
            sx={{ color: isEmpty ? 'text.disabled' : 'primary.main' }}
          />
        </Box>
        <Typography variant="body2" sx={{ flex: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={600}
          color={isEmpty ? 'text.disabled' : 'text.primary'}
        >
          {isEmpty ? 'Not used' : `${value} ${suffix || ''}`.trim()}
        </Typography>
      </Box>
      {hasItems && value > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, ml: '44px' }}>
          {items.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '11px' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
