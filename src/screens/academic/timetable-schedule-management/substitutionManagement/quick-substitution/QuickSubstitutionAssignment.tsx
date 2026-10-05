import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  Box,
  Alert,
  Stack,
  Button,
  Checkbox,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { getCoverageWindow } from './quick-substitution-context';
import { QuickSubstitutionShell } from './QuickSubstitutionShell';
import { QuickSubstitutionCandidates } from './QuickSubstitutionCandidates';
import { useQuickSubstitutionAssignment } from './use-quick-substitution-assignment';

import type { QuickSubstitutionContext, QuickSubstitutionLecture } from './types';

type Props = {
  context: QuickSubstitutionContext;
  lecture: QuickSubstitutionLecture;
  onSaved: () => void;
  onBack: () => void;
  onClose: () => void;
};

export function QuickSubstitutionAssignment({ context, lecture, onSaved, onBack, onClose }: Props) {
  const { formik, suggestions, saving, error } = useQuickSubstitutionAssignment(
    context,
    lecture,
    onSaved
  );
  const discard = useBoolean();
  const [discardTarget, setDiscardTarget] = useState<'back' | 'close'>('close');
  const requestLeave = (target: 'back' | 'close') => {
    if (!saving && !suggestions.isFetching) {
      if (formik.dirty) {
        setDiscardTarget(target);
        discard.onTrue();
      } else if (target === 'back') onBack();
      else onClose();
    }
  };
  const close = () => requestLeave('close');
  const window = getCoverageWindow(context, lecture);
  return (
    <QuickSubstitutionShell
      context={context}
      onClose={close}
      busy={saving || suggestions.isFetching}
    >
      <Box sx={{ p: 2, overflow: 'auto', minHeight: 0, flex: 1 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">
            {lecture.period} · Class {lecture.className}-{lecture.divisionName} ·{' '}
            {lecture.subjectName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cover {window.startTime}–{window.endTime}
          </Typography>
          {suggestions.isFetching ? (
            <LinearProgress aria-label="Loading substitute suggestions" />
          ) : suggestions.isError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => suggestions.refetch()}>Retry</Button>}
            >
              Substitute suggestions could not be loaded.
            </Alert>
          ) : (
            <QuickSubstitutionCandidates
              teachers={suggestions.currentData || []}
              selectedId={formik.values.teacherId}
              disabled={saving}
              onSelect={(id) => formik.setFieldValue('teacherId', id)}
            />
          )}
          <FormControlLabel
            label="Require teacher acknowledgement"
            control={
              <Checkbox
                name="acknowledgementRequired"
                checked={formik.values.acknowledgementRequired}
                onChange={formik.handleChange}
                disabled={saving}
              />
            }
          />
          {formik.touched.teacherId && formik.errors.teacherId && (
            <Alert severity="error">{formik.errors.teacherId}</Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={() => requestLeave('back')} disabled={saving || suggestions.isFetching}>
          Back
        </Button>
        <Button onClick={close} disabled={saving || suggestions.isFetching}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => formik.submitForm()}
          disabled={saving || suggestions.isFetching || suggestions.isError}
        >
          {saving ? 'Assigning…' : 'Assign substitute'}
        </Button>
      </Stack>
      <ConfirmDialog
        open={discard.value}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        onClose={discard.onFalse}
        title="Discard substitution selection?"
        content="Your selected substitute has not been assigned."
        action={
          <Button
            onClick={() => {
              discard.onFalse();
              if (discardTarget === 'back') onBack();
              else onClose();
            }}
          >
            Discard selection
          </Button>
        }
      />
    </QuickSubstitutionShell>
  );
}
