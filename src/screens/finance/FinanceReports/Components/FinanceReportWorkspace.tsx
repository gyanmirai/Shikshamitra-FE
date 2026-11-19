'use client';

import type { FinanceReportOptions } from 'src/redux/finance/reports/financeReportsApi';

import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FinanceReportBuilder } from './FinanceReportBuilder';
import { reportDescriptions, getFinanceReportGroups } from '../finance-report-catalog';

type Props = {
  options: FinanceReportOptions;
  defaultYear?: string;
  onBack: () => void;
  onQueued: () => void;
};

export function FinanceReportWorkspace({ options, defaultYear, onBack, onQueued }: Props) {
  const groups = getFinanceReportGroups(options.reportTypes);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Generate report"
        description="Choose a report, configure its filters, and preview the selected records."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reports', onClick: onBack },
          { name: 'Generate report' },
        ]}
        isBack
        onBack={onBack}
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <CommonReport
          categories={groups}
          subCategories={groups.flatMap((group) =>
            group.reports.map((report) => ({
              id: report.id,
              name: report.label,
              categoryId: group.id,
              icon: 'mdi:file-document-outline',
              description: reportDescriptions[report.id],
              configurationHelp:
                reportDescriptions[report.id] ?? 'Choose the academic year and filters, then preview the records.',
              render: () => (
                <FinanceReportBuilder
                  key={report.id}
                  report={report}
                  options={options}
                  defaultYear={defaultYear}
                  onQueued={onQueued}
                />
              ),
            }))
          )}
        />
      </Box>
    </Box>
  );
}
