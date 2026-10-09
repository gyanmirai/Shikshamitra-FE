import { EmptyContent } from 'src/components/empty-content';
import { Box, Grid, Paper, Typography } from '@mui/material';

import { NODE_TYPE_META } from './academic-setup-model';
import { AcademicSetupChildCard } from './academic-setup-child-card';
import { AcademicSetupDetailsHeader } from './academic-setup-details-header';

import type {
  AcademicSetupNode,
  AcademicYearRecord,
  AcademicSetupNodeType,
} from './academic-setup-model';

type AcademicSetupDetailsProps = {
  node: AcademicSetupNode;
  currentYear: AcademicYearRecord;
  onSelectNode: (node: AcademicSetupNode) => void;
  onSelectCrumb: (id: string, type: AcademicSetupNodeType, name: string) => void;
};

export const AcademicSetupDetails = ({
  node,
  currentYear,
  onSelectNode,
  onSelectCrumb,
}: AcademicSetupDetailsProps) => {
  const meta = NODE_TYPE_META[node.type];
  const children = node.children ?? [];
  const isFinalLevel = node.type === 'Division';

  return (
    <Paper
      component="section"
      aria-label={`${meta.label} details`}
      variant="outlined"
      sx={{
        height: { xs: 'auto', md: '100%' },
        minHeight: 0,
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AcademicSetupDetailsHeader
        node={node}
        currentYear={currentYear}
        onSelectCrumb={onSelectCrumb}
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {node.type !== 'Academic Year' && !isFinalLevel && (
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {meta.childLabel}
          </Typography>
        )}

        {children.length > 0 ? (
          <Grid container spacing={1}>
            {children.map((child) => (
              <Grid key={child.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                <AcademicSetupChildCard node={child} onSelect={onSelectNode} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              minHeight: 160,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <EmptyContent
              title={isFinalLevel ? 'Division is ready' : `No ${meta.childLabel.toLowerCase()} yet`}
              description={
                isFinalLevel
                  ? 'Use this division when assigning students, timetables, attendance, and exams.'
                  : `Choose ${meta.addLabel.toLowerCase()} above to continue this branch.`
              }
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};
