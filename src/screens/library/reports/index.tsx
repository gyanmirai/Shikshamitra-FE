'use client';

import React from 'react';
import { toast } from 'sonner';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Chip, Alert, Button, IconButton, CircularProgress } from '@mui/material';
import {
  useGetLibraryReportOptionsQuery,
  useGetLibraryReportExportsQuery,
  useLazyDownloadLibraryReportExportQuery,
} from 'src/redux/library/reports-api';

import BackendReportPanel from './components/BackendReportPanel';

const iconByCategory: Record<string, string> = {
  'Book & Inventory': 'mdi:book-multiple-outline',
  'Circulation & Usage': 'mdi:book-sync-outline',
  'Popular Books': 'mdi:star-outline',
  'Member Management': 'mdi:account-group-outline',
  Reservations: 'mdi:book-clock-outline',
  Financial: 'mdi:currency-inr-outline',
  Administrative: 'mdi:cog-outline',
};

const toCategoryId = (category: string) => category.replace(/\s+/g, '-');

const LibraryReportsScreen = () => {
  const openGenerateReport = useBoolean();
  const {
    data: reportOptions,
    isLoading: optionsLoading,
    isError: optionsError,
  } = useGetLibraryReportOptionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const {
    data: exportJobs,
    isLoading: exportsLoading,
    isError: exportsError,
  } = useGetLibraryReportExportsQuery(
    { skipCount: 0, maxResultCount: 20 },
    { refetchOnMountOrArgChange: true }
  );
  const [downloadExport, downloadState] = useLazyDownloadLibraryReportExportQuery();

  const allReportOptions = [
    ...(reportOptions?.reportTypes || []),
    ...(reportOptions?.comingSoonReportTypes || []),
  ];
  const categories = Array.from(
    new Set(allReportOptions.map((report) => report.category || 'Other'))
  ).map((category) => ({
    name: category,
    id: toCategoryId(category),
    icon: iconByCategory[category] || 'mdi:file-chart-outline',
  }));
  const subCategories = allReportOptions.map((report) => ({
    name: report.label,
    id: report.id,
    icon: '',
    description: report.isComingSoon
      ? 'Coming soon'
      : `Generate, preview, and export ${report.label}.`,
    categoryId: toCategoryId(report.category || 'Other'),
    isComingSoon: report.isComingSoon,
    render: () => (
      <BackendReportPanel
        report={{
          id: report.id,
          name: report.label,
          description: report.isComingSoon
            ? 'This report requires a future Library domain workflow.'
            : `Generate, preview, and export ${report.label}.`,
          isComingSoon: report.isComingSoon,
        }}
        options={reportOptions}
      />
    ),
  }));

  const rows = exportJobs?.items || exportJobs || [];

  const handleDownload = async (jobId: string) => {
    try {
      const result = await downloadExport({ jobId }).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      toast.error(parsed.detail || 'Download failed.');
    }
  };

  return (
    <Box
      data-testid="library-reports-page"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and filter library reports by book, member, circulation, and other criteria."
        links={[{ name: 'Library', href: '/library/dashboard/' }, { name: 'Reports' }]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Button
            data-testid="library-reports-generate-button"
            variant="contained"
            size="small"
            onClick={openGenerateReport.onTrue}
            startIcon={<Iconify icon={GlobalIcons.report} />}
          >
            Generate Report
          </Button>
        }
      />
      {openGenerateReport.value ? (
        <>
          {optionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Could not load Library report options.
            </Alert>
          )}
          <CommonReport
            categories={categories}
            subCategories={subCategories}
            isLoading={optionsLoading}
            emptyText="No Library reports are available yet."
          />
        </>
      ) : (
        <>
          {exportsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Could not load recent Library report exports.
            </Alert>
          )}
          <CustomizableTable
            tableId="library-reports"
            isLoading={exportsLoading}
            columns={[
              {
                label: 'Report',
                id: 'reportType',
                minWidth: '15vw',
                align: 'left',
                sticky: true,
              },
              { label: 'Format', id: 'format', minWidth: '8vw', align: 'left' },
              {
                label: 'Status',
                id: 'status',
                minWidth: '10vw',
                align: 'left',
                render(value) {
                  return <Chip size="small" variant="soft" label={value || 'Queued'} />;
                },
              },
              {
                label: 'Rows',
                id: 'rowCount',
                minWidth: '8vw',
                align: 'left',
                render(value) {
                  return value ?? '-';
                },
              },
              {
                label: 'Generated At',
                id: 'creationTime',
                minWidth: '13vw',
                align: 'left',
                render(value) {
                  return value ? new Date(value).toLocaleString() : '-';
                },
              },
              {
                label: 'Applied Filters',
                id: 'requestSnapshot',
                render(value) {
                  const filters = value?.filters || {};
                  const chips = Object.entries(filters).filter(([, filterValue]) => {
                    if (Array.isArray(filterValue)) return filterValue.length > 0;
                    return filterValue !== undefined && filterValue !== null && filterValue !== '';
                  });
                  return (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {chips.length === 0 ? (
                        <Chip size="small" variant="soft" label="No filters" />
                      ) : (
                        chips.map(([name, filterValue]) => (
                          <Chip
                            size="small"
                            variant="soft"
                            key={name}
                            label={`${name}: ${
                              Array.isArray(filterValue) ? filterValue.join(', ') : filterValue
                            }`}
                          />
                        ))
                      )}
                    </Box>
                  );
                },
              },
              {
                label: 'Action',
                id: 'reportAction',
                minWidth: '5vw',
                align: 'left',
                isFilter: false,
                isSort: false,
                sticky: true,
                render(value, row) {
                  const isReady = String(row.status || '').toLowerCase() === 'completed';
                  return (
                    <IconButton
                      size="small"
                      disabled={!isReady || downloadState.isFetching}
                      onClick={() => handleDownload(row.id)}
                    >
                      {downloadState.isFetching ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Iconify icon={GlobalIcons.download} />
                      )}
                    </IconButton>
                  );
                },
              },
            ]}
            data={rows}
          />
        </>
      )}
    </Box>
  );
};

export default LibraryReportsScreen;
