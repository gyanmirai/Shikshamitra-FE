// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FormikValues } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Board, Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Card, Button, TextField, Typography, DialogActions } from '@mui/material';

import { receiptBookValidationSchema } from '../validationSchema';

import type { IProps, IReceiptBook } from '../receipt-book-interface';

const FinanceSettingReceiptbookDialog: React.FC<IProps> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
}) => {
  // State to track and display duplicate receipt book name error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentYear, currentMedium, setCurrentMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear?.boards]);
  // Memoized initial values for the form based on whether editing existing or creating new
  const initialValues = useMemo<IReceiptBook>(
    () => ({
      id: isEdit
        ? (data?.id ?? Math.floor(Math.random() * 10000))
        : Math.floor(Math.random() * 10000),
      board: isEdit ? (data?.board ?? '') : '',
      medium: isEdit ? (data?.medium ?? '') : '',
      organization: isEdit ? (data?.organization ?? '') : '',
      receiptBookName: isEdit ? (data?.receiptBookName ?? '') : '',
      prefix: isEdit ? (data?.prefix ?? '') : '',
      suffix: isEdit ? (data?.suffix ?? '') : '',
      startingNumber: isEdit ? (data?.startingNumber ?? 0) : '',
      endingNumber: isEdit ? (data?.endingNumber ?? 0) : '',
      description: isEdit ? (data?.description ?? '') : '',
      toggle: isEdit ? (data?.toggle ?? false) : false,
      action: isEdit ? (data?.action ?? '') : '',
    }),
    [data, isEdit]
  );

  // Formik hook for form handling with validation and submission logic
  const formik = useFormik<IReceiptBook>({
    initialValues,
    validationSchema: receiptBookValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Check if receipt book name already exists in the data
      const exists = allData.some(
        (entry) => entry.receiptBookName.toLowerCase() === values.receiptBookName.toLowerCase()
      );

      // Allow save if entry doesn't exist or if editing existing entry
      if (!exists || isEdit) {
        setShowErrorMessage(false);
        onSave(values);
        onClose(null, true);
      } else {
        setShowErrorMessage(true);
        onClose(null, true);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                boxShadow: 'var(--shadows-4)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Receipt Number Preview
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: 300,
                  letterSpacing: 0.5,
                  wordBreak: 'break-all',
                }}
              >
                {getReceiptPreview(formik.values, boards, mediums, allOrganization)}
              </Typography>
            </Card>
          </Grid>

          {/* Medium Field */}
          {/* Board Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'board';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    label="Board *"
                    options={boards || []}
                    labelKey="name"
                    valueKey="id"
                    value={formik.values.board}
                    onChange={(value) => {
                      formik.setFieldValue('board', value as string);
                      formik.setFieldTouched('board', false);
                      const selectedBoard = boards.find((b) => b.id === value);
                      setMediums(selectedBoard?.educationMediums || []);
                      formik.setFieldValue('medium', '');
                      formik.setFieldValue('organization', '');
                    }}
                    formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'medium';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    label="Medium *"
                    options={mediums || []}
                    labelKey="name"
                    disabled={!formik.values.board}
                    valueKey="id"
                    value={formik.values.medium}
                    onChange={(value) => {
                      formik.setFieldValue('medium', value as string);
                      formik.setFieldTouched('medium', false);
                      const selectedMedium = mediums.find((m) => m.id === value);
                      setAllOrganization(selectedMedium?.educationMediumStages || []);
                      formik.setFieldValue('organization', '');
                    }}
                    formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Organization Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'organization';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.organization}
                    disabled={!formik.values.medium}
                    onChange={(val) => {
                      formik.setFieldValue('organization', val as any);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>
          {/* Receipt Book Name Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'receiptBookName';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Receipt Book Name *"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Prefix Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'prefix';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Prefix"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Suffix Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'suffix';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Suffix"
                    value={formik.values[field]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      formik.setFieldValue(field, value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Starting Number Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'startingNumber';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name={field}
                    label="Starting Number"
                    value={formik.values[field]}
                    onChange={(e) => {
                      formik.setFieldValue(field, e.target.value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Ending Number Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            {(() => {
              const field = 'endingNumber';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    name={field}
                    label="Ending Number"
                    value={formik.values[field]}
                    onChange={(e) => {
                      formik.setFieldValue(field, e.target.value);
                    }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Description Field */}
          <Grid size={{ xs: 12, sm: 12 }}>
            {(() => {
              const field = 'description';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={3}
                    name={field}
                    label="Description"
                    value={formik.values[field]}
                    onChange={(e) => formik.setFieldValue(field, e.target.value)}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={data ? GlobalIcons.edit : GlobalIcons.submit}
              width={data ? 16 : 20}
              height={data ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          variant="contained"
          size="small"
        >
          {data ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FinanceSettingReceiptbookDialog;

const getReceiptPreview = (
  values: FormikValues,
  boards: Board[],
  mediums: Medium[],
  allOrganization: Organization[]
): string => {
  const boardName = boards?.find((b: any) => b.id === values.board)?.name || '----';
  const mediumName = mediums?.find((m) => m.id === values.medium)?.name || '----';
  const orgName = allOrganization?.find((o) => o.id === values.organization)?.name || '----';

  const prefix = values.prefix || '';
  const startNum = values.startingNumber || '';
  const endNum = values.endingNumber || '';
  const suffix = values.suffix || '';

  const startFormatted = `${prefix}${startNum}${suffix}` || '------';
  const endFormatted = `${prefix}${endNum}${suffix}`;

  // If no ending number → show single preview
  if (!endNum) {
    return `${boardName}-${mediumName}-${orgName}-${startFormatted}`;
  }
  // If both are available → show range "FROM → TO"
  return `${boardName}-${mediumName}-${orgName}-${startFormatted}  →  ${boardName}-${mediumName}-${orgName}-${endFormatted}`;
};
