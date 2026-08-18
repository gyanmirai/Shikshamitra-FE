'use client';

import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Grid,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: AdmissionForm | null;
  saving: boolean;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};
const schema = Yup.object({
  name: Yup.string().trim().required('Form name is required'),
  code: Yup.string().trim().required('Form code is required'),
});
const newField = (sectionId: string, order: number) => ({
  id: crypto.randomUUID(),
  sectionId,
  code: `FIELD_${order + 1}`,
  label: `Field ${order + 1}`,
  fieldType: 0 as const,
  bindingType: 1 as const,
  required: false,
  readOnly: false,
  displayOrder: order,
});
export function AdmissionFormDialog({ open, onClose, editing, saving, onSave }: Props) {
  /**
   * Memoization Justification:
   * - Formik uses enableReinitialize and compares initialValues on each render.
   * - Stable values prevent resetForm from dispatching on every render.
   * - The generated default section and field are created only for a new form state.
   */
  const initialValues = useMemo(() => {
    const sectionId = editing?.sections[0]?.id ?? crypto.randomUUID();
    return {
      name: editing?.name ?? '',
      code: editing?.code ?? '',
      layoutType: editing?.layoutType ?? 1,
      sections: editing?.sections ?? [
        {
          id: sectionId,
          code: 'SECTION_1',
          name: 'Student Details',
          displayOrder: 0,
          fields: [newField(sectionId, 0)],
        },
      ],
    };
  }, [editing?.code, editing?.layoutType, editing?.name, editing?.sections]);
  const formik = useFormik<CreateUpdateAdmissionForm>({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave(values);
        helpers.resetForm();
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message: (error as { data?: { detail?: string } })?.data?.detail || 'Failed to save form',
        });
      }
    },
  });
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={editing ? 'Edit Form' : 'Create Form'}
      maxWidth="md"
    >
      <DialogScrollContent>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Form name *"
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Code *"
              {...formik.getFieldProps('code')}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">Sections and fields</Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={() => {
                  const id = crypto.randomUUID();
                  formik.setFieldValue('sections', [
                    ...formik.values.sections,
                    {
                      id,
                      code: `SECTION_${formik.values.sections.length + 1}`,
                      name: `Section ${formik.values.sections.length + 1}`,
                      displayOrder: formik.values.sections.length,
                      fields: [],
                    },
                  ]);
                }}
              >
                Add section
              </Button>
            </Stack>
            {formik.values.sections.map((section, sectionIndex) => (
              <Stack
                key={section.id}
                spacing={1}
                sx={{ mb: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Section code"
                    value={section.code}
                    onChange={(e) =>
                      formik.setFieldValue(`sections[${sectionIndex}].code`, e.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Section name"
                    value={section.name}
                    onChange={(e) =>
                      formik.setFieldValue(`sections[${sectionIndex}].name`, e.target.value)
                    }
                  />
                  <TextField
                    size="small"
                    label="Visibility rule JSON"
                    value={section.visibilityRuleJson ?? ''}
                    placeholder='{"operator":"ALL","conditions":[]}'
                    onChange={(e) =>
                      formik.setFieldValue(
                        `sections[${sectionIndex}].visibilityRuleJson`,
                        e.target.value || undefined
                      )
                    }
                    sx={{ minWidth: 240 }}
                  />
                  <IconButton
                    disabled={formik.values.sections.length < 2}
                    onClick={() =>
                      formik.setFieldValue(
                        'sections',
                        formik.values.sections.filter((_, index) => index !== sectionIndex)
                      )
                    }
                  >
                    <Iconify icon="mdi:delete-outline" />
                  </IconButton>
                </Stack>
                {section.fields.map((field, fieldIndex) => (
                  <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      label="Field code"
                      value={field.code}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].code`,
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      size="small"
                      fullWidth
                      label="Label"
                      value={field.label}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].label`,
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      size="small"
                      label="Binding key"
                      value={field.bindingKey ?? ''}
                      placeholder="Applicant.FirstName"
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].bindingKey`,
                          e.target.value || undefined
                        )
                      }
                    />
                    <TextField
                      select
                      size="small"
                      label="Field type"
                      value={field.fieldType}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].fieldType`,
                          Number(e.target.value)
                        )
                      }
                      sx={{ minWidth: 120 }}
                    >
                      {[
                        ['Text', 0],
                        ['Textarea', 1],
                        ['Number', 2],
                        ['Email', 3],
                        ['Phone', 4],
                        ['Date', 5],
                        ['Select', 6],
                        ['Radio', 8],
                        ['Checkbox', 9],
                        ['File placeholder', 10],
                        ['Address group', 11],
                      ].map(([label, value]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      label="Binding"
                      value={field.bindingType}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].bindingType`,
                          Number(e.target.value)
                        )
                      }
                      sx={{ minWidth: 110 }}
                    >
                      <MenuItem value={0}>Custom</MenuItem>
                      <MenuItem value={1}>System</MenuItem>
                    </TextField>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={field.required}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `sections[${sectionIndex}].fields[${fieldIndex}].required`,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Required"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={field.readOnly}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `sections[${sectionIndex}].fields[${fieldIndex}].readOnly`,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Read-only"
                    />
                    <TextField
                      size="small"
                      label="Help text"
                      value={field.helpText ?? ''}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].helpText`,
                          e.target.value || undefined
                        )
                      }
                    />
                    <TextField
                      size="small"
                      label="Placeholder"
                      value={field.placeholder ?? ''}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].placeholder`,
                          e.target.value || undefined
                        )
                      }
                    />
                    <TextField
                      size="small"
                      label="Default value"
                      value={field.defaultValue ?? ''}
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].defaultValue`,
                          e.target.value || undefined
                        )
                      }
                    />
                    <TextField
                      size="small"
                      multiline
                      minRows={2}
                      label="Validation JSON"
                      value={field.validationJson ?? ''}
                      placeholder='{"minLength":2,"messages":{"minLength":"Enter at least 2 characters."}}'
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].validationJson`,
                          e.target.value || undefined
                        )
                      }
                      sx={{ minWidth: 260 }}
                    />
                    <TextField
                      size="small"
                      multiline
                      minRows={2}
                      label="Visibility rule JSON"
                      value={field.visibilityRuleJson ?? ''}
                      placeholder='{"field":"hasPreviousSchool","operator":"Equals","value":true}'
                      onChange={(e) =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields[${fieldIndex}].visibilityRuleJson`,
                          e.target.value || undefined
                        )
                      }
                      sx={{ minWidth: 260 }}
                    />
                    <IconButton
                      onClick={() =>
                        formik.setFieldValue(
                          `sections[${sectionIndex}].fields`,
                          section.fields.filter((_, index) => index !== fieldIndex)
                        )
                      }
                    >
                      <Iconify icon="mdi:delete-outline" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  size="small"
                  onClick={() =>
                    formik.setFieldValue(`sections[${sectionIndex}].fields`, [
                      ...section.fields,
                      newField(section.id, section.fields.length),
                    ])
                  }
                >
                  Add field
                </Button>
              </Stack>
            ))}
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton variant="outlined" size="small" onClick={onClose} disabled={saving}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => formik.handleSubmit()}
        >
          Save draft
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
