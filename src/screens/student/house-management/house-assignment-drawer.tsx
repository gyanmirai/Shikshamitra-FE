import type {
  House,
  HouseAssignment,
  HouseAssignmentPreview,
} from 'src/redux/student/house-management/house-management-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useId, useRef, useState, useEffect } from 'react';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  Checkbox,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { HousePicker } from './house-pickers';
import { assignmentInput } from './house-management-model';
import { useHouseCloseGuard } from './use-house-close-guard';

type Props = {
  academicMediumId: string;
  divisionId: string;
  divisionLabel?: string;
  enrollmentIds: string[];
  scope?: 'selected' | 'division';
  initialMode?: 'assign' | 'remove';
  onClose: () => void;
  onPreview: (input: HouseAssignment) => Promise<HouseAssignmentPreview>;
  onCommit: (input: HouseAssignment & { previewToken: string }) => Promise<void>;
};
export default function HouseAssignmentDrawer({
  academicMediumId,
  divisionId,
  divisionLabel,
  enrollmentIds,
  scope = 'selected',
  initialMode = 'assign',
  onClose,
  onPreview,
  onCommit,
}: Props) {
  const titleId = useId();
  const submitting = useRef(false);
  const requestVersion = useRef(0);
  const entireDivision = scope === 'division';
  const [mode, setMode] = useState(initialMode);
  const [includeAssigned, setIncludeAssigned] = useState(false);
  const noEligibleStudents = includeAssigned
    ? 'No eligible students in this division need the selected house change.'
    : 'No unassigned students are available. To move current members, include students already assigned to a house.';
  const [house, setHouse] = useState<House | null>(null);
  const [reviewed, setReviewed] = useState<{
    input: HouseAssignment;
    result: HouseAssignmentPreview;
  } | null>(null);
  const preview = reviewed?.result;
  const [busy, setBusy] = useState(false);
  const [writing, setWriting] = useState(false);
  const [assignmentBlocker, setAssignmentBlocker] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(
    () => () => {
      requestVersion.current += 1;
    },
    []
  );
  const closeDraft = () => {
    requestVersion.current += 1;
    submitting.current = false;
    setBusy(false);
    onClose();
  };
  const { close, confirmation } = useHouseCloseGuard(
    Boolean(house || reviewed || includeAssigned || mode !== initialMode),
    writing,
    closeDraft
  );
  const submit = async () => {
    if (submitting.current) return;
    setTouched(true);
    if ((entireDivision || mode === 'assign') && !house) return;
    if (entireDivision && preview?.students.length === 0) return;
    submitting.current = true;
    requestVersion.current += 1;
    const version = requestVersion.current;
    setBusy(true);
    setWriting(Boolean(preview));
    setAssignmentBlocker('');
    try {
      if (reviewed) {
        await onCommit({ ...reviewed.input, previewToken: reviewed.result.previewToken });
        if (version === requestVersion.current) onClose();
      } else {
        const input: HouseAssignment =
          entireDivision && house
            ? {
                academicMediumId,
                divisionId,
                houseId: house.id,
                targetScope: 'division',
                includeAssigned,
              }
            : assignmentInput(
                academicMediumId,
                divisionId,
                mode === 'remove' ? '' : house!.id,
                enrollmentIds
              );
        const result = await onPreview(input);
        if (version === requestVersion.current) setReviewed({ input, result });
      }
    } catch (failure) {
      if (version !== requestVersion.current) return;
      setReviewed(null);
      const problem = parseApiProblemDetail(failure);
      if (problem.errorCode === 'Students:HouseManagement:NoEligibleStudents') {
        setAssignmentBlocker(noEligibleStudents);
      } else if (problem.errorCode === 'Students:HouseManagement:AssignmentLimitExceeded') {
        setAssignmentBlocker(
          'This change exceeds 500 students. Use Selected students to assign a smaller group.'
        );
      } else {
        shikshaMitraToast.error({
          message:
            problem.errorCode === 'Students:HouseManagement:StalePreview'
              ? 'The roster or house membership changed. Preview the change again.'
              : problem.detail,
        });
      }
    } finally {
      if (version === requestVersion.current) {
        submitting.current = false;
        setBusy(false);
        setWriting(false);
      }
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
            title="Review the affected students and leadership changes before confirming."
            label="Membership change information"
            disabled={writing}
          />
          <IconButton aria-label="Close Change House Membership" disabled={writing} onClick={close}>
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <FormBusyRegion busy={busy} label={preview ? 'Saving changes…' : 'Preparing preview…'}>
            <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
              {assignmentBlocker && <Alert severity="info">{assignmentBlocker}</Alert>}
              <FormSectionCard
                title="Membership Change"
                icon={GlobalIcons.assigned}
                descriptionTooltip="Each change applies within one division. The preview shows the students affected."
              >
                {entireDivision ? (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {divisionLabel || 'Entire division'}
                    </Typography>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={includeAssigned} />}
                      label="Include students already assigned to a house"
                      disabled={Boolean(preview || busy)}
                      onChange={(_, checked) => {
                        setIncludeAssigned(checked);
                        setAssignmentBlocker('');
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {includeAssigned
                        ? 'Students in other houses will move to the destination house.'
                        : 'Only students without a house will be assigned.'}
                    </Typography>
                  </Stack>
                ) : (
                  <>
                    <Typography variant="body2">
                      Selected students: {enrollmentIds.length}.
                    </Typography>
                    <CustomSelect
                      label="Change"
                      value={mode}
                      options={[
                        { value: 'assign', label: 'Assign or move to a house' },
                        { value: 'remove', label: 'Remove from house' },
                      ]}
                      disabled={Boolean(preview || busy)}
                      onChange={(value) => setMode(value as typeof mode)}
                    />
                  </>
                )}
                {(entireDivision || mode === 'assign') && (
                  <ShakingTextField error={touched && !house}>
                    <HousePicker
                      academicMediumId={academicMediumId}
                      value={house}
                      onChange={(value) => {
                        setHouse(value);
                        setAssignmentBlocker('');
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
                  {entireDivision && preview.students.length === 0 && (
                    <Alert severity="info">{noEligibleStudents}</Alert>
                  )}
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
        </Scrollbar>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={writing}
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
              onClick={() => setReviewed(null)}
              startIcon={<Iconify icon={GlobalIcons.edit} />}
            >
              Revise
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={busy || (entireDivision && preview?.students.length === 0)}
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
