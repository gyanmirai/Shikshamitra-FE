'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetElectiveGroupUsageQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';
import { useElectiveSubjectSetting } from './hooks/useElectiveSubjectSetting';

const ElectiveSubjectSetting = () => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.Delete`
  );
  const [archiveReason, setArchiveReason] = useState('');

  const {
    deleteDialog,
    open,
    setOpen,
    addElectiveGroupDialog,
    archiveDialog,
    usageDrawer,
    isDeleteLoading,
    isArchiveLoading,
    currentMedium,
    selected,
    setSelected,
    handleClose,
    deleteElectiveGroup,
    archiveElectiveGroup,
    restoreElectiveGroup,
  } = useElectiveSubjectSetting();

  const { data: usageData, isFetching: isUsageFetching } = useGetElectiveGroupUsageQuery(
    {
      academicMediumId: (currentMedium as any)?.id,
      id: selected?.id,
    },
    { skip: !(currentMedium as any)?.id || !selected?.id || !usageDrawer.value }
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Elective Group Creation"
        description="Manage reusable elective subject groups used during class-wise subject allocation."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Elective Group Creation' },
        ]}
        action={
          canAdd && (
            <Button
              sx={{ width: '160px' }}
              startIcon={<Add />}
              onClick={() => {
                setSelected(null);
                addElectiveGroupDialog.onTrue();
              }}
              variant="contained"
              size="small"
            >
              Elective Group
            </Button>
          )
        }
      />

      <ElectiveSubjectTable
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
        }}
        onArchive={(data) => {
          setSelected(data);
          setArchiveReason('');
          archiveDialog.onTrue();
        }}
        onRestore={async (data) => {
          try {
            await restoreElectiveGroup({
              academicMediumId: (currentMedium as any)?.id,
              id: data.id,
            }).unwrap();
            shikshaMitraToast.success({ message: 'Elective group restored successfully.' });
          } catch (error: any) {
            shikshaMitraToast.error({
              message: error?.data?.message || 'Failed to restore elective group.',
            });
          }
        }}
        onViewUsage={(data) => {
          setSelected(data);
          usageDrawer.onTrue();
        }}
        onEdit={(data) => {
          setSelected(data);
          addElectiveGroupDialog.onTrue();
        }}
        open={open}
        onAddElective={addElectiveGroupDialog}
        setOpenDialog={setOpen}
        editData={selected}
        setEditData={setSelected}
        data={[]}
      />

      <Drawer
        anchor="right"
        open={usageDrawer.value}
        onClose={() => {
          usageDrawer.onFalse();
          setSelected(null);
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'rgba(15, 23, 42, 0.44)',
              backdropFilter: 'blur(3px)',
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selected?.name || 'Elective Subject Usage'}
              </Typography>
              <CustomTooltip title="Usage across the system" placement="right" arrow>
                <Iconify
                  icon={GlobalIcons.info}
                  color="info.main"
                  width={16}
                  height={16}
                  sx={{ cursor: 'pointer' }}
                />
              </CustomTooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Usage across the system
            </Typography>
          </Stack>
          <IconButton
            onClick={() => {
              usageDrawer.onFalse();
              setSelected(null);
            }}
            sx={{ p: 0.5, color: 'text.secondary' }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
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
                <UsageRow icon="lucide:book" title="Subjects" items={usageData?.subjects || []} />
                <UsageRow
                  icon="lucide:layout-grid"
                  title="Used In Class Allocations"
                  count={usageData?.usage?.classAllocationsCount}
                  suffix="class allocation(s)"
                />
                <UsageRow
                  icon="lucide:users"
                  title="Student Selection"
                  count={usageData?.usage?.studentSelectionsCount}
                  suffix="student selection(s)"
                />
                <UsageRow
                  icon="lucide:calendar-clock"
                  title="Timetable"
                  count={usageData?.usage?.timetablePeriodsCount}
                  suffix="period(s)"
                />
                <UsageRow
                  icon="lucide:file-check"
                  title="Examination"
                  count={usageData?.usage?.examSchedulesCount}
                  suffix="exam schedule(s)"
                />
                <UsageRow
                  icon="lucide:bar-chart-2"
                  title="Subject Wise Student Count"
                  items={
                    usageData?.usage?.subjectWiseStudentCount?.map(
                      (item: any) => `${item.subject}: ${item.count} student(s)`
                    ) || []
                  }
                />
              </Box>
              <Alert severity={usageData?.canDelete ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {usageData?.canDelete
                  ? 'This elective group is not currently used in any class allocation. Safe to edit or delete.'
                  : 'This elective group is already used. Safe to edit color and description. Archive is recommended if no longer used.'}
              </Alert>
            </>
          )}
        </Box>
      </Drawer>

      <CustomDialog
        open={addElectiveGroupDialog.value}
        handleClose={() => {
          addElectiveGroupDialog.onFalse();
          setTimeout(() => {
            setSelected(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selected ? 'Update Elective Group' : 'Add Elective Group'}
            </Typography>
            <CustomTooltip
              arrow
              sx={{ textAlign: 'justify' }}
              placement="right"
              title={
                selected
                  ? 'You can update the elective group details by entering group name, subjects and color.'
                  : 'You can create a new elective group details by entering the group name, subjects and color.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SettingElectiveSubjectForm
          open={addElectiveGroupDialog}
          onClose={handleClose}
          editData={selected}
        />
      </CustomDialog>

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          setSelected(null);
          archiveDialog.onFalse();
        }}
        title="Archive Elective Group"
        content={
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Archived groups will not be available for new class allocations but will remain
              visible in old academic records.
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
                await archiveElectiveGroup({
                  academicMediumId: (currentMedium as any)?.id,
                  id: selected?.id,
                  body: { reason: archiveReason },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Elective group archived successfully.' });
                archiveDialog.onFalse();
                setSelected(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive elective group.',
                });
              }
            }}
          >
            Archive
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelected(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            {selected?.canDelete ? (
              <>
                Are you sure you want to delete elective group <strong>{selected?.name}</strong>?
              </>
            ) : (
              <>
                <strong>{selected?.name}</strong> cannot be deleted because it is already used. You
                can archive this group instead.
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
            disabled={!selected?.canDelete}
            onClick={async () => {
              try {
                await deleteElectiveGroup({
                  academicMediumId: (currentMedium as any)?.id,
                  id: (selected as any)?.id,
                }).unwrap();
                shikshaMitraToast.success({
                  message: 'Elective subject group deleted successfully',
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete elective subject group.',
                });
              }
              deleteDialog.onFalse();
              setSelected(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ElectiveSubjectSetting;

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
        <Typography variant="caption" fontWeight={600} color={isEmpty ? 'text.disabled' : 'text.primary'}>
          {isEmpty ? 'Not used' : `${value} ${suffix || ''}`.trim()}
        </Typography>
      </Box>
      {hasItems && value > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, ml: '44px' }}>
          {items.map((item) => (
            <Chip key={item} label={item} size="small" variant="outlined" sx={{ height: 22, fontSize: '11px' }} />
          ))}
        </Box>
      )}
    </Box>
  );
};
