import { Box, Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

import { SubjectCopyChoiceCard } from './SubjectCopyChoiceCard';
import { SubjectCopySubjectPicker } from './SubjectCopySubjectPicker';

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
    <FormSectionCard
      icon={GlobalIcons.notebook}
      title="Choose Subjects"
      descriptionTooltip="Copy every subject, or select only the ones you need."
    >
      <Grid container spacing={2} role="radiogroup" aria-label="Subjects to copy">
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
        <Box>
          <SubjectCopySubjectPicker sourceClassSelected={sourceClassSelected} subjects={subjects} />
        </Box>
      )}
    </FormSectionCard>
  );
}
