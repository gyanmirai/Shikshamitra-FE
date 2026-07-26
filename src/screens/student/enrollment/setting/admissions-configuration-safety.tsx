'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmConfigurationClonePreviewDto,
  AdmissionCrmConfigurationReferenceFamilyDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Search,
  ContentCopy,
  FactCheckOutlined,
  AccountTreeOutlined,
} from '@mui/icons-material';
import {
  Chip,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Dialog,
  Divider,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
} from '@mui/material';
import {
  AdmissionCrmConfigurationReferenceKind,
  useConfirmAdmissionCrmConfigurationCloneMutation,
  usePreviewAdmissionCrmConfigurationCloneMutation,
  usePreviewAdmissionCrmConfigurationImpactMutation,
  useLazyGetAdmissionCrmConfigurationReferencesQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

type AcademicYearOption = {
  id: string;
  name: string;
};

const referenceKindLabels: Record<AdmissionCrmConfigurationReferenceKind, string> = {
  [AdmissionCrmConfigurationReferenceKind.Stage]: 'Stage',
  [AdmissionCrmConfigurationReferenceKind.Round]: 'Admission round',
  [AdmissionCrmConfigurationReferenceKind.Exam]: 'Exam',
  [AdmissionCrmConfigurationReferenceKind.SeatPlan]: 'Seat plan',
  [AdmissionCrmConfigurationReferenceKind.Route]: 'Admission route',
};

const referenceKinds = Object.entries(referenceKindLabels).map(([value, label]) => ({
  value: Number(value) as AdmissionCrmConfigurationReferenceKind,
  label,
}));

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as {
      data?: { detail?: string; errorCode?: string; error?: { message?: string } };
    };
    return data?.detail || data?.error?.message || data?.errorCode || fallback;
  }
  return fallback;
};

