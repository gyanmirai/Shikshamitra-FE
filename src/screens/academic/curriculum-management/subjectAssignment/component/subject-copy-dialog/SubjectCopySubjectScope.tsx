import { Box, Grid } from '@mui/material';

import { SubjectCopyChoiceCard } from './SubjectCopyChoiceCard';
import { SubjectCopySubjectPicker } from './SubjectCopySubjectPicker';
import { SubjectCopySectionHeading } from './SubjectCopySectionHeading';

import type { CopySelectionMode } from './types';
import type { useCopySubjects } from './useCopySubjects';

type Props = {
  selectionMode: CopySelectionMode;
  sourceClassSelected: boolean;
  subjects: ReturnType<typeof useCopySubjects>;
  onModeChange: (value: CopySelectionMode) => void;
};

export function SubjectCopySubjectScope(props: Props) {
  const { selectionMode, sourceClassSelected, subjects, onModeChange } = props;

  return (
    <Box component="section" aria-labelledby="copy-subjects-heading">
      <SubjectCopySectionHeading
        step={2}
        title="Choose subjects"
        description="Copy every subject, or select only the ones you need."
      />

      <Grid container spacing={1} sx={{ mt: 1.5 }} role="radiogroup" aria-label="Subjects to copy">
        <Grid size={{ xs: 12, sm: 6 }}>
          <SubjectCopyChoiceCard
            selected={selectionMode === 'ALL'}
            label="All subjects"
            description="Copy the complete subject setup from the source class."
            onSelect={() => onModeChange('ALL')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SubjectCopyChoiceCard
            selected={selectionMode === 'SPECIFIC'}
            label="Selected subjects"
            description="Choose individual subjects before reviewing the copy."
            onSelect={() => onModeChange('SPECIFIC')}
          />
        </Grid>
      </Grid>

      {selectionMode === 'SPECIFIC' && (
        <Box sx={{ mt: 1.5 }}>
          <SubjectCopySubjectPicker sourceClassSelected={sourceClassSelected} subjects={subjects} />
        </Box>
      )}
    </Box>
  );
}
