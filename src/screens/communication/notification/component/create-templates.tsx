import React, { useState } from 'react';

import { Button, Typography, DialogActions, DialogContent } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const CreateNotificationTemplates = () => {
  const templateData = [
    {
      id: '1',
      templateName: 'Fee Reminder',
      category: 'Fees',
      description:
        'This is a friendly reminder that the [Fee Type] fee for [Month/Term] is due on [Due Date]. Kindly make the payment of ₹[Amount] to avoid any late fees.',
    },

    {
      id: '2',
      templateName: 'Overdue Fee Reminder',
      category: 'Fees',
      description:
        'We noticed that your [Fee Type] fee of ₹[Amount] for [Month/Term] was due on [Due Date] and is still pending. Please clear the payment at the earliest to avoid additional late fees or service disruptions',
    },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const dialogForTemplateView = useBoolean();
  return (
    <>
      <CustomizableTable
        isLoading={false}
        isFilter={false}
        isSearch={false}
        isShowedDense={false}
        tableId="notification-template-table"
        columns={[
          { id: 'templateName', label: 'Name' },
          { id: 'category', label: 'Category' },
          {
            id: 'description',
            label: 'Description',
            render: (value, row) => (
              <Typography
                sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value}
              </Typography>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (row: any, value) => (
              <ThreeDotsActions
                placement="right-top"
                showThreeDots={false}
                showDeleteIcon
                showEditIcon
                showViewIcon
                handleViewClick={() => {
                  setSelectedTemplate(value);
                  dialogForTemplateView.onTrue();
                }}
              />
            ),
          },
        ]}
        data={templateData}
      />

      <CustomDialog
        maxWidth="md"
        title="Notification Template"
        open={dialogForTemplateView.value}
        handleClose={() => {
          dialogForTemplateView.onFalse();
        }}
      >
        <DialogContent>
          {selectedTemplate && (
            <>
              <Typography>
                <strong>Template Name:</strong> {selectedTemplate.templateName}
              </Typography>
              <Typography>
                <strong>Category:</strong> {selectedTemplate.category}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Description:</strong>
              </Typography>
              <Typography>{selectedTemplate.description}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              dialogForTemplateView.onFalse();
            }}
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default CreateNotificationTemplates;
