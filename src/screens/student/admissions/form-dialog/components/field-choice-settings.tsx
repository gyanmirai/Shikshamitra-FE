import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';
import { StudentFeedback } from 'src/components/student-feedback';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import {
  createAdmissionChoiceValue,
  appendPastedAdmissionChoices,
  type EditableAdmissionChoice,
  parseEditableAdmissionChoices,
  serializeEditableAdmissionChoices,
} from '../field-choice-options';

import type { FieldSettingsProps } from '../types/field-settings';

type OptionsSource = { source: string; parentField?: string };

function parseOptionsSource(value?: string | null): OptionsSource | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as OptionsSource;
    return parsed && typeof parsed === 'object' && typeof parsed.source === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function FieldChoiceSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pastedChoices, setPastedChoices] = useState('');
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const sourceConfig = parseOptionsSource(field.optionsJson);
  const parsedChoices = sourceConfig
    ? { choices: [] as EditableAdmissionChoice[] }
    : parseEditableAdmissionChoices(field.optionsJson);
  const updateChoices = (choices: EditableAdmissionChoice[]) =>
    formik.setFieldValue(`${path}.optionsJson`, serializeEditableAdmissionChoices(choices));
  const addChoice = () => {
    const label = `Option ${parsedChoices.choices.length + 1}`;
    updateChoices([
      ...parsedChoices.choices,
      {
        value: createAdmissionChoiceValue(
          label,
          parsedChoices.choices.map((choice) => choice.value)
        ),
        label,
      },
    ]);
  };
  const changeChoiceLabel = (index: number, label: string) =>
    updateChoices(
      parsedChoices.choices.map((choice, choiceIndex) =>
        choiceIndex === index ? { ...choice, label } : choice
      )
    );
  const removeChoice = (index: number) =>
    updateChoices(parsedChoices.choices.filter((_, choiceIndex) => choiceIndex !== index));
  const moveChoice = (index: number, offset: number) => {
    const destination = index + offset;
    if (destination < 0 || destination >= parsedChoices.choices.length) return;
    const choices = [...parsedChoices.choices];
    [choices[index], choices[destination]] = [choices[destination], choices[index]];
    updateChoices(choices);
  };
  const addPastedChoices = () => {
    const choices = appendPastedAdmissionChoices(parsedChoices.choices, pastedChoices);
    if (choices.length === parsedChoices.choices.length) return;
    updateChoices(choices);
    setPastedChoices('');
    setPasteOpen(false);
  };

  // Linked Student lookups keep their existing source; choice editing is manual-only.
  if (sourceConfig?.source && field.bindingType === 0) return null;

  return (
    <SectionCard
      title="Answer options"
      paperProps={{ sx: { mb: 0, minWidth: 0 } }}
      gridProps={{ sx: { display: 'block' } }}
    >
      <Stack spacing={1.5}>
        {sourceConfig?.source && (
          <>
            <Typography variant="body2" color="text.secondary">
              This field uses previously configured automatic choices. Switching to your own options
              replaces that configuration.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => formik.setFieldValue(`${path}.optionsJson`, undefined)}
            >
              Enter my own options
            </Button>
          </>
        )}

        {!sourceConfig?.source && parsedChoices.error && (
          <>
            <StudentFeedback notificationKey="STU-0359" presentation="inline" severity="warning">
              {parsedChoices.error}
            </StudentFeedback>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Compatibility value"
              value={field.optionsJson ?? ''}
              helperText="This technical value is shown only because the saved choices need repair."
              onChange={(event) =>
                formik.setFieldValue(`${path}.optionsJson`, event.target.value || undefined)
              }
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => formik.setFieldValue(`${path}.optionsJson`, undefined)}
            >
              Replace with new choices
            </Button>
          </>
        )}

        {!sourceConfig?.source && !parsedChoices.error && (
          <Stack spacing={1}>
            {parsedChoices.choices.map((choice, index) => (
              <Stack
                key={`${choice.value}-${index}`}
                direction="row"
                spacing={0.5}
                alignItems="flex-start"
              >
                <TextField
                  fullWidth
                  size="small"
                  label={`Option ${index + 1}`}
                  value={choice.label}
                  error={!choice.label.trim()}
                  helperText={!choice.label.trim() ? 'Enter an option name.' : undefined}
                  onChange={(event) => changeChoiceLabel(index, event.target.value)}
                />
                <CustomTooltip title="Move option up">
                  <span>
                    <IconButton
                      aria-label={`Move ${choice.label || `option ${index + 1}`} up`}
                      disabled={index === 0}
                      onClick={() => moveChoice(index, -1)}
                    >
                      <Iconify icon="mdi:arrow-up" />
                    </IconButton>
                  </span>
                </CustomTooltip>
                <CustomTooltip title="Move option down">
                  <span>
                    <IconButton
                      aria-label={`Move ${choice.label || `option ${index + 1}`} down`}
                      disabled={index === parsedChoices.choices.length - 1}
                      onClick={() => moveChoice(index, 1)}
                    >
                      <Iconify icon="mdi:arrow-down" />
                    </IconButton>
                  </span>
                </CustomTooltip>
                <CustomTooltip title="Delete option">
                  <IconButton
                    aria-label={`Delete ${choice.label || `option ${index + 1}`}`}
                    onClick={() => removeChoice(index)}
                  >
                    <Iconify icon="mdi:delete-outline" />
                  </IconButton>
                </CustomTooltip>
              </Stack>
            ))}

            {!parsedChoices.choices.length && (
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  border: 1,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">No choices added yet</Typography>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={addChoice}
              >
                Add choice
              </Button>
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:content-paste" />}
                onClick={() => setPasteOpen((value) => !value)}
              >
                Paste choices
              </Button>
            </Stack>

            <Collapse in={pasteOpen}>
              <Stack spacing={1} sx={{ pt: 0.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  label="Paste choices"
                  value={pastedChoices}
                  placeholder={'Bus\nOwn transport\nWalking'}
                  onChange={(event) => setPastedChoices(event.target.value)}
                />
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setPastedChoices('');
                      setPasteOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!pastedChoices.trim()}
                    onClick={addPastedChoices}
                  >
                    Add choices
                  </Button>
                </Stack>
              </Stack>
            </Collapse>
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
}
