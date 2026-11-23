'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { useCloneRefundPolicyMutation } from 'src/redux/finance/refundPolicy';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useAcademicOptions } from 'src/layouts/components/global-academic-search/use-academic-options';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  isApiProblemCodeMessage,
  parseApiProblemDetail,
  isGenericApiProblemMessage,
} from 'src/utils/api-problem-details';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function RefundPolicyCloneDialog({
  policy,
  onClose,
}: {
  policy: IFinancePolicyRow;
  onClose: () => void;
}) {
  const { yearOptions, isLoading } = useAcademicOptions(false);
  const [clonePolicy, { isLoading: isCloning }] = useCloneRefundPolicyMutation();
  const [targetYearId, setTargetYearId] = useState(policy.academicYearId);
  const [errorMessage, setErrorMessage] = useState('');
  const targetYear = yearOptions.find(({ value }) => value === targetYearId);

  const clone = async () => {
    if (!targetYear || isCloning) return;
    setErrorMessage('');
    try {
      const cloned = await clonePolicy({
        id: policy.id,
        body: { targetAcademicYearId: targetYearId },
      }).unwrap();
      shikshaMitraToast.success({
        message: `“${cloned.policyName}” was created in ${targetYear.label}.`,
      });
      onClose();
    } catch (error) {
      const { detail } = parseApiProblemDetail(error);
      const generic =
        isGenericApiProblemMessage(detail) ||
        isApiProblemCodeMessage(detail) ||
        detail === 'Something went wrong';
      setErrorMessage(generic ? 'Could not clone this refund policy. Try again.' : detail);
    }
  };

  return (
    <CustomDialog
      open
      title="Clone Refund Policy"
      maxWidth="xs"
      hasForm={false}
      disableClose={isCloning}
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Create a draft copy of <strong>{policy.policyName}</strong> in the selected academic
            year.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Target academic year"
            value={targetYear?.value ?? ''}
            disabled={isLoading || isCloning || !yearOptions.length}
            helperText={isLoading ? 'Loading academic years…' : undefined}
            onChange={(event) => {
              setTargetYearId(event.target.value);
              setErrorMessage('');
            }}
          >
            {yearOptions.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {!isLoading && !yearOptions.length && (
            <Alert severity="warning">No academic years are available for this action.</Alert>
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={isCloning}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon="mdi:content-copy" />}
          loading={isCloning}
          disabled={isLoading || !targetYear}
          onClick={clone}
        >
          Clone
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
