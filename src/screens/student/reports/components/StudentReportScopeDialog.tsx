import type { RootState } from 'src/redux/store';
import type { RecordsReportJob } from 'src/redux/student/records/student-record-reports-api';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime, formatStr } from 'src/utils/format-time';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, Typography, DialogActions, LinearProgress } from '@mui/material';
import { useGetStudentRecordsDirectoryOptionsQuery } from 'src/redux/student/records/student-records-api';

import { studentReportTitle } from '../utils/compliance-report-model';

export default function StudentReportScopeDialog({
  job,
  onClose,
}: {
  job: RecordsReportJob;
  onClose: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canReadOptions = hasGrantedPermission(permissions, 'Students.Records.StudentList.View');
  const options = useGetStudentRecordsDirectoryOptionsQuery(
    { academicYearId: job.request.academicYearId },
    { skip: !canReadOptions }
  );
  const data = options.currentData;
  const name = (
    id: string | undefined,
    choices: { id: string; name: string }[] | undefined,
    all: string
  ) =>
    !id
      ? all
      : (choices?.find((choice) => choice.id === id)?.name ??
        'Unavailable in your current academic scope');
  const facts = [
    ['Report', studentReportTitle(job.reportType)],
    ['Created', fDateTime(job.creationTime, formatStr.split.dateTime)],
    ['Status', job.status],
    [
      'Academic year',
      name(job.request.academicYearId, data?.academicYears, 'All permitted academic years'),
    ],
    [
      'Board',
      name(
        job.request.boardId,
        data?.boards,
        job.reportType === 'GujaratCompliance'
          ? 'All permitted GSEB boards'
          : 'All permitted boards'
      ),
    ],
    ['Medium', name(job.request.mediumId, data?.mediums, 'All permitted mediums')],
    ['Class', name(job.request.standardId, data?.standards, 'All permitted classes')],
    ['Division', name(job.request.divisionId, data?.divisions, 'All permitted divisions')],
    ...(job.request.studentId ? [['Student filter', 'One selected student']] : []),
    ...(job.request.status ? [['Status filter', job.request.status]] : []),
  ];
  return (
    <CustomDialog
      open
      title="Report Request Scope"
      titleInfo="This is the scope saved with this generated report, independent of the current global year. Labels are resolved only within your current access."
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <FormSectionCard
          title="Saved Request"
          icon={GlobalIcons.report}
          descriptionTooltip="Generation and regeneration use this saved scope. Current policy and access are rechecked before creating or downloading a file."
        >
          {options.isFetching && <LinearProgress aria-label="Resolving report scope" />}
          {options.isError && (
            <Typography role="alert" variant="body2" color="error.main">
              Academic labels could not be loaded. Saved filters remain intact.
            </Typography>
          )}
          <Stack spacing={1}>
            {facts.map(([label, value]) => (
              <Stack key={label} spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
