'use client';

import type { Theme } from '@mui/material/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Radio,
  Stack,
  Button,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';

import {
  type WorkflowStarterId,
  ADMISSION_WORKFLOW_STARTERS,
  ADMISSION_WORKFLOW_TEMPLATES,
} from '../../workflow-template';

type Props = {
  value: WorkflowStarterId;
  onChange: (value: WorkflowStarterId) => void;
  includeBlank?: boolean;
  columns?: 1 | 2;
  onPreviewSelected?: () => void;
};

const cardSx = (selected: boolean) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 2,
  borderColor: 'divider',
  bgcolor: selected ? 'action.selected' : 'background.paper',
  transition: (theme: Theme) => theme.transitions.create(['border-color', 'background-color']),
  '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
  '&:focus-within': {
    outline: '2px solid',
    outlineColor: 'text.primary',
    outlineOffset: 2,
  },
});

export function WorkflowTemplateSelector({
  value,
  onChange,
  includeBlank = false,
  columns = 2,
  onPreviewSelected,
}: Props) {
  const templates = includeBlank ? ADMISSION_WORKFLOW_STARTERS : ADMISSION_WORKFLOW_TEMPLATES;

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
        {templates.map((template) => {
          const selected = value === template.id;

          return (
            <Card key={template.id} variant="outlined" sx={cardSx(selected)}>
              <FormControlLabel
                value={template.id}
                control={
                  <Radio
                    size="small"
                    icon={<Iconify icon="mdi:radiobox-blank" width={22} />}
                    checkedIcon={<Iconify icon="mdi:check-circle" width={22} />}
                    sx={{ mt: 0.25, '&.Mui-checked': { color: 'success.main' } }}
                  />
                }
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
                          {'recommended' in template && template.recommended && (
                            <Label color="success" variant="soft">
                              Recommended
                            </Label>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      </Box>
                    </Stack>
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
                  flex: 1,
                  cursor: 'pointer',
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': { width: 1 },
                }}
              />
              {selected && onPreviewSelected && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                  onClick={onPreviewSelected}
                  sx={{
                    minHeight: 44,
                    display: { xs: 'inline-flex', md: 'none' },
                    width: 'calc(100% - 24px)',
                    mx: 1.5,
                    mb: 1.5,
                  }}
                >
                  Preview
                </Button>
              )}
            </Card>
          );
        })}
      </Box>
    </RadioGroup>
  );
}
