'use client';

import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetHrReportExportsQuery,
  useGetHrReportSourcesQuery,
  useGetHrReportTemplatesQuery,
  useDownloadHrReportExportMutation,
} from 'src/redux/hr/hrReportsApi';

import { isHrReportExportActive } from './hr-report-utils';
import { HrReportCatalog } from './components/HrReportCatalog';
import { HrReportsLandingTable } from './components/HrReportsLandingTable';

const ReportsScreen = () => {
  const openGenerateReport = useBoolean();
  const { data: sourcesData, isLoading: isLoadingSources } = useGetHrReportSourcesQuery();
  const { data: templatesData, isFetching: isFetchingTemplates } = useGetHrReportTemplatesQuery();
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();

  const {
    data: exportJobs = [],
    refetch: refetchExports,
    isFetching: isFetchingExports,
  } = useGetHrReportExportsQuery(undefined, { pollingInterval: 5000 });

  const sources = useMemo(() => sourcesData?.sources ?? [], [sourcesData?.sources]);
  const templates = useMemo(() => templatesData?.items ?? [], [templatesData?.items]);
  const hasActiveExports = useMemo(() => exportJobs.some(isHrReportExportActive), [exportJobs]);

  const handleDownload = useCallback(
    async (jobId: string, fileName?: string) => {
      const blob = await downloadExport(jobId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'hr-report';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [downloadExport]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={openGenerateReport.value ? 'Generate Report' : 'Reports'}
        description={
          openGenerateReport.value
            ? 'Configure, preview, save, publish, and export HR reports.'
            : 'Generate and view HR reports across employee, payroll, attendance, leave, policy, and performance data.'
        }
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports' }]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          !openGenerateReport.value ? (
            <Button
              variant="contained"
              size="small"
              onClick={openGenerateReport.onTrue}
              startIcon={<Iconify icon={GlobalIcons.report} />}
            >
              Generate Report
            </Button>
          ) : null
        }
        sx={{ px: 2 }}
      />

      <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
        {openGenerateReport.value ? (
          <HrReportCatalog
            sources={sources}
            templates={templates}
            exportJobs={exportJobs}
            isLoadingSources={isLoadingSources}
            isFetchingExports={isFetchingExports && hasActiveExports}
            refetchExports={refetchExports}
          />
        ) : (
          <HrReportsLandingTable
            templates={templates}
            exportJobs={exportJobs}
            isLoading={isFetchingExports || isFetchingTemplates}
            isDownloading={isDownloading}
            onGenerateReport={openGenerateReport.onTrue}
            onDownload={handleDownload}
          />
        )}
      </Box>
    </Box>
  );
};

export default ReportsScreen;
