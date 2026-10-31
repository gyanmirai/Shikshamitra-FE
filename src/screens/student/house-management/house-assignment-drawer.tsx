import type {
  House,
  HouseAssignment,
  HouseAssignmentPreview,
} from 'src/redux/student/house-management/house-management-types';

import { GlobalIcons } from 'src/utils/icons';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Box, Alert, Stack, Drawer, Button, Divider, Typography, IconButton } from '@mui/material';

import { HousePicker } from './house-pickers';
import { assignmentInput } from './house-management-model';
import { useHouseCloseGuard } from './use-house-close-guard';

type Props = {
  academicMediumId: string;
  enrollmentIds: string[];
  initialMode?: 'assign' | 'remove';
  onClose: () => void;
  onPreview: (input: HouseAssignment) => Promise<HouseAssignmentPreview>;
  onCommit: (input: HouseAssignment & { previewToken: string }) => Promise<void>;
};
export default function HouseAssignmentDrawer({
  academicMediumId,
  enrollmentIds,
  initialMode = 'assign',
  onClose,
  onPreview,
  onCommit,
}: Props) {
  const titleId = useId();
  const submitting = useRef(false);
  const [mode, setMode] = useState(initialMode);
  const [house, setHouse] = useState<House | null>(null);
  const [preview, setPreview] = useState<HouseAssignmentPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const { close, confirmation } = useHouseCloseGuard(
    Boolean(house || preview || mode !== initialMode),
    busy,
    onClose
  );
  const submit = async () => {
    if (submitting.current) return;
    setTouched(true);
    if (mode === 'assign' && !house) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const input = assignmentInput(
        academicMediumId,
        mode === 'remove' ? '' : house!.id,
        enrollmentIds
      );
      if (preview) {
        await onCommit({ ...input, previewToken: preview.previewToken });
        onClose();
      } else setPreview(await onPreview(input));
    } catch (failure) {
      setPreview(null);
      setError(parseApiProblemDetail(failure).detail);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: { width: { xs: 1, sm: 680 }, maxWidth: 1, display: 'flex', flexDirection: 'column' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Typography id={titleId} variant="h6" sx={{ flex: 1 }}>
            Change House Membership
          </Typography>
          <InfoTooltipIcon
            title="Preview the selected students and leadership consequences before confirming this change."
            label="Membership change information"
            disabled={busy}
          />
          <IconButton aria-label="Close Change House Membership" disabled={busy} onClick={close}>
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          <FormBusyRegion busy={busy} label={preview ? 'Saving changes…' : 'Preparing preview…'}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <FormSectionCard
                title="Membership Change"
                icon={GlobalIcons.assigned}
                descriptionTooltip="Selected students can span classes in this medium. Review the server preview before confirming."
              >
                <Typography variant="body2">
                  Selected students: {enrollmentIds.length}. Up to 500 students can be changed at
                  once.
                </Typography>
                <CustomSelect
                  label="Change"
                  value={mode}
                  options={[
                    { value: 'assign', label: 'Assign or move to a house' },
                    { value: 'remove', label: 'Remove from house' },
                  ]}
                  disabled={Boolean(preview || busy)}
                  onChange={(value) => {
                    setMode(value as typeof mode);
                    setPreview(null);
                  }}
                />
                {mode === 'assign' && (
                  <ShakingTextField error={touched && !house}>
                    <HousePicker
                      academicMediumId={academicMediumId}
                      value={house}
                      onChange={(value) => {
                        setHouse(value);
                        setPreview(null);
                      }}
                      required
                      label="Destination house"
                      disabled={Boolean(preview || busy)}
                      error={touched && !house}
                      helperText={touched && !house ? 'Choose a destination house.' : undefined}
                    />
                  </ShakingTextField>
                )}
              </FormSectionCard>
              {preview && (
                <FormSectionCard
                  title="Review Changes"
                  icon={GlobalIcons.eye}
                  descriptionTooltip="This preview verifies current memberships and leadership consequences. Changed server data requires another preview."
                >
                  <Typography variant="body2">
                    Students: {preview.students.length} → {preview.targetHouseName || 'No house'}
                  </Typography>
                  {preview.clearedHouseLeaders.map((student) => (
                    <Alert severity="warning" key={student.enrollmentId}>
                      {student.studentName} will no longer lead{' '}
                      {student.houseName || 'their current house'}.
                    </Alert>
                  ))}
                  <Typography variant="body2" color="text.secondary">
                    Division leadership stays unchanged.
                  </Typography>
                  <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2 }}>
                    {preview.students.map((student) => (
                      <Typography component="li" variant="body2" key={student.enrollmentId}>
                        {student.studentName} · {student.standardName}
                        {student.divisionName ? ` / ${student.divisionName}` : ''} ·{' '}
                        {student.houseName || 'Unassigned'} →{' '}
                        {preview.targetHouseName || 'Unassigned'}
                      </Typography>
                    ))}
                  </Stack>
                </FormSectionCard>
              )}
            </Stack>
          </FormBusyRegion>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          {preview && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={() => setPreview(null)}
              startIcon={<Iconify icon={GlobalIcons.edit} />}
            >
              Revise
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={busy}
            onClick={submit}
            startIcon={<Iconify icon={preview ? GlobalIcons.submit : GlobalIcons.eye} />}
          >
            {preview ? 'Confirm change' : 'Preview change'}
          </Button>
        </Stack>
      </Drawer>
      {confirmation}
    </>
  );
}
