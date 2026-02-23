'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetGroupsQuery,
  groupManagementApi,
  useDeleteGroupMutation,
} from 'src/redux/calendar/GroupManagement/groupManagementApi';

import GroupForm from './Components/GroupForm';
import GroupTable from './Components/GroupTable';
// View-only dialog component for rich read presentation of a group's data
import GroupViewDialog from './Components/GroupViewDialog';

import type { IGroup } from './Components/type';

const GroupManagement = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    data: groupData,
    isLoading: isLoadingGroups,
    isFetching: isFetchingGroups,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGroupsQuery,
    params: { AcademicYearId: currentYear?.id },
  });

  const [deleteGroup, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteGroupMutation,
  });

  const [open, setOpen] = useState(false); // controls form (add/edit) visibility
  const [editingGroup, setEditingGroup] = useState<IGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<IGroup | null>(null); // controls view dialog
  const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);
  const confirm_dialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingGroup(null);
  };

  const handleCloseView = () => {
    setViewingGroup(null);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {open ? (
        <CustomBreadcrumbs
          heading={editingGroup ? 'Update Group' : 'Add Group'}
          description={
            editingGroup
              ? 'Update this calendar group with revised details, members, or settings. Efficiently manage group information and access.'
              : 'Create or update calendar groups with important details, members, and settings. Share and manage group access efficiently.'
          }
          links={[
            { name: 'Calendar', href: '/calendar/dashboard' },
            {
              name: 'Group Management',
              href: '/calendar/group-management',
              onClick(e) {
                setOpen(false);
                setEditingGroup(null);
              },
            },
            { name: editingGroup ? 'Update Group' : 'Add Group' },
          ]}
          sx={{ px: 1 }}
          isBack
          onBack={() => {
            handleCloseDialog();
          }}
        />
      ) : viewingGroup ? (
        <CustomBreadcrumbs
          heading="Group Details"
          description="Detailed view of the selected calendar group including boards, mediums, classes, divisions, roles and audience breakdown."
          links={[
            { name: 'Calendar', href: '/calendar/dashboard' },
            {
              name: 'Group Management',
              href: '/calendar/group-management',
              onClick: handleCloseView,
            },
            { name: viewingGroup.name || 'Group Details' },
          ]}
          sx={{ px: 1 }}
          isBack
          onBack={handleCloseView}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Group Management"
          description="View and manage all calendar groups, including group details, members, and access settings. Add new groups, update existing ones, or remove them as needed."
          links={[{ name: 'Calendar', href: '/calendar/dashboard' }, { name: 'Group Management' }]}
          sx={{ px: 1 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ px: '32px' }}
            >
              Group
            </Button>
          }
        />
      )}

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <GroupForm
            initialValues={editingGroup}
            isEdit={!!editingGroup}
            onClose={handleCloseDialog}
          />
        </Card>
      ) : viewingGroup ? (
        <GroupViewDialog open={!!viewingGroup} group={viewingGroup} onClose={handleCloseView} />
      ) : (
        <GroupTable
          data={groupData?.items || []}
          isLoading={isLoadingGroups || isFetchingGroups}
          onEdit={(group) => {
            setEditingGroup(group);
            setOpen(true);
          }}
          onDelete={(row) => {
            setSelectedGroup(row as IGroup);
            confirm_dialog.onTrue();
          }}
          onView={(row) => {
            setViewingGroup(row as IGroup);
          }}
          setOpen={setOpen}
        />
      )}

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setSelectedGroup(null);
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>&apos;{selectedGroup?.name}&apos;</strong>{' '}
            Group?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedGroup,
                message: `Group: ${selectedGroup?.name} deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    groupManagementApi.util.updateQueryData(
                      'getGroups',
                      { AcademicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft?.items?.findIndex(
                          (item: any) => item.id === selectedGroup?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1 && draft) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deleteGroup(selectedGroup?.id || ''),
              });
              confirm_dialog.onFalse();
              setSelectedGroup(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};
export default GroupManagement;

// View Feature Notes:
// - Triggered via ThreeDotsActions handleViewClick in GroupTable.
// - Sets viewingGroup which switches layout to breadcrumb + GroupViewDialog.
// - GroupViewDialog is read-only; closing resets viewingGroup to null and returns to table.
// - Add/Edit flow is unaffected; view state is mutually exclusive with form state.
