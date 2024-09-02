'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Button,
  Dialog,
  MenuList,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface Inquiry {
  id: number;
  date: string;
  status: 'interested' | 'not interested' | 'pending';
  remark: string;
  communicationHistory: string[];
  reminderDate?: string;
}

const FollowUpScreen: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Fetch inquiries from API
    // For now, we'll use mock data
    setInquiries([
      {
        id: 1,
        date: '2023-05-01',
        status: 'interested',
        remark: 'Promising candidate',
        communicationHistory: ['Initial contact made'],
      },
      {
        id: 2,
        date: '2023-05-02',
        status: 'not interested',
        remark: 'Not a good fit',
        communicationHistory: ['Follow-up call made'],
      },
      {
        id: 3,
        date: '2023-05-03',
        status: 'pending',
        remark: '',
        communicationHistory: [],
        reminderDate: '2023-05-10',
      },
    ]);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInquiry(null);
  };
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            // modal.onTrue();
            // popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    []
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Follow Up"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Follow Up' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        columns={[
          { id: 'date', label: 'Date' },
          { id: 'status', label: 'Status' },
          { id: 'remark', label: 'Remark' },
          { id: 'reminderDate', label: 'Reminder Date' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return <ThreeDotsActions actions={actions} placement="right-top" />;
            },
          },
        ]}
        data={inquiries}
      />
      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remark</TableCell>
              <TableCell>Reminder Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{inquiry.date}</TableCell>
                <TableCell>
                  <Select
                    value={inquiry.status}
                    onChange={(e) =>
                      handleStatusChange(
                        inquiry.id,
                        e.target.value as 'interested' | 'not interested' | 'pending'
                      )
                    }
                  >
                    <MenuItem value="interested">Interested</MenuItem>
                    <MenuItem value="not interested">Not Interested</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    value={inquiry.remark}
                    onChange={(e) => handleRemarkChange(inquiry.id, e.target.value)}
                  />
                </TableCell>
                <TableCell>{inquiry.reminderDate || 'N/A'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenDialog(inquiry)}>View History</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Communication History</DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <ul>
              {selectedInquiry.communicationHistory.map((communication, index) => (
                <li key={index}>{communication}</li>
              ))}
            </ul>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FollowUpScreen;
