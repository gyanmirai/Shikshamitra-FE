'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceReports from '../index';
import { FinanceAiReportDrawer } from './FinanceAiReportDrawer';

type QueuedReport = {
  jobId: string;
  reportName: string;
  generatedDate: string;
  status: string;
};

const columns: IColumn[] = [
  { label: 'Report', id: 'reportName', minWidth: 220, align: 'left', filterType: 'string' },
  { label: 'Requested at', id: 'generatedDate', minWidth: 170, align: 'left', filterType: 'dateTime' },
  {
    label: 'Status', id: 'status', minWidth: 110, align: 'center', filterType: 'enum', sticky: true,
    render: (value) => <Chip size="small" color="info" variant="soft" label={String(value)} />,
  },
  { label: 'Job reference', id: 'jobId', minWidth: 280, align: 'left', filterType: 'string' },
];

const FinanceReportsList = () => {
  const addReportDialog = useBoolean(false);
  const aiReportDrawer = useBoolean(false);
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([]);

  const handleExportQueued = (jobId: string) => {
    setQueuedReports((current) => [{
      jobId,
      reportName: 'AI-generated Finance report',
      generatedDate: new Date().toISOString(),
      status: 'Queued',
    }, ...current]);
    shikshaMitraToast.success({ message: 'Finance report export queued successfully.' });
  };

  if (addReportDialog.value) return <FinanceReports addReportDialog={addReportDialog} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Build permission-scoped finance reports manually or describe the outcome to ShikshaMitra AI."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Reports' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="soft" startIcon={<Iconify icon="solar:magic-stick-3-bold" />} onClick={aiReportDrawer.onTrue}>
              Generate with AI
            </Button>
            <Button size="small" variant="contained" startIcon={<Add />} onClick={addReportDialog.onTrue}>
              Build manually
            </Button>
          </Stack>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="finance-report-export-requests"
          columns={columns}
          data={queuedReports}
          isPagination
          isSearch
          isFilter
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText={
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">No report requested in this session</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate with AI or use the manual builder to create a report.
              </Typography>
            </Box>
          }
        />
      </Box>

      <FinanceAiReportDrawer
        open={aiReportDrawer.value}
        onClose={aiReportDrawer.onFalse}
        onExportQueued={handleExportQueued}
      />
    </Box>
  );
};

export default FinanceReportsList;
