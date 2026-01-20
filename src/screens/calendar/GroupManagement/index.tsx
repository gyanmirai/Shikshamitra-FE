'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GroupForm from './Components/GroupForm';
import GroupTable from './Components/GroupTable';
// View-only dialog component for rich read presentation of a group's data
import GroupViewDialog from './Components/GroupViewDialog';

import type { IGroup } from './Components/type';

const GroupManagement = () => {
  const [open, setOpen] = useState(false); // controls form (add/edit) visibility
  const [editingGroup, setEditingGroup] = useState<IGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<IGroup | null>(null); // controls view dialog

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
          sx={{ px: 1, mb: 2 }}
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
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={handleCloseView}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Group Management"
          description="View and manage all calendar groups, including group details, members, and access settings. Add new groups, update existing ones, or remove them as needed."
          links={[{ name: 'Calendar', href: '/calendar/dashboard' }, { name: 'Group Management' }]}
          sx={{ px: 1, mb: 1 }}
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
          onEdit={(group) => {
            setEditingGroup(group);
            setOpen(true);
          }}
          onDelete={(row) => {
            /* TODO: implement delete logic */
          }}
          onView={(row) => {
            setViewingGroup(row as IGroup);
          }}
          setOpen={setOpen}
        />
      )}
    </Box>
  );
};
export default GroupManagement;

// View Feature Notes:
// - Triggered via ThreeDotsActions handleViewClick in GroupTable.
// - Sets viewingGroup which switches layout to breadcrumb + GroupViewDialog.
// - GroupViewDialog is read-only; closing resets viewingGroup to null and returns to table.
// - Add/Edit flow is unaffected; view state is mutually exclusive with form state.
