import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CommonReport from 'src/components/common-report';
import { EmptyContent } from 'src/components/empty-content';

import { ReportForm } from './report-form';

import type { ReportOptions, InstituteReportRequest } from '../types';

export function ReportChooser({
  options,
  onPreview,
}: {
  options: ReportOptions;
  onPreview: (request: InstituteReportRequest) => void;
}) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('lg'));
  const [selected, setSelected] = useState(options.reportTypes[0]?.id ?? '');
  const definition = options.reportTypes.find((item) => item.id === selected);
  if (options.reportTypes.length === 0)
    return (
      <EmptyContent
        title="No report datasets available"
        description="Your current source permissions do not include any Institute Setup report datasets."
        sx={{ p: 2 }}
      />
    );
  if (compact)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 1 }}>
        <CustomSelect
          label="Report type"
          size="small"
          value={selected}
          onChange={(value) => setSelected(String(value))}
          options={options.reportTypes.map((item) => ({ value: item.id, label: item.label }))}
        />
        {definition && (
          <ReportForm
            key={definition.id}
            definition={definition}
            options={options}
            onPreview={onPreview}
          />
        )}
      </Box>
    );
  return (
    <CommonReport
      categories={[{ id: 'setup', name: 'Institute Setup Reports', icon: 'mdi:chart-box-outline' }]}
      subCategories={options.reportTypes.map((report) => ({
        id: report.id,
        name: report.label,
        description: report.label,
        categoryId: 'setup',
        icon: '',
        render: () => (
          <ReportForm key={report.id} definition={report} options={options} onPreview={onPreview} />
        ),
      }))}
    />
  );
}
