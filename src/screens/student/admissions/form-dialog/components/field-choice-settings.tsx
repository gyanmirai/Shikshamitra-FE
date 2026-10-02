import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import { useGetAdmissionFormDataSourcesQuery } from 'src/redux/student/admissions/admission-forms-api';

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
  const { data: dataSources = [] } = useGetAdmissionFormDataSourcesQuery();
  const sourceConfig = parseOptionsSource(field.optionsJson);
  const parsedChoices = sourceConfig
    ? { choices: [] as EditableAdmissionChoice[] }
    : parseEditableAdmissionChoices(field.optionsJson);
  const otherFields = formik.values.sections
    .flatMap((section) => section.fields)
    .filter((item) => item.code !== field.code);
  const selectedSource = dataSources.find((source) => source.key === sourceConfig?.source);
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

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Answer options</Typography>
      <CustomSelect
        size="small"
        label="Options source"
        value={sourceConfig?.source ?? ''}
        options={[
          { value: '', label: 'Enter my own options' },
          ...dataSources.map((item) => ({ value: item.key, label: item.displayName })),
        ]}
        onChange={(value) =>
          formik.setFieldValue(
            `${path}.optionsJson`,
            value ? JSON.stringify({ source: value }) : undefined
          )
        }
      />
      {selectedSource?.supportsParent && (
        <CustomSelect
          size="small"
          label="Depends on field"
          value={sourceConfig?.parentField ?? ''}
          options={[
            { value: '', label: 'Select parent field' },
            ...otherFields.map((item) => ({ value: item.code, label: item.label })),
          ]}
          helperText="Available options depend on the answer to this field."
          onChange={(value) =>
            formik.setFieldValue(
              `${path}.optionsJson`,
              JSON.stringify({
                source: sourceConfig?.source,
                parentField: value || undefined,
              })
            )
          }
        />
      )}

      {!sourceConfig?.source && parsedChoices.error && (
        <>
          <Alert severity="warning">{parsedChoices.error}</Alert>
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
              <Tooltip title="Move option up">
                <span>
                  <IconButton
                    aria-label={`Move ${choice.label || `option ${index + 1}`} up`}
                    disabled={index === 0}
                    onClick={() => moveChoice(index, -1)}
                  >
                    <Iconify icon="mdi:arrow-up" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move option down">
                <span>
                  <IconButton
                    aria-label={`Move ${choice.label || `option ${index + 1}`} down`}
                    disabled={index === parsedChoices.choices.length - 1}
                    onClick={() => moveChoice(index, 1)}
                  >
                    <Iconify icon="mdi:arrow-down" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete option">
                <IconButton
                  aria-label={`Delete ${choice.label || `option ${index + 1}`}`}
                  onClick={() => removeChoice(index)}
                >
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              </Tooltip>
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
              <Typography variant="caption" color="text.secondary">
                Add choices one at a time or paste a list.
              </Typography>
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
                helperText="Enter one choice per line."
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
  );
}
