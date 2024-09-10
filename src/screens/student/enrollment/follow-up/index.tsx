'use client';

import React, { useState } from 'react';

import { Add, Send } from '@mui/icons-material';
import { Box, Button, TextField, IconButton, DialogActions, InputAdornment } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FollowUpScreen: React.FC = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Dummy data
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      board: 'CBSE',
      medium: 'English',
      organization: 'Primary',
      class: '10th',
      status: 'Interested',
      remark: 'Wants to join next month',
      reminderDate: '2023-06-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      board: 'ICSE',
      medium: 'English',
      organization: 'Pre-Primary',
      class: '12th',
      status: 'Pending',
      remark: 'Needs more information',
      reminderDate: '2023-06-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      board: 'State Board',
      medium: 'Hindi',
      organization: 'Primary',
      class: '8th',
      status: 'Not Interested',
      remark: 'Prefers another school',
      reminderDate: null,
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInquiry(null);
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Follow Up"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Follow Up' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'board', label: 'Board' },
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'class' },
          // { id: 'status', label: 'Status' },
          { id: 'remark', label: 'Remark' },
          { id: 'reminderDate', label: 'Reminder Date' },
          {
            id: 'conversation',
            label: 'Conversation',
            isSort: false,
            align: 'center',
            render(value, row) {
              return (
                <IconButton
                  sx={{
                    backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    },
                    height: '24px',
                    width: '24px',
                  }}
                  onClick={() => setOpenDialog(true)}
                >
                  <Add sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              );
            },
          },
        ]}
        data={dummyData}
      />

      <CustomDialog open={openDialog} handleClose={handleCloseDialog} title="Communication History">
        <Scrollbar
          sx={{
            p: 3,
            bgcolor: 'background.neutral',
            height: '350px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              left: 16,
              zIndex: 1000,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Scrollbar>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined" color="error">
            Close
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default FollowUpScreen;
