// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FormikValues } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Board, Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Card, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddReceiptBookMutation,
  useUpdateReceiptBookMutation,
} from 'src/redux/finance/receiptBookApi';

import { receiptBookValidationSchema } from '../validationSchema';

import type { IProps, IReceiptBook } from '../receipt-book-interface';

const FinanceSettingReceiptbookDialog: React.FC<IProps> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // POST mutation for creating
  const [addReceiptBook, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddReceiptBookMutation,
  });

  // PUT mutation for updating
  const [updateReceiptBook, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateReceiptBookMutation,
  });

  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // Memoized initial values for the form based on whether editing existing or creating new
  const initialValues = useMemo<IReceiptBook>(
    () => ({
      boardId: isEdit ? (data?.boardId ?? '') : '',
      mediumId: isEdit ? (data?.mediumId ?? '') : '',
      mediumStageId: isEdit ? (data?.mediumStageId ?? '') : '',
      name: isEdit ? (data?.name ?? '') : '',
      prefix: isEdit ? (data?.prefix ?? '') : '',
      suffix: isEdit ? (data?.suffix ?? '') : '',
      startingNumber: isEdit ? (data?.startingNumber ?? 0) : '',
      endingNumber: isEdit ? (data?.endingNumber ?? 0) : '',
      description: isEdit ? (data?.description ?? '') : '',
      isActive: isEdit ? (data?.isActive ?? false) : false,
    }),
    [data, isEdit]
  );

  // Formik hook for form handling with validation and submission logic
  const formik = useFormik<IReceiptBook>({
    initialValues,
    validationSchema: receiptBookValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Transform form data to API format
        const payload = {
          boardId: values.boardId,
          mediumId: values.mediumId,
          mediumStageId: values.mediumStageId,
          name: values.name,
          prefix: values.prefix || '',
          suffix: values.suffix || '',
          startingNumber: Number(values.startingNumber) || 0,
          endingNumber: Number(values.endingNumber) || 0,
          description: values.description || '',
        };

        if (isEdit && data?.id) {
          // Update existing receipt book
          await updateReceiptBook({
            id: data.id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Receipt Book updated successfully`,
          });
        } else {
          // Create new receipt book
          await addReceiptBook({ academicYearId: currentYear?.id, body: payload }).unwrap();

          shikshaMitraToast.success({
            message: `${values.name} Receipt Book added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${isEdit ? 'update' : 'create'} receipt book`,
        });
      }
    },
  });

  useEffect(() => {
    setBoards(currentYear?.boards || []);
    setMediums(
      currentYear?.boards?.find((board: Board) => board.id === formik.values.boardId)
        ?.educationMediums || []
    );
    setAllOrganization(
      currentYear?.boards
        ?.find((board: Board) => board.id === formik.values.boardId)
        ?.educationMediums?.find((medium: Medium) => medium.id === formik.values.mediumId)
        ?.educationMediumStages || []
    );
  }, [currentYear?.boards, formik.values.boardId, formik.values.mediumId]);

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
              const field = 'boardId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <PaginatedSearchSelect
                    key={boards?.length ? 'boards-loaded' : 'boards-empty'}
                    label="Board *"
                    noOptionsText="No Board Found"
                    fetchOptions={async (query: string, page: number) => {
                      const filtered = (boards || []).filter((b: any) =>
                        b?.name?.toLowerCase().includes(query.toLowerCase())
                      );
                      const pageSize = 10;
                      const start = (page - 1) * pageSize;
                      const end = start + pageSize;
                      return {
                        data: filtered.slice(start, end).map((item: any) => ({
                          label: item.name,
                          id: item.id,
                        })),
                        hasMore: end < filtered.length,
                      };
                    }}
                    value={
                      boards?.find((b: any) => b.id === formik.values.boardId)
                        ? {
                            label: boards.find((b: any) => b.id === formik.values.boardId)?.name,
                            id: formik.values.boardId,
                          }
                        : null
                    }
                    isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                    renderOption={(prop, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.label}
                      </li>
                    )}
                    getOptionLabel={(option: any) => option?.label || ''}
                    minChars={0}
                    onChange={(_, val: any) => {
                      formik.setFieldValue('boardId', val?.id || '');
                      formik.setFieldTouched('boardId', false);
                      const selectedBoard = boards.find((b) => b.id === val?.id);
                      setMediums(selectedBoard?.educationMediums || []);
                      formik.setFieldValue('mediumId', '');
                      formik.setFieldValue('mediumStageId', '');
                    }}
                    size="small"
                    sx={{ width: '100%', maxWidth: '248px' }}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            {(() => {
              const field = 'mediumId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <PaginatedSearchSelect
                    key={mediums?.length ? 'mediums-loaded' : 'mediums-empty'}
                    label="Medium *"
                    noOptionsText="No Medium Found"
                    disabled={!formik.values.boardId}
                    fetchOptions={async (query: string, page: number) => {
                      const filtered = (mediums || []).filter((m: any) =>
                        m?.name?.toLowerCase().includes(query.toLowerCase())
                      );
                      const pageSize = 10;
                      const start = (page - 1) * pageSize;
                      const end = start + pageSize;
                      return {
                        data: filtered.slice(start, end).map((item: any) => ({
                          label: item.name,
                          id: item.id,
                        })),
                        hasMore: end < filtered.length,
                      };
                    }}
                    value={
                      mediums?.find((m: any) => m.id === formik.values.mediumId)
                        ? {
                            label: mediums.find((m: any) => m.id === formik.values.mediumId)?.name,
                            id: formik.values.mediumId,
                          }
                        : null
                    }
                    isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                    renderOption={(prop, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.label}
                      </li>
                    )}
                    getOptionLabel={(option: any) => option?.label || ''}
                    minChars={0}
                    onChange={(_, val: any) => {
                      formik.setFieldValue('mediumId', val?.id || '');
                      formik.setFieldTouched('mediumId', false);
                      const selectedMedium = mediums.find((m) => m.id === val?.id);
                      setAllOrganization(selectedMedium?.educationMediumStages || []);
                      formik.setFieldValue('mediumStageId', '');
                    }}
                    size="small"
                    sx={{ width: '100%', maxWidth: '248px' }}
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
              const field = 'mediumStageId';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = (formik.touched[field] && formik.errors[field]) as string;
              return (
                <ShakingTextField error={error}>
                  <PaginatedSearchSelect
                    key={allOrganization?.length ? 'orgs-loaded' : 'orgs-empty'}
                    label="Organization *"
                    noOptionsText="No Organization Found"
                    disabled={!formik.values.mediumId}
                    fetchOptions={async (query: string, page: number) => {
                      const filtered = (allOrganization || []).filter((o: any) =>
                        o?.name?.toLowerCase().includes(query.toLowerCase())
                      );
                      const pageSize = 10;
                      const start = (page - 1) * pageSize;
                      const end = start + pageSize;
                      return {
                        data: filtered.slice(start, end).map((item: any) => ({
                          label: item.name,
                          id: item.id,
                        })),
                        hasMore: end < filtered.length,
                      };
                    }}
                    value={
                      allOrganization?.find((o: any) => o.id === formik.values.mediumStageId)
                        ? {
                            label: allOrganization.find(
                              (o: any) => o.id === formik.values.mediumStageId
                            )?.name,
                            id: formik.values.mediumStageId,
                          }
                        : null
                    }
                    isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                    renderOption={(prop, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.label}
                      </li>
                    )}
                    getOptionLabel={(option: any) => option?.label || ''}
                    minChars={0}
                    onChange={(_, val: any) => {
                      formik.setFieldValue('mediumStageId', val?.id || '');
                    }}
                    size="small"
                    sx={{ width: '100%', maxWidth: '250px' }}
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
              const field = 'name';
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
        <LoadingButton
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
          loading={isAddLoading || isUpdateLoading}
        >
          {data ? 'Update' : 'Submit'}
        </LoadingButton>
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
  const boardName = boards?.find((b: any) => b.id === values.boardId)?.name || '----';
  const mediumName = mediums?.find((m) => m.id === values.mediumId)?.name || '----';
  const orgName = allOrganization?.find((o) => o.id === values.mediumStageId)?.name || '----';

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
