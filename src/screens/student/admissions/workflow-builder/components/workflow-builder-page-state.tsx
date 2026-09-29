import { Box } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from '../../admission-query-error';
import { WorkflowBuilderLoading } from './workflow-builder-loading';

type Props = {
  state: 'loading' | 'error';
  onRetry?: () => void;
};

export function WorkflowBuilderPageState({ state, onRetry = () => undefined }: Props) {
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <CustomBreadcrumbs
        heading="Admission Stage"
        description="Configure the stages and transitions for this admission journey."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Stage', href: studentPaths.enrollment.settings.workflows },
        ]}
      />
      {state === 'loading' ? (
        <WorkflowBuilderLoading />
      ) : (
        <AdmissionQueryError onRetry={onRetry} />
      )}
    </Box>
  );
}
