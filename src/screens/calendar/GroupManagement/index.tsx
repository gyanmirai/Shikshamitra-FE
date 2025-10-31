'use client';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GroupForm from './Components/GroupForm';
import GroupTable from './Components/GroupTable';

const GroupManagement = () => {
  const [open, setOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingGroup(null);
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
            { name: 'Calendar', href: '/calendar' },
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
      ) : (
        <CustomBreadcrumbs
          heading="Group Management"
          description="View and manage all calendar groups, including group details, members, and access settings. Add new groups, update existing ones, or remove them as needed."
          links={[{ name: 'Calendar', href: '/calendar' }, { name: 'Group Management' }]}
          sx={{ px: 1, mb: 1 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
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
            /* TODO: implement view logic */
          }}
          setOpen={setOpen}
        />
      )}
    </Box>
  );
};
export default GroupManagement;
