import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, Collapse, IconButton, LinearProgress } from '@mui/material';

import { isHrReportExportActive } from '../../hr-report-utils';

type HrReportActiveExportBannerProps = {
  exportJobs: HrReportExportJob[];
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function HrReportActiveExportBanner({
  exportJobs,
  isRefreshing,
  onRefresh,
}: HrReportActiveExportBannerProps) {
  const [isCollapsed, setCollapsed] = useState(false);
  const activeCount = useMemo(() => exportJobs.filter(isHrReportExportActive).length, [exportJobs]);

  if (activeCount === 0) return null;

  const label = `${activeCount} ${activeCount === 1 ? 'export is' : 'exports are'} preparing`;

  return (
    <Alert
      data-testid="hr-report-active-export-banner"
      severity="info"
      variant="outlined"
      icon={<Iconify icon="solar:clock-circle-bold" />}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="Refresh exports"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <Iconify icon="solar:refresh-bold" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={isCollapsed ? 'Expand export banner' : 'Collapse export banner'}
            onClick={() => setCollapsed((current) => !current)}
          >
            <Iconify icon={isCollapsed ? 'solar:alt-arrow-down-bold' : 'solar:alt-arrow-up-bold'} />
          </IconButton>
        </Stack>
      }
      sx={{ alignItems: 'center' }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <strong>{label}</strong>
          <Button size="small" variant="text" disabled={isRefreshing} onClick={onRefresh}>
            Refresh
          </Button>
        </Stack>
        <Collapse in={!isCollapsed}>
          <Stack spacing={1}>
            <LinearProgress />
          </Stack>
        </Collapse>
      </Stack>
    </Alert>
  );
}