function ReferenceFamilies({
  families,
  emptyMessage,
}: {
  families: AdmissionCrmConfigurationReferenceFamilyDto[];
  emptyMessage: string;
}) {
  if (!families.length) {
    return <Alert severity="success">{emptyMessage}</Alert>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Configuration reference families">
        <TableHead>
          <TableRow>
            <TableCell>Reference family</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell>Why it matters</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {families.map((family) => (
            <TableRow key={family.family}>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {family.family}
                  </Typography>
                  {family.sampleReferenceIds.length ? (
                    <Typography variant="caption" color="text.secondary">
                      Sample IDs: {family.sampleReferenceIds.join(', ')}
                    </Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell align="right">{family.referenceCount}</TableCell>
              <TableCell>{family.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function AdmissionsConfigurationSafety() {
  const { academicYearId } = useEnrollmentWorkspace();
  const academicYears = useSelector(
    (state: RootState) => state.globalState.academicYears || []
  ) as AcademicYearOption[];
  const [referenceKind, setReferenceKind] = useState(
    AdmissionCrmConfigurationReferenceKind.Stage
  );
  const [referenceCode, setReferenceCode] = useState('');
  const [sourceAcademicYearId, setSourceAcademicYearId] = useState('');
  const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
  const [clonePreview, setClonePreview] =
    useState<AdmissionCrmConfigurationClonePreviewDto | null>(null);
  const [cloneResultMessage, setCloneResultMessage] = useState('');
  const [getReferences, referencesQuery] = useLazyGetAdmissionCrmConfigurationReferencesQuery();
  const [previewImpact, impactState] = usePreviewAdmissionCrmConfigurationImpactMutation();
  const [previewClone, previewCloneState] = usePreviewAdmissionCrmConfigurationCloneMutation();
  const [confirmClone, confirmCloneState] = useConfirmAdmissionCrmConfigurationCloneMutation();

  const resetReferenceInspection = () => {
    referencesQuery.reset();
    impactState.reset();
  };

  useEffect(() => {
    if (!academicYearId) return;
    setSourceAcademicYearId((current) => current || academicYearId);
    setTargetAcademicYearId(
      (current) =>
        current ||
        academicYears.find((year) => year.id !== academicYearId)?.id ||
        ''
    );
  }, [academicYearId, academicYears]);

  const inspectReferences = async () => {
    if (!academicYearId || !referenceCode.trim()) return;
    try {
      await getReferences({
        academicYearId,
        kind: referenceKind,
        code: referenceCode.trim(),
      }).unwrap();
    } catch (error) {
      shikshaMitraToast.error({
        message: errorMessage(error, 'Unable to inspect configuration references.'),
      });
    }
  };

  const inspectImpact = async () => {
    if (!academicYearId || !referenceCode.trim()) return;
    try {
      await previewImpact({
        academicYearId,
        body: {
          kind: referenceKind,
          code: referenceCode.trim(),
        },
      }).unwrap();
    } catch (error) {
      shikshaMitraToast.error({
        message: errorMessage(error, 'Unable to preview the configuration impact.'),
      });
    }
  };

  const inspectClone = async () => {
    if (
      !sourceAcademicYearId ||
      !targetAcademicYearId ||
      sourceAcademicYearId === targetAcademicYearId
    ) {
      return;
    }
    setCloneResultMessage('');
    try {
      const preview = await previewClone({
        sourceAcademicYearId,
        targetAcademicYearId,
      }).unwrap();
      setClonePreview(preview);
    } catch (error) {
      shikshaMitraToast.error({
        message: errorMessage(error, 'Unable to preview the academic-year configuration copy.'),
      });
    }
  };

  const applyClone = async () => {
    if (!clonePreview?.canConfirm) return;
    try {
      const result = await confirmClone({
        sourceAcademicYearId: clonePreview.sourceAcademicYearId,
        targetAcademicYearId: clonePreview.targetAcademicYearId,
        previewFingerprint: clonePreview.fingerprint,
      }).unwrap();
      const message = result.alreadyApplied
        ? 'This exact configuration copy was already applied.'
        : 'Academic-year admission configuration copied as reviewed.';
      setClonePreview(null);
      setCloneResultMessage(message);
      shikshaMitraToast.success({ message });
    } catch (error) {
      shikshaMitraToast.error({
        message: errorMessage(
          error,
          'The configuration changed after preview. Preview it again before confirming.'
        ),
      });
    }
  };

  const references = referencesQuery.data;
  const impact = impactState.data;

  return (
    <Stack spacing={2} sx={{ py: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountTreeOutlined color="primary" />
            <div>
              <Typography variant="h6">View Configuration References</Typography>
              <Typography variant="body2" color="text.secondary">
                Find every applicant and configuration family that uses a stage, round, exam, seat
                plan, or admission-route code before changing it.
              </Typography>
            </div>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              select
              size="small"
              label="Configuration type"
              value={referenceKind}
              onChange={(event) => {
                resetReferenceInspection();
                setReferenceKind(
                  Number(event.target.value) as AdmissionCrmConfigurationReferenceKind
                );
              }}
              sx={{ minWidth: 190 }}
            >
              {referenceKinds.map((kind) => (
                <MenuItem key={kind.value} value={kind.value}>
                  {kind.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              label={`${referenceKindLabels[referenceKind]} code`}
              value={referenceCode}
              onChange={(event) => {
                resetReferenceInspection();
                setReferenceCode(event.target.value);
              }}
              helperText="Use the immutable code shown in the configuration record."
            />
            <LoadingButton
              variant="outlined"
              startIcon={<Search />}
              loading={referencesQuery.isFetching}
              disabled={!academicYearId || !referenceCode.trim()}
              onClick={inspectReferences}
            >
              View References
            </LoadingButton>
            <LoadingButton
              variant="contained"
              startIcon={<FactCheckOutlined />}
              loading={impactState.isLoading}
              disabled={!academicYearId || !referenceCode.trim()}
              onClick={inspectImpact}
            >
              Preview Impact
            </LoadingButton>
          </Stack>
          {references ? (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${references.totalReferenceCount} total references`} />
                <Chip label={`${references.families.length} reference families`} />
              </Stack>
              <ReferenceFamilies
                families={references.families}
                emptyMessage="No references were found for this code."
              />
            </>
          ) : null}
          {impact ? (
            <Stack spacing={1}>
              <Divider />
              <Typography variant="subtitle1">Impact Preview</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${impact.affectedApplicantCount} applicants`} color="warning" />
                <Chip label={`${impact.configurationReferenceCount} configuration references`} />
                <Chip label={`${impact.changedFields.length} changed cycle fields`} />
              </Stack>
              {impact.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
              <ReferenceFamilies
                families={impact.referenceFamilies}
                emptyMessage="No dependent configuration references were found."
              />
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ContentCopy color="primary" />
            <div>
              <Typography variant="h6">Copy Academic Year Configuration</Typography>
              <Typography variant="body2" color="text.secondary">
                Preview and copy the complete admissions setup into an empty academic year.
                Approval-controlled records are recreated as drafts, and hierarchy-bound items that
                cannot be copied are listed explicitly.
              </Typography>
            </div>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              select
              fullWidth
              size="small"
              label="Source academic year"
              value={sourceAcademicYearId}
              onChange={(event) => {
                setSourceAcademicYearId(event.target.value);
                setClonePreview(null);
              }}
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              size="small"
              label="Target academic year"
              value={targetAcademicYearId}
              onChange={(event) => {
                setTargetAcademicYearId(event.target.value);
                setClonePreview(null);
              }}
              error={
                Boolean(targetAcademicYearId) && targetAcademicYearId === sourceAcademicYearId
              }
              helperText={
                targetAcademicYearId === sourceAcademicYearId
                  ? 'Source and target academic years must be different.'
                  : 'The target must have no applicant activity or admissions configuration.'
              }
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </TextField>
            <LoadingButton
              variant="contained"
              loading={previewCloneState.isLoading}
              disabled={
                !sourceAcademicYearId ||
                !targetAcademicYearId ||
                sourceAcademicYearId === targetAcademicYearId
              }
              onClick={inspectClone}
            >
              Preview Copy
            </LoadingButton>
          </Stack>
          {cloneResultMessage ? <Alert severity="success">{cloneResultMessage}</Alert> : null}
        </Stack>
      </Paper>

      <Dialog
        open={Boolean(clonePreview)}
        onClose={() => setClonePreview(null)}
        fullWidth
        maxWidth="md"
        aria-labelledby="configuration-clone-preview-title"
      >
        <DialogTitle id="configuration-clone-preview-title">
          Review Academic Year Configuration Copy
        </DialogTitle>
        <DialogContent dividers>
          {clonePreview ? (
            <Stack spacing={1.5}>
              <Alert severity={clonePreview.canConfirm ? 'info' : 'error'}>
                {clonePreview.canConfirm
                  ? 'Review every family below. Confirm only if the target academic year is correct.'
                  : 'This copy cannot be confirmed until all conflicts are resolved.'}
              </Alert>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${clonePreview.targetApplicantActivityCount} target applicant records`}
                  color={clonePreview.targetApplicantActivityCount ? 'error' : 'success'}
                />
                <Chip label={`${clonePreview.families.length} configuration families`} />
              </Stack>
              {clonePreview.conflicts.map((conflict) => (
                <Alert key={conflict} severity="error">
                  {conflict}
                </Alert>
              ))}
              {clonePreview.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label="Academic year configuration clone preview">
                  <TableHead>
                    <TableRow>
                      <TableCell>Family</TableCell>
                      <TableCell align="right">Source</TableCell>
                      <TableCell align="right">Copyable</TableCell>
                      <TableCell align="right">Target</TableCell>
                      <TableCell>Copy behavior</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clonePreview.families.map((family) => (
                      <TableRow key={family.family}>
                        <TableCell>{family.family}</TableCell>
                        <TableCell align="right">{family.sourceCount}</TableCell>
                        <TableCell align="right">{family.cloneableCount}</TableCell>
                        <TableCell align="right">{family.targetCount}</TableCell>
                        <TableCell>{family.cloneBehavior}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClonePreview(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={confirmCloneState.isLoading}
            disabled={!clonePreview?.canConfirm}
            onClick={applyClone}
          >
            Confirm Configuration Copy
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
