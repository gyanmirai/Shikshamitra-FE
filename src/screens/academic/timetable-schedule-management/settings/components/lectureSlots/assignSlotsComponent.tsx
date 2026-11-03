'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { Box, Stack, Button, Typography } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';

import { AssignSlotTargets } from './components/AssignSlotTargets';
import { useAssignSlotsForm, type AssignSlotsProps } from './hooks/useAssignSlotsForm';

export default function AssignSlots(props: AssignSlotsProps) {
  const { sourceClassName, onClose } = props;
  const form = useAssignSlotsForm(props);
  const { formik, busy } = form;

  return (
    <Box
      component="form"
      aria-label="Assign lecture slot"
      noValidate
      onSubmit={(event) => {
        if (busy) event.preventDefault();
        else formik.handleSubmit(event);
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        maxHeight: '100%',
      }}
    >
      <Box sx={{ overflowY: 'auto', minHeight: 0, p: { xs: 2, sm: 3 } }}>
        <FormBusyRegion busy={busy} label="Assigning lecture slots">
          <Stack spacing={2}>
            {sourceClassName && (
              <Stack direction="row" spacing={1} alignItems="baseline" useFlexGap flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  Copy from
                </Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {sourceClassName}
                </Typography>
              </Stack>
            )}
            <AssignSlotTargets form={form} />
          </Stack>
        </FormBusyRegion>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="flex-end"
        sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', px: { xs: 2, sm: 3 }, py: 1.5 }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
        <SubmitButton
          loading={busy}
          disabled={busy || !form.ready || !form.hasEligibleClasses}
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        />
      </Stack>
    </Box>
  );
}
