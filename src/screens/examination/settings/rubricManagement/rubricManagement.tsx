import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Switch, Button } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import rubricTableData from 'src/json/academic/examination/rubricTableData.json';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import RubricCreationForm from './rubricCreationForm';

const RubricManagement = () => {
  const dialog = useBoolean();
  const deleteDialog = useBoolean();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rubricData, setRubricData] = useState(rubricTableData);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            dialog.onTrue();
          }}
          size="small"
          variant="contained"
        >
          Rubric
        </Button>
      </Box>
      <CustomizableTable
        tableId="rubricTable"
        searchFieldProps={{
          placeholder: 'Search by Class, Subject Name, Point Scale...',
          label: 'Search by Class, Subject Name, Point Scale...',
        }}
        noDataText={
          <>
            No Rubric Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              Create Rubric
            </Box>
          </>
        }
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'pointScale', label: 'Point Scale', minWidth: '150px', align: 'left' },
          { id: 'objective', label: 'Objective' },
          {
            id: 'rubricDescription',
            label: 'Rubric Description',
            minWidth: '200px',
            align: 'left',
          },
          { id: 'date', label: 'Date' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: boolean, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value}
                  onChange={() => {
                    // setPendingStatusChange({
                    //   id: row.id, // Use row.id instead of undefined 'id'
                    //   value: !value,
                    // });
                    // confirmPublishDialog.onTrue();
                  }}
                />
              </Box>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,

            render(value, row) {
              return (
                <AdaptiveThreeDotsActions
                  actions={[
                    {
                      id: 'view',
                      label: 'View rubric',
                      icon: 'solar:eye-bold',
                      onClick: () => undefined,
                    },
                    {
                      id: 'edit',
                      label: 'Edit rubric',
                      icon: 'solar:pen-bold',
                      onClick: dialog.onTrue,
                    },
                    {
                      id: 'delete',
                      label: 'Delete rubric',
                      icon: 'solar:trash-bin-trash-bold',
                      color: 'error.main',
                      onClick: deleteDialog.onTrue,
                    },
                  ]}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={rubricData}
      />

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="New Rubric"
      >
        <RubricCreationForm />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default RubricManagement;
