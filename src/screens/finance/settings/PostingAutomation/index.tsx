'use client';

import React, { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Table,
  Select,
  Button,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  FormControl,
  TableContainer,
} from '@mui/material';

const POSTING_EVENTS = [
  { id: 'A1', name: 'Student Payment Received' },
  { id: 'A2', name: 'Late Fee Assigned' },
  { id: 'A3', name: 'Bounce / Chargeback' },
  { id: 'A4', name: 'Fee Concession Applied' },
  { id: 'A5', name: 'Fee Waiver Applied' },
  { id: 'A6', name: 'Installment Overdue Penalty' },
  { id: 'A7', name: 'Refund Request Approved' },
  { id: 'A8', name: 'Refund Disbursed' },
  { id: 'A9', name: 'Security Deposit Returned' },
  { id: 'A10', name: 'Credit Note Issued' },
  { id: 'A11', name: 'Wallet Top-up' },
  { id: 'A12', name: 'Expense Bill Logged' },
  { id: 'A13', name: 'Expense Payment Sent' },
  { id: 'A14', name: 'Bank Interest Received' },
  { id: 'A15', name: 'Bank Charge Deducted' },
  { id: 'A16', name: 'Payroll Disbursed' },
  { id: 'A17', name: 'Payroll Bounce' },
];

type PostingMode = 'Auto' | 'Draft' | 'Off';

export default function PostingAutomation() {
  const [modes, setModes] = useState<Record<string, PostingMode>>(() => {
    const initial: Record<string, PostingMode> = {};
    POSTING_EVENTS.forEach((e) => {
      initial[e.id] = 'Draft';
    });
    return initial;
  });

  const handleModeChange = (eventId: string, newMode: PostingMode) => {
    setModes((prev) => ({ ...prev, [eventId]: newMode }));
  };

  const handleSave = () => {
    shikshaMitraToast.success({ message: 'Posting automation settings saved.' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Posting Automation Settings"
        description="Configure whether financial events should post immediately, go to draft, or not post at all."
        links={[
          { name: 'Finance', href: '/finance/dashboard/' },
          { name: 'Accounts Settings', href: '#' },
          { name: 'Posting Automation' },
        ]}
        action={
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <Card sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Event ID</TableCell>
                <TableCell>Event Name</TableCell>
                <TableCell>Automation Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {POSTING_EVENTS.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {event.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ width: 120 }}>
                      <Select
                        value={modes[event.id]}
                        onChange={(e) => handleModeChange(event.id, e.target.value as PostingMode)}
                      >
                        <MenuItem value="Auto">Auto-Post</MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Off">Off</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
