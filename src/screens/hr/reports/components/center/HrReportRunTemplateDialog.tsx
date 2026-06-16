import type { HrReportFormat, HrReportTemplate } from 'src/redux/hr/hrReportsApi';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import {
  Stack,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  ToggleButton,
  DialogActions,
  DialogContent,
  ToggleButtonGroup,
} from '@mui/material';

import { getHrReportTemplateRunSummary } from '../../hr-report-center-utils';

type HrReportRunTemplateDialogProps = {
  open: boolean;
  template: HrReportTemplate | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (format: HrReportFormat) => Promise<void>;
};

export function HrReportRunTemplateDialog({
  open,
  template,
  isSubmitting,
  onClose,
  onSubmit,
}: HrReportRunTemplateDialogProps) {
  const [format, setFormat] = useState<HrReportFormat>('excel');
  const [isQueueing, setIsQueueing] = useState(false);
  const isBusy = isSubmitting || isQueueing;
  const summary = useMemo(
    () => (template ? getHrReportTemplateRunSummary(template) : null),
    [template]
  );

  useEffect(() => {
    if (open) {
      setFormat('excel');
      setIsQueueing(false);
    }
  }, [open, template?.id]);

  if (!template || !summary) {
    return null;
  }

  const handleClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (isBusy) {
      return;
    }

    setIsQueueing(true);
    try {
      await onSubmit(format);
    } finally {
      setIsQueueing(false);
    }
  };

  const summaryRows = [
    { id: 'source', label: 'Source', value: summary.dataSource },
    { id: 'category', label: 'Category', value: summary.category },
    {
      id: 'columns',
      label: 'Columns',
      value: summary.columnCount > 0 ? `${summary.columnCount} selected` : 'Default columns',
    },
    {
      id: 'filters',
      label: 'Filters',
      value: summary.filterCount > 0 ? `${summary.filterCount}` : 'None',
    },
    {
      id: 'groups',
      label: 'Groups',
      value: summary.groupCount > 0 ? `${summary.groupCount}` : 'None',
    },
    {
      id: 'summaries',
      label: 'Summaries',
      value: summary.summaryCount > 0 ? `${summary.summaryCount}` : 'None',
    },
  ];

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      aria-labelledby="hr-report-run-template-dialog-title"
    >
      <DialogTitle id="hr-report-run-template-dialog-title">Run report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{template.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Queue an export from this saved template.
            </Typography>
          </Stack>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={format}
            aria-label="Export format"
            onChange={(_event, value: HrReportFormat | null) => {
              if (value) {
                setFormat(value);
              }
            }}
          >
            <ToggleButton value="excel" aria-label="Excel">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon={GlobalIcons.excel} />
                <span>Excel</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="pdf" aria-label="PDF">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon={GlobalIcons.pdf} />
                <span>PDF</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider />

          <Stack spacing={1}>
            {summaryRows.map((row) => (
              <Stack
                key={row.id}
                direction="row"
                spacing={2}
                justifyContent="space-between"
                data-testid={`hr-report-run-template-summary-${row.id}`}
              >
                <Typography variant="body2" color="text.secondary">
                  {row.label}
                </Typography>
                <Typography variant="body2" textAlign="right">
                  {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isBusy}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          data-testid="hr-report-run-template-submit-button"
          size="small"
          variant="contained"
          disabled={isBusy}
          startIcon={<Iconify icon={format === 'pdf' ? GlobalIcons.pdf : GlobalIcons.excel} />}
          onClick={handleSubmit}
        >
          Queue Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
