
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AcademicDesignNotes } from './academic-design-notes';
import { getAcademicInsightsRoleLabel } from '../insights/academic-insights-model';

import type { useAcademicInsights } from '../insights/use-academic-insights';

export function AcademicDesignHeader({ query, refresh }: { query: ReturnType<typeof useAcademicInsights>; refresh: () => void }) {
  const { data } = query;
  return <Stack spacing={0.5}>
    <CustomBreadcrumbs heading="Academic Dashboard" layout="inline"
      description="Academic insights and permitted workflows for your assigned responsibilities."
      links={[{ name: 'Academics' }, { name: 'Dashboard' }]}
      slotProps={{ action: { maxWidth: 1, width: { xs: 1, md: 'auto' } }, heading: {}, moreLink: {}, breadcrumbs: {} }}
      action={<Stack direction="row" alignItems="center" justifyContent="space-between" useFlexGap flexWrap="wrap" gap={1}>
        <AcademicDesignNotes />
        <Button size="small" variant="outlined" startIcon={<Iconify icon={GlobalIcons.refresh} />}
        disabled={!query.hasContext || !query.authorized || query.isFetching} onClick={refresh}>
        {query.isFetching ? 'Refreshing' : 'Refresh'}
      </Button></Stack>} />
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={0.5} sx={{ px: 1 }}>
      <Typography variant="caption" color="text.secondary">{data ? `${getAcademicInsightsRoleLabel(data.role)} · ${data.scopeLabel}` : query.contextLabel}</Typography>
      {data && <Typography variant="caption" color="text.secondary">Updated {new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
      }).format(new Date(data.generatedAt))} IST</Typography>}
    </Stack>
    {data && (data.students?.length ?? 0) > 1 && <Box sx={{ maxWidth: 360 }}>
      <CustomSelect label="Student" size="small" value={query.studentId} options={data.students ?? []}
        labelKey="label" valueKey="id" onChange={(value) => query.selectStudent(String(value))} />
    </Box>}
    {query.studentId && <Box><Button size="small" onClick={() => query.selectStudent('')}>Choose another student</Button></Box>}
  </Stack>;
}
