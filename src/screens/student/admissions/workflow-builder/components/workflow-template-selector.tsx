'use client';

import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';
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
  value: WorkflowStarterId | undefined;
  onChange: (value: WorkflowStarterId) => void;
  includeBlank?: boolean;
  columns?: 1 | 2;
  allowedIds?: readonly WorkflowStarterId[];
  showCounts?: boolean;
  onPreviewSelected?: () => void;
};

const cardSx = (selected: boolean) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 1.5,
  borderColor: 'divider',
  bgcolor: (theme: Theme) =>
    selected
      ? varAlpha(theme.vars.palette.success.mainChannel, 0.06)
      : theme.vars.palette.background.paper,
  transition: (theme: Theme) => theme.transitions.create(['border-color', 'background-color']),
  '&:hover': { borderColor: 'text.secondary' },
});

export function WorkflowTemplateSelector({
  value,
  onChange,
  includeBlank = false,
  columns = 2,
  allowedIds,
  showCounts = true,
  onPreviewSelected,
}: Props) {
  const templates = (
    includeBlank ? ADMISSION_WORKFLOW_STARTERS : ADMISSION_WORKFLOW_TEMPLATES
  ).filter((template) => !allowedIds || allowedIds.includes(template.id));

  return (
    <RadioGroup
      name="starterJourney"
      aria-label="Workflow starting point"
      value={value ?? ''}
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
                    sx={{ p: 0.75, '&.Mui-checked': { color: 'success.main' } }}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '36px minmax(0, 1fr)',
                        sm: columns === 1 ? '36px minmax(0, 1fr) auto' : '36px minmax(0, 1fr)',
                      },
                      gap: 1,
                      alignItems: 'center',
                      width: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,
                        height: 36,
                        display: 'grid',
                        borderRadius: '50%',
                        placeItems: 'center',
                        color: 'text.secondary',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Iconify icon={template.icon} width={20} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
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
                    {showCounts && (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{
                          gridColumn: { xs: '2 / -1', sm: columns === 1 ? 'auto' : '2 / -1' },
                        }}
                      >
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
                    )}
                  </Box>
                }
                sx={{
                  m: 0,
                  p: { xs: 1, sm: 1.25 },
                  width: 1,
                  flex: 1,
                  cursor: 'pointer',
                  alignItems: 'center',
                  '& .MuiFormControlLabel-label': { width: 1, minWidth: 0 },
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
