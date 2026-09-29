'use client';

import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';

const DIMENSIONS = [
  'Admission type',
  'Class',
  'Category',
  'RTE status',
  'Transfer admission',
  'Scholarship',
  'Assessment outcome',
];

export function ApplicationExperienceDocumentRequirements() {
  const router = useRouter();
  const query = useGetAdmissionWorkflowsQuery({ skipCount: 0, maxResultCount: 100 });
  const workflows = query.data?.items ?? [];

  if (query.isLoading) {
    return <Skeleton variant="rounded" height={220} />;
  }

  return (
    <Stack spacing={1.5} sx={{ minHeight: 0, overflow: 'auto', pb: 1 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1">Conditional document rules</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Requirements stay attached to the Document verification stage so the same rules are
          enforced during the applicant journey.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose All classes or Selected classes for each document. To collect files with the
          application form, select that Form stage under When to collect documents. Those uploads
          remain pending until staff verify them in the document stage.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {DIMENSIONS.map((dimension) => (
            <Box
              key={dimension}
              sx={{ px: 1.25, py: 0.75, border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Typography variant="body2">{dimension}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {query.isError && (
        <Alert severity="error" action={<Button onClick={query.refetch}>Retry</Button>}>
          Document workflows could not be loaded.
        </Alert>
      )}

      {!query.isError && workflows.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="mdi:file-document-alert-outline" width={30} />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            No admission stage workflow yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create an admission stage workflow, add a Document verification stage, then configure its
            checklist here.
          </Typography>
          <Button
            size="small"
            variant="contained"
            sx={{ mt: 2, minHeight: { xs: 44, sm: 36 } }}
            onClick={() => router.push('/student/admissions/settings/workflows')}
          >
            Open Admission Stage
          </Button>
        </Paper>
      )}

      {workflows.map((workflow) => (
        <Paper
          key={workflow.id}
          variant="outlined"
          sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {workflow.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version {workflow.version} · Open its Document verification stage
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            sx={{ minHeight: { xs: 44, sm: 36 } }}
            endIcon={<Iconify icon="mdi:arrow-right" />}
            aria-label={`${workflow.status === 0 || workflow.status === 3 ? 'Configure' : 'View'} requirements for ${workflow.name}`}
            onClick={() => router.push(`/student/admissions/settings/workflows/${workflow.id}`)}
          >
            {workflow.status === 0 || workflow.status === 3
              ? 'Configure requirements'
              : 'View requirements'}
          </Button>
        </Paper>
      ))}
    </Stack>
  );
}
