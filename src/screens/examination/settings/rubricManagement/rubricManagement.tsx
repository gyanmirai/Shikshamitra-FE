import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Switch, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import rubricTableData from 'src/json/academic/examination/rubricTableData.json';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import RubricCreationForm from './rubricCreationForm';

const RubricManagement = () => {
  const dialog = useBoolean();
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
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showThreeDots={false}
                  showViewIcon
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {}}
                  handleEditClick={() => {}}
                  handleViewClick={() => {}}
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
    </Box>
  );
};

export default RubricManagement;
