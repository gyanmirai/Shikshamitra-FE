import { useState } from 'react';
import { Box, Chip, Button } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

interface SubjectUsageLabelsSectionProps {
  icon: string;
  title: string;
  description: string;
  labels: string[];
}

export function SubjectUsageLabelsSection({
  icon,
  title,
  description,
  labels,
}: SubjectUsageLabelsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleLabels = showAll ? labels : labels.slice(0, 6);
  const hiddenCount = labels.length - visibleLabels.length;

  if (!labels.length) return null;

  return (
    <FormSectionCard icon={icon} title={`${title} (${labels.length})`} description={description}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {visibleLabels.map((label) => (
          <Chip key={label} size="small" label={label} variant="outlined" />
        ))}
        {!showAll && hiddenCount > 0 && (
          <Button size="small" variant="text" color="inherit" onClick={() => setShowAll(true)}>
            +{hiddenCount} more
          </Button>
        )}
        {showAll && labels.length > 6 && (
          <Button size="small" variant="text" color="inherit" onClick={() => setShowAll(false)}>
            Show less
          </Button>
        )}
      </Box>
    </FormSectionCard>
  );
}
