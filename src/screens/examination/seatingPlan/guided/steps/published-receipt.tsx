import Link from 'next/link';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { academicPaths } from 'src/constants/academic-menu';
import {
  useLazyDownloadSeatingPrintPdfQuery,
  useLazyDownloadSeatingPrintExcelQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { formatPlanSchedules } from '../workflow-utils';

import type { GuidedStepProps } from '../types';

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function PublishedReceipt({ workspace, workflow }: GuidedStepProps) {
  const publishedWorkspace = workflow.publication ?? workspace;
  const {plans} = publishedWorkspace;
  const {readiness} = workflow;
  const [downloadPdf] = useLazyDownloadSeatingPrintPdfQuery();
  const [downloadExcel] = useLazyDownloadSeatingPrintExcelQuery();
  const [downloading, setDownloading] = useState('');

  const download = async (planId: string, planName: string, format: 'pdf' | 'xlsx') => {
    const key = `${planId}-${format}`;
    setDownloading(key);
    try {
      const trigger = format === 'pdf' ? downloadPdf : downloadExcel;
      const blob = await trigger({ examId: workspace.examId, seatingPlanId: planId }).unwrap();
      triggerBlobDownload(blob as Blob, `${workspace.examName}-${planName}.${format}`);
      shikshaMitraToast.success({
        message: `${format === 'pdf' ? 'PDF' : 'Excel'} seating plan downloaded.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to download this seating plan. Please try again.' });
    } finally {
      setDownloading('');
    }
  };

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, maxWidth: 920 }}>
      <Alert severity="success">
        <Typography variant="subtitle1">Complete examination seating published</Typography>
        All {readiness.totalPlanCount} plan{readiness.totalPlanCount === 1 ? '' : 's'} and{' '}
        {readiness.totalSubjectCount} subject{readiness.totalSubjectCount === 1 ? '' : 's'} were
        approved and locked together.
      </Alert>

      <Stack spacing={0.75}>
        <Typography variant="h5">Publication receipt</Typography>
        <ReceiptRow label="Examination" value={workspace.examName} />
        <ReceiptRow label="Standard" value={workspace.standardName} />
        <ReceiptRow label="Plans" value={String(readiness.totalPlanCount)} />
        <ReceiptRow label="Subjects" value={String(readiness.totalSubjectCount)} />
        <ReceiptRow
          label="Published at"
          value={fDateTime(readiness.publishedAt) ?? 'Recorded by the server'}
        />
        <ReceiptRow label="Publication version" value={readiness.publicationVersion ?? '—'} />
      </Stack>

      <Stack spacing={1.25}>
        <Typography variant="h6">Published plans</Typography>
        {plans.map((plan) => (
          <Stack
            key={plan.seatingPlanId}
            spacing={1}
            sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <Stack spacing={0.25}>
              <Typography variant="subtitle1">{plan.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.subjects.map((subject) => subject.subjectName).join(', ')} ·{' '}
                {formatPlanSchedules(plan.subjects)}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <LoadingButton
                variant="outlined"
                loading={downloading === `${plan.seatingPlanId}-pdf`}
                startIcon={<Iconify icon="mdi:file-pdf-box" />}
                onClick={() => download(plan.seatingPlanId, plan.name, 'pdf')}
              >
                Download PDF
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                loading={downloading === `${plan.seatingPlanId}-xlsx`}
                startIcon={<Iconify icon="mdi:microsoft-excel" />}
                onClick={() => download(plan.seatingPlanId, plan.name, 'xlsx')}
              >
                Download Excel
              </LoadingButton>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Button component={Link} href={academicPaths.examination.seatAllocation} variant="contained">
        Back to seating plans
      </Button>
    </Stack>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 150, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}
