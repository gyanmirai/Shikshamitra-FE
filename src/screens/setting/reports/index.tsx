'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, CircularProgress } from '@mui/material';

import { reportError } from './types';
import { InstituteAiDrawer } from './components/report-ai';
import { ReportHistory } from './components/report-history';
import { ReportChooser } from './components/report-chooser';
import { ReportPreviewDrawer } from './components/report-preview';
import { useReportWorkspace } from './hooks/use-report-workspace';

export default function InstituteReportsScreen() {
  const workspace = useReportWorkspace();
  const { mode, canAdd, canView, ready, options, preview, exporting } = workspace;
  return <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, flex: 1, minHeight: 0, minWidth: 0, gap: 1 }}>
    <CustomBreadcrumbs heading={mode === 'manual' ? 'Generate Report' : 'Reports'}
      description="Generate reports for academic setup, rooms, shifts, School Identity and School Documents."
      links={[{ name: 'Institute Setup', href: instituteSetupPaths.academicSetup }, { name: 'Reports' }]}
      isBack={mode === 'manual'} onBack={() => workspace.setMode('history')}
      action={canAdd && mode !== 'manual' && <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
        <Button size="small" variant="outlined" disabled={!options.data?.reportTypes.length} startIcon={<Iconify icon={GlobalIcons.addIcon} />} onClick={() => workspace.setMode('manual')}>Report</Button>
        <Button size="small" variant="contained" disabled={!options.data?.reportTypes.length} startIcon={<Iconify icon={GlobalIcons.generateReport} />} onClick={() => workspace.setMode('ai')}>Generate report using ShikshaMitra AI</Button>
      </Stack>} />
    {!ready ? <CircularProgress aria-label="Loading report permissions" /> : !canView ? <Alert severity="warning">You do not have permission to view Institute Setup reports.</Alert> : <>
      {options.isError && <Alert severity="error" action={<Button onClick={() => options.refetch()}>Retry</Button>}>{reportError(options.error)}</Alert>}
      {options.data?.reportTypes.length === 0 && canAdd && <Alert severity="info">No report datasets are available with your current source permissions. Contact an administrator to review access to the relevant Institute Setup modules.</Alert>}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {mode === 'manual' && canAdd ? options.isLoading ? <CircularProgress aria-label="Loading report catalogue" /> : options.data && <ReportChooser options={options.data} onPreview={workspace.setPreview} /> : <ReportHistory workspace={workspace} />}
      </Box>
      {preview && options.data?.reportTypes.some((definition) => definition.id === preview.reportType) && <ReportPreviewDrawer request={preview} onClose={() => workspace.setPreview(null)} onGenerate={workspace.generate} busy={exporting} canAdd={canAdd} />}
      {mode === 'ai' && canAdd && <InstituteAiDrawer permittedReportTypes={options.data?.reportTypes.map((definition) => definition.id) ?? []}
        onClose={() => workspace.setMode('history')} onQueued={workspace.onQueued} />}
    </>}
  </Box>;
}
