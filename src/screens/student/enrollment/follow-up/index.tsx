'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { Add, Send } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  Avatar,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FollowUpScreen: React.FC = () => {
  const [, setSelectedInquiry] = useState<any>(null);
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
    {
      id: 4,
      name: 'Sarah Brown',
      board: 'CBSE',
      medium: 'English',
      organization: 'Secondary',
      class: '11th',
      status: 'Interested',
      remark: 'Completed admission process',
      reminderDate: null,
    },
    {
      id: 5,
      name: 'Alex Lee',
      board: 'IB',
      medium: 'English',
      organization: 'High School',
      class: '9th',
      status: 'Pending',
      remark: 'Waiting for seat availability',
      reminderDate: '2023-07-01',
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
            id: 'status',
            label: 'Status',
            render(value, row) {
              let color: LabelColor = 'success';
              if (value === 'Interested') {
                color = 'success';
              } else if (value === 'Pending') {
                color = 'warning';
              } else {
                color = 'error';
              }
              return <Label color={color}>{value}</Label>;
            },
          },
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
        <CommunicationForm handleCloseDialog={handleCloseDialog} />
      </CustomDialog>
    </Box>
  );
};

export default FollowUpScreen;

export const CommunicationForm = ({ handleCloseDialog }: any) => (
  <Box>
    <Scrollbar
      sx={{
        bgcolor: 'background.neutral',

        position: 'relative',
        height: '350px',
        p: 2,
      }}
    >
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar />
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography component="span" variant="subtitle2" color="text.secondary">
              06-01-2025 12:30 PM
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quas, sit dolores delectus quae
          culpa iste harum placeat facere, dicta quod tempora? Dicta necessitatibus laudantium
          laboriosam dolores illo molestiae. Dolores, eaque.
        </Typography>
      </Box>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar />
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography component="span" variant="subtitle2" color="text.secondary">
              06-01-2025 12:30 PM
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quas, sit dolores delectus quae
          culpa iste harum placeat facere, dicta quod tempora? Dicta necessitatibus laudantium
          laboriosam dolores illo molestiae. Dolores, eaque.
        </Typography>
      </Box>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar />
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography component="span" variant="subtitle2" color="text.secondary">
              06-01-2025 12:30 PM
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quas, sit dolores delectus quae
          culpa iste harum placeat facere, dicta quod tempora? Dicta necessitatibus laudantium
          laboriosam dolores illo molestiae. Dolores, eaque.
        </Typography>
      </Box>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar />
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography component="span" variant="subtitle2" color="text.secondary">
              06-01-2025 12:30 PM
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quas, sit dolores delectus quae
          culpa iste harum placeat facere, dicta quod tempora? Dicta necessitatibus laudantium
          laboriosam dolores illo molestiae. Dolores, eaque.
        </Typography>
      </Box>
    </Scrollbar>
    <Box
      sx={{
        // position: 'absolute',
        // bottom: 16,
        // right: 16,
        // left: 16,
        // zIndex: 1000,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Follow Up Message"
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
      <DatePicker label="Due Date" slotProps={{ textField: { size: 'small', fullWidth: true } }} />
      <CustomSelect
        options={[
          { label: 'Interested', value: 'interested' },
          { label: 'Not Interested', value: 'notInterested' },
          { label: 'Pending', value: 'pending' },
        ]}
        value=""
        onChange={() => {}}
        label="Change Status"
        formControlProps={{ sx: { maxWidth: 'unset' }, fullWidth: true }}
      />
    </Box>
    <DialogActions>
      <Button onClick={handleCloseDialog} variant="outlined" color="error">
        Close
      </Button>
      <Button onClick={handleCloseDialog} variant="contained">
        Submit
      </Button>
    </DialogActions>
  </Box>
);
