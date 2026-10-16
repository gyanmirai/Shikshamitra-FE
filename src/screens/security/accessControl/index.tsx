'use client';

import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccessControlForm } from './access-control-form';

export { BoardScreenStep } from './board-screen-step';
export { AccessControlForm } from './access-control-form';
export { submitAccessControlForm } from './services/submit-access-control';

// Main screen component for access control functionality
const AccessControlScreen = () => {
  // Dialog state for showing/hiding access control form
  const dialog = useBoolean();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Access Control"
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'Access Control' }]}
        action={
          <Button variant="contained" onClick={dialog.onTrue}>
            Add Access Control
          </Button>
        }
      />
      <CustomizableTable
        tableId="access-control"
        columns={[
          { id: 'employee', label: 'Employee Name' },
          { id: 'board', label: 'Board' },
        ]}
        data={[]}
      />
      <CustomDialog
        maxWidth="lg"
        title="Access Control"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <AccessControlForm />
      </CustomDialog>
    </Box>
  );
};

export default AccessControlScreen;
