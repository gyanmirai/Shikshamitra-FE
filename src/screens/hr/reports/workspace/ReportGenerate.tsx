import type { ReportDataset, ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { Box, Chip, Alert, Stack, Button, Typography } from '@mui/material';
import { useCreateReportingRunMutation } from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportParameters } from './ReportParameters';
import {
  reportError,
  describeReportRules,
  defaultReportParameters,
} from '../reporting-workspace-utils';

export function ReportGenerate({
  template,
  dataset,
}: {
  template: ReportTemplate;
  dataset?: ReportDataset;
}) {
  const router = useRouter();
  const [parameters, setParameters] = useState(() =>
    defaultReportParameters(template.definition.defaultPeriod)
  );
  const [error, setError] = useState('');
  const [generate, { isLoading }] = useCreateReportingRunMutation();
  const submit = async () => {
    setError('');
    try {
      const run = await generate({
        templateId: template.id,
        revision: template.revision,
        parameters,
      }).unwrap();
      router.push(hrReportPaths.result(run.id));
    } catch (e) {
      setError(reportError(e));
    }
  };
  return (
    <Stack spacing={3} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{template.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {template.description}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={template.category} variant="outlined" />
          <Chip
            size="small"
            label={`${template.definition.columns.length} columns`}
            variant="outlined"
          />
          <Chip size="small" label={`Revision ${template.revision}`} variant="outlined" />
        </Stack>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <ReportParameters
          design={template.definition}
          fields={dataset?.fields}
          value={parameters}
          onChange={setParameters}
          disabled={isLoading}
        />
      </Box>
      {(template.definition.filters.conditions.length > 0 ||
        template.definition.filters.groups.length > 0) && (
        <Alert severity="info">
          Template rules: {describeReportRules(template.definition.filters, parameters, dataset)}.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary">
        Generation captures a fixed result. Changing this selection does not change the template.
        Results and downloads remain available for 7 days.
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          disabled={isLoading || template.publishedRevision === 0}
          onClick={submit}
        >
          {isLoading ? 'Generating…' : 'Generate report'}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={isLoading}
          onClick={() => router.push(hrReportPaths.library)}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
