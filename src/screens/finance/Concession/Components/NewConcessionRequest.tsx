'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetConcessionTypeQuery } from 'src/redux/finance/concessionType';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Chip,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { concessionValidation } from './ConcessionValidation';
import { getInitialConcessionFormData } from './ConcessionInitialValues';

import type { IConcession, IConcessionFormProps } from '../type';
import type { IConcessionTypeForm } from '../../settings/ConcessionTypeSetting/type';

const NewConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  open,
  onClose,
  student,
  editData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // state
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);
  // Fetch concession type data
  const { data: concessionTypes, isLoading: concessionTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeQuery,
  });

  console.log('concessionTypes====', concessionTypes);
  // queries
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const [getStudents, { data: StudentsData, isLoading: studentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  const formik = useFormik<IConcession>({
    initialValues: getInitialConcessionFormData(editData),
    validationSchema: concessionValidation,
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: 'Concession request submitted successfully' });
      onClose(values, true);
    },
  });
  // load boards on year change
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  // load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === formik.values.board);
    setMediums(selectedBoard?.educationMediums || []);
    if (formik.values.medium) {
      getClassByMedium(formik.values.medium);
    }
  }, [formik.values.board, formik.values.medium, boards, getClassByMedium]);

  // load divisions when class changes
  useEffect(() => {
    setAllDivision(
      classes?.find((cls: any) => cls.id === formik.values.className)?.divisions || []
    );
  }, [formik.values.className, classes]);

  // load students when class & division selected
  useEffect(() => {
    if (formik.values.className && formik.values.division) {
      getStudents({ standardId: formik.values.className, divisionId: formik.values.division });
    }
  }, [formik.values.className, formik.values.division, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {/* Board */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.board && formik.errors.board)}>
              <CustomSelect
                label="Board *"
                options={boards}
                labelKey="name"
                valueKey="id"
                value={formik.values.board}
                onChange={(val) => {
                  formik.setFieldValue('board', val);
                  formik.setFieldTouched('board', false);
                  formik.setFieldValue('medium', '');
                  formik.setFieldValue('className', '');
                  formik.setFieldValue('division', '');
                }}
                error={!!formik.errors.board && formik.touched.board}
                helperText={(formik.touched.board && formik.errors.board) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Medium */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.medium && formik.errors.medium)}>
              <CustomSelect
                label="Medium *"
                options={mediums}
                labelKey="name"
                valueKey="id"
                value={formik.values.medium}
                onChange={(val) => {
                  formik.setFieldValue('medium', val);
                  formik.setFieldTouched('medium', false);
                  formik.setFieldValue('className', '');
                  formik.setFieldValue('division', '');
                }}
                error={!!formik.errors.medium && formik.touched.medium}
                helperText={(formik.touched.medium && formik.errors.medium) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Class */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
              <CustomSelect
                label="Class *"
                options={classes || []}
                labelKey="name"
                valueKey="id"
                value={formik.values.className}
                onChange={(val) => {
                  formik.setFieldValue('className', val);
                  formik.setFieldTouched('className', false);
                  formik.setFieldValue('division', '');
                }}
                error={!!formik.errors.className && formik.touched.className}
                helperText={(formik.touched.className && formik.errors.className) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Division */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
              <CustomSelect
                label="Division *"
                options={allDivision}
                labelKey="name"
                valueKey="id"
                value={formik.values.division}
                onChange={(val) => {
                  formik.setFieldValue('division', val);
                  formik.setFieldTouched('division', false);
                }}
                error={!!formik.errors.division && formik.touched.division}
                helperText={(formik.touched.division && formik.errors.division) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Student */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.studentName && formik.errors.studentName)}>
              <Autocomplete
                loading={studentLoading}
                noOptionsText="No Student Found"
                fullWidth
                options={tableData}
                value={formik.values.studentName}
                onChange={(e, value) => {
                  formik.setFieldValue('studentName', value);
                  formik.setFieldTouched('studentName', false);
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={
                        typeof option === 'string' ? option : (option as { name: string }).name
                      }
                      variant="soft"
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                getOptionLabel={(option: any) => (option ? option.name : '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Student *"
                    fullWidth
                    error={!!formik.errors.studentName && formik.touched.studentName}
                    helperText={(formik.touched.studentName && formik.errors.studentName) as string}
                  />
                )}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={typeof option === 'string' ? option : (option as { id: string }).id}
                  >
                    {typeof option === 'string' ? option : (option as { name: string }).name}
                  </li>
                )}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.concessionType && formik.errors.concessionType)}
            >
              <CustomSelect
                label="Concession Type *"
                options={concessionTypes || []}
                labelKey="concessionName"
                valueKey="concessionName"
                value={formik.values.concessionType}
                onChange={(val) => {
                  formik.setFieldValue('concessionType', val);
                  formik.setFieldTouched('concessionType', false);
                  const concession = concessionTypes.find(
                    (item: IConcessionTypeForm) => item.concessionName === val
                  );
                  formik.setFieldValue('documents', concession.documents);
                  formik.setFieldValue('applicableFeeHeads', concession.applicableFeeHeads);
                  formik.setFieldValue('percentage', concession.percentage);
                  formik.setFieldValue('amount', concession.amount);
                }}
                error={!!formik.errors.concessionType && formik.touched.concessionType}
                helperText={
                  (formik.touched.concessionType && formik.errors.concessionType) as string
                }
                sx={{ mb: 2 }}
              />
            </ShakingTextField>
          </Grid>

          {formik.values.concessionType && (
            <>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    {/* Applicable Fee Head */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Applicable Fee Head
                      </Typography>
                      <Typography variant="body1" fontWeight="400">
                        {Array.isArray(formik.values.applicableFeeHeads)
                          ? formik.values.applicableFeeHeads.join(', ')
                          : formik.values.applicableFeeHeads || '-'}
                      </Typography>
                    </Grid>

                    {/* Amount */}
                    {formik.values.amount && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="400">
                          {formatNumber(formik.values.amount, 'INR')}
                        </Typography>
                      </Grid>
                    )}

                    {/* Percentage */}
                    {formik.values.percentage && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Percentage
                        </Typography>
                        <Typography variant="body1" fontWeight="400">
                          {formik.values.percentage}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>

              <CustomizableTable
                tableId="documents"
                columns={[
                  { id: 'documentName', label: 'Name' },
                  { id: 'acceptedFormat', label: 'Accepted Format', align: 'left' },
                  {
                    id: 'status',
                    label: 'Status',
                    isSort: false,
                    align: 'left',
                    isFilter: false,
                    render: (value, row) => (
                      <Tooltip title={row.status}>
                        <Iconify
                          icon={row.status === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                          height={20}
                          width={20}
                          sx={{
                            color: (theme) =>
                              row.status === 'Uploaded'
                                ? 'success.main'
                                : theme.vars.palette.grey[500],
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
                    ),
                  },
                  {
                    id: 'upload',
                    label: 'Upload',
                    isFilter: false,
                    isSort: false,
                    align: 'left',
                    render: (value, row) => (
                      <IconButton
                        component="label"
                        sx={{
                          textAlign: 'left',
                          marginLeft: '0px',
                          padding: '0px',
                          justifyContent: 'flex-start',
                          display: 'flex',
                        }}
                      >
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (file) {
                              formik.setFieldValue(
                                'documents',
                                formik.values.documents.map((d) =>
                                  d.id === row.id ? { ...d, file, status: 'Uploaded' } : d
                                )
                              );
                            }
                          }}
                        />
                        <Iconify icon="ci:file-upload" />
                      </IconButton>
                    ),
                  },
                  {
                    id: 'view',
                    label: 'View',
                    isFilter: false,
                    align: 'left',
                    isSort: false,
                    render: (value, row) =>
                      row.file && (
                        <IconButton
                          style={{
                            textAlign: 'left',
                            marginLeft: '0px',
                            padding: '0px',
                            justifyContent: 'flex-start',
                            display: 'flex',
                          }}
                          onClick={() => window.open(URL.createObjectURL(row.file), '_blank')}
                        >
                          <Iconify icon="carbon:view-filled" />
                        </IconButton>
                      ),
                  },
                  {
                    id: 'download',
                    label: 'Download',
                    isFilter: false,
                    align: 'left',
                    isSort: false,
                    render: (value, row) =>
                      row.file && (
                        <IconButton
                          style={{
                            textAlign: 'left',
                            marginLeft: '0px',
                            padding: '0px',
                            justifyContent: 'flex-start',
                            display: 'flex',
                          }}
                          onClick={() => {
                            const url = URL.createObjectURL(row.file);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = row.documentName;
                            link.click();
                          }}
                        >
                          <Iconify icon="material-symbols:download" width={20} height={20} />
                        </IconButton>
                      ),
                  },
                ]}
                data={formik.values.documents}
              />
            </>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default NewConcessionRequestForm;
