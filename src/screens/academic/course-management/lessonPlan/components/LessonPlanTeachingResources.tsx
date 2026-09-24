import type { Ref } from 'react';

import { Box, Stack } from '@mui/material';

import { LessonPlanTextInput } from './LessonPlanTextInput';
import { ChapterCompletionSlider } from './ChapterCompletionSlider';

type Props = {
  resourcesRequired: string;
  resourcesError?: string;
  resourcesInputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>;
  completion: {
    value: number;
    minimum: number;
    ready: boolean;
    loading: boolean;
    error?: string;
    retry: () => void;
  };
  disabled?: boolean;
  onResourcesChange: (value: string) => void;
  onCompletionChange: (value: number) => void;
};

export function LessonPlanTeachingResources({
  resourcesRequired,
  resourcesError,
  resourcesInputRef,
  completion,
  disabled,
  onResourcesChange,
  onCompletionChange,
}: Props) {
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          alignItems: 'stretch',
        }}
      >
        <ChapterCompletionSlider
          value={completion.value}
          minimum={completion.minimum}
          disabled={!completion.ready}
          loading={completion.loading}
          error={completion.error}
          onRetry={completion.retry}
          onChange={onCompletionChange}
        />

        <Box
          sx={{
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
          }}
        >
          <LessonPlanTextInput
            field="resourcesRequired"
            value={resourcesRequired}
            onChange={onResourcesChange}
            disabled={disabled}
            inputRef={resourcesInputRef}
            error={resourcesError}
          />
        </Box>
      </Box>
    </Stack>
  );
}
