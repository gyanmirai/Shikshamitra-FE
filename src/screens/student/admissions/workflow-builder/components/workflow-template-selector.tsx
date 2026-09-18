'use client';

import type { Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Radio,
  Stack,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { type WorkflowStarterId, ADMISSION_WORKFLOW_TEMPLATES } from '../../workflow-template';

type Props = {
  value: WorkflowStarterId;
  onChange: (value: WorkflowStarterId) => void;
  includeBlank?: boolean;
  columns?: 1 | 2;
};

const cardSx = (selected: boolean) => ({
  minWidth: 0,
  borderRadius: 2,
  borderColor: selected ? 'text.primary' : 'divider',
  bgcolor: selected ? 'action.selected' : 'background.paper',
  transition: (theme: Theme) => theme.transitions.create(['border-color', 'background-color']),
  '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
  '&:focus-within': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
});

export function WorkflowTemplateSelector({
  value,
  onChange,
  includeBlank = false,
  columns = 2,
}: Props) {
  return (
    <RadioGroup
      name="starterJourney"
      aria-label="Workflow starting point"
      value={value}
      onChange={(event) => onChange(event.target.value as WorkflowStarterId)}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns:
            columns === 1 ? '1fr' : { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {ADMISSION_WORKFLOW_TEMPLATES.map((template) => (
          <Card key={template.id} variant="outlined" sx={cardSx(value === template.id)}>
            <FormControlLabel
              value={template.id}
              control={<Radio size="small" sx={{ mt: 0.25 }} />}
              label={
                <Stack spacing={0.75} sx={{ py: 0.25 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        display: 'grid',
                        borderRadius: 1.5,
                        placeItems: 'center',
                        color: 'text.secondary',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Iconify icon={template.icon} width={20} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2">{template.name}</Typography>
                        {template.recommended && (
                          <Chip size="small" variant="outlined" label="Recommended" />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Best for: {template.bestFor}
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${template.stages.length} stages`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${Math.max(template.stages.length - 1, 0)} routes`}
                    />
                  </Stack>
                </Stack>
              }
              sx={{
                m: 0,
                p: 1.5,
                width: 1,
                height: 1,
                cursor: 'pointer',
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { width: 1 },
              }}
            />
          </Card>
        ))}

        {includeBlank && (
          <Card variant="outlined" sx={cardSx(value === 'empty')}>
            <FormControlLabel
              value="empty"
              control={<Radio size="small" sx={{ mt: 0.25 }} />}
              label={
                <Stack spacing={0.75} sx={{ py: 0.25 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        display: 'grid',
                        borderRadius: 1.5,
                        placeItems: 'center',
                        color: 'text.secondary',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Iconify icon="mdi:pencil-outline" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Blank workflow</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Start without stages and design every route yourself.
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Best for: schools with a fully custom process
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label="0 stages"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Stack>
              }
              sx={{
                m: 0,
                p: 1.5,
                width: 1,
                height: 1,
                cursor: 'pointer',
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { width: 1 },
              }}
            />
          </Card>
        )}
      </Box>
    </RadioGroup>
  );
}
