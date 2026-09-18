'use client';

import type { AdmissionInquiryCounsellor } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';
import { useBulkAssignAdmissionInquiryCounsellorMutation } from 'src/redux/student/admissions/admission-inquiries-api';

export function AdmissionInquiryBulkAssignmentDialog({
  inquiryIds,
  counsellors,
  onClose,
  onCompleted,
}: {
  inquiryIds: string[];
  counsellors: AdmissionInquiryCounsellor[];
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [counsellorId, setCounsellorId] = useState('');
  const [assign, assignState] = useBulkAssignAdmissionInquiryCounsellorMutation();
  if (!inquiryIds.length) return null;

  const submit = async () => {
    if (!counsellorId) return;
    try {
      const result = await assign({
        inquiryIds,
        assignment: { mode: 0, counsellorId, candidateCounsellorIds: [] },
      }).unwrap();
      shikshaMitraToast.success({
        message: `${result.updatedCount} inquiries were assigned successfully.`,
      });
      onCompleted();
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail ||
          'The selected counsellor cannot access every inquiry. No assignments were changed.',
      });
    }
  };

  return (
    <CustomDialog
      open
      maxWidth="xs"
      title="Assign selected inquiries"
      handleClose={onClose}
      disableClose={assignState.isLoading}
    >
      <DialogScrollContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assign {inquiryIds.length} selected inquiries to one counsellor. The update is applied
          only when that counsellor can access every selected offering.
        </Typography>
        <TextField
          select
          fullWidth
          required
          size="small"
          label="Counsellor"
          value={counsellorId}
          onChange={(event) => setCounsellorId(event.target.value)}
        >
          {counsellors.map((counsellor) => (
            <MenuItem key={counsellor.id} value={counsellor.id}>
              {counsellor.name || counsellor.userName}
            </MenuItem>
          ))}
        </TextField>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" size="small" disabled={assignState.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          loading={assignState.isLoading}
          disabled={!counsellorId}
          startIcon={<Iconify icon="mdi:account-arrow-right-outline" />}
          onClick={submit}
        >
          Assign {inquiryIds.length}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
