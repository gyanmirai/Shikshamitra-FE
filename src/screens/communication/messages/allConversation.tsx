'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { CommunicationReplyDto } from 'src/redux/communication/communicationTypes';

import dayjs from 'dayjs';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { channelLabel } from 'src/redux/communication/communicationMappers';
import { CommunicationReplyStatus } from 'src/redux/communication/communicationTypes';
import { Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetCommunicationRepliesQuery,
  useAssignCommunicationReplyMutation,
} from 'src/redux/communication/communicationApi';

const replyStatusLabel: Record<CommunicationReplyStatus, string> = {
  [CommunicationReplyStatus.Open]: 'Open',
  [CommunicationReplyStatus.Assigned]: 'Assigned',
  [CommunicationReplyStatus.Resolved]: 'Resolved',
  [CommunicationReplyStatus.Archived]: 'Archived',
};

const AllConversation = (props: TabComponentType) => {
  const [selectedReply, setSelectedReply] = useState<CommunicationReplyDto | null>(null);
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState(CommunicationReplyStatus.Assigned);

  const { data: replies, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCommunicationRepliesQuery,
    params: { maxResultCount: 200 },
  });

  const [assignReply, { isLoading: isAssigning }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignCommunicationReplyMutation,
  });

  const openAssignDialog = (reply: CommunicationReplyDto) => {
    setSelectedReply(reply);
    setAssignedDepartment(reply.assignedDepartment || '');
    setInternalNotes(reply.internalNotes || '');
    setStatus(
      reply.status === CommunicationReplyStatus.Open
        ? CommunicationReplyStatus.Assigned
        : reply.status
    );
  };

  const closeAssignDialog = () => {
    setSelectedReply(null);
    setAssignedDepartment('');
    setInternalNotes('');
    setStatus(CommunicationReplyStatus.Assigned);
  };

  const handleAssign = async () => {
    if (!selectedReply) {
      return;
    }

    try {
      await assignReply({
        id: selectedReply.id,
        data: {
          assignedDepartment: assignedDepartment || null,
          status,
          internalNotes: internalNotes || null,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Reply assignment updated successfully' });
      closeAssignDialog();
    } catch (error: any) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to assign reply',
      });
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Communication Inbox"
        description="Review captured replies from WhatsApp, SMS, email, and in-app campaigns and assign them to the right owner."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Inbox', href: '/communication/messages' },
        ]}
      />

      <CustomizableTable
        tableId="communication-replies-table"
        isLoading={isLoading}
        noDataText="No replies found"
        columns={[
          {
            id: 'receivedAt',
            label: 'Received',
            align: 'left',
            render: (value) => (
              <Typography fontSize="13px">
                {value ? dayjs(value).format('DD-MM-YYYY hh:mm A') : '--'}
              </Typography>
            ),
          },
          {
            id: 'fromAddress',
            label: 'From',
            align: 'left',
          },
          {
            id: 'channel',
            label: 'Channel',
            align: 'left',
            render: (value) => channelLabel(value),
          },
          {
            id: 'body',
            label: 'Reply',
            align: 'left',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value || '--'}
              </Typography>
            ),
          },
          {
            id: 'assignedDepartment',
            label: 'Assigned To',
            align: 'left',
            render: (value) => value || '--',
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            render: (value) => replyStatusLabel[value as CommunicationReplyStatus] || '--',
          },
          {
            id: 'action',
            label: 'Action',
            align: 'center',
            isSort: false,
            sticky: true,
            isFilter: false,
            render: (_value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                placement="right-top"
                showEditIcon
                handleEditClick={() => openAssignDialog(row as CommunicationReplyDto)}
              />
            ),
          },
        ]}
        data={replies?.items || []}
      />

      <CustomDialog
        open={!!selectedReply}
        title="Assign Reply"
        handleClose={closeAssignDialog}
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Department"
            value={assignedDepartment}
            onChange={(event) => setAssignedDepartment(event.target.value)}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={status}
            onChange={(event) => setStatus(Number(event.target.value))}
          >
            {Object.entries(replyStatusLabel).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Internal Notes"
            value={internalNotes}
            onChange={(event) => setInternalNotes(event.target.value)}
          />
        </Box>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button variant="outlined" size="small" onClick={closeAssignDialog}>
            Cancel
          </Button>
          <Button variant="contained" size="small" disabled={isAssigning} onClick={handleAssign}>
            Save
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default AllConversation;
