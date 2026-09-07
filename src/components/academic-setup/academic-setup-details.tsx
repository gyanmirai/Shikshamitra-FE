import { EmptyContent } from 'src/components/empty-content';
import { Box, Grid, Paper, Typography } from '@mui/material';

import type {
  AcademicYearRecord,
  AcademicSetupNode,
  AcademicSetupNodeType,
} from './academic-setup-model';

import { NODE_TYPE_META } from './academic-setup-model';
import { AcademicSetupGuidance } from './academic-setup-guidance';
import { AcademicSetupChildCard } from './academic-setup-child-card';
import { AcademicSetupDetailsHeader } from './academic-setup-details-header';

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
        minHeight: { xs: 420, md: 0 },
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

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 2.5 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
              {isFinalLevel ? 'Division readiness' : meta.childLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {isFinalLevel
                ? 'This division is the final level of the academic hierarchy.'
                : `Open any ${meta.childLabel.toLowerCase().replace(/s$/, '')} to review its next level.`}
            </Typography>

            {children.length > 0 ? (
              <Grid container spacing={1.25}>
                {children.map((child) => (
                  <Grid key={child.id} size={{ xs: 12, sm: 6 }}>
                    <AcademicSetupChildCard node={child} onSelect={onSelectNode} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  minHeight: 220,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <EmptyContent
                  title={
                    isFinalLevel ? 'Division is ready' : `No ${meta.childLabel.toLowerCase()} yet`
                  }
                  description={
                    isFinalLevel
                      ? 'Use this division when assigning students, timetables, attendance, and exams.'
                      : `Choose ${meta.addLabel.toLowerCase()} above to continue this branch.`
                  }
                />
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AcademicSetupGuidance type={node.type} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
