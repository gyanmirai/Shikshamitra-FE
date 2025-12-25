'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Chip,
  Card,
  Button,
  Tooltip,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  CardContent,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { concessionValidation } from './ConcessionValidation';
import { getInitialConcessionFormData } from './ConcessionInitialValues';

import type { IConcession, IConcessionFormProps } from '../type';

// Icons for unchecked/checked states
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
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
  const { data: concessionTypes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
  });

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
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
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
                    disabled={!formik.values.board}
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
                    disabled={!formik.values.medium}
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
                    disabled={!formik.values.className}
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
                <ShakingTextField
                  error={!!(formik.touched.studentName && formik.errors.studentName)}
                >
                  <Autocomplete
                    loading={studentLoading}
                    noOptionsText="No Student Found"
                    fullWidth
                    disabled={!formik.values.division}
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
                        helperText={
                          (formik.touched.studentName && formik.errors.studentName) as string
                        }
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

              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.concessions && formik.errors.concessions)}
                >
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={concessionTypes || []}
                    getOptionLabel={(option: any) => option.concessionName}
                    value={concessionTypes?.filter((ct: any) =>
                      formik.values.concessions.some(
                        (c: any) => c.concessionType === ct.concessionName
                      )
                    )}
                    onChange={(e, selectedOptions) => {
                      const concessionsData = selectedOptions.map((opt) => ({
                        concessionType: opt.concessionName,
                        applicableFeeHeads: opt.applicableFeeHeads || [],
                        amount: opt.amount || undefined,
                        percentage: opt.percentage || undefined,
                        documents: opt.documents || [],
                      }));
                      formik.setFieldValue('concessions', concessionsData);
                    }}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.concessionName}
                      </li>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.concessionName}
                          size="small"
                          {...getTagProps({ index })}
                          variant="soft"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Concession Type(s) *"
                        size="small"
                        fullWidth
                        error={!!(formik.errors.concessions && formik.touched.concessions)}
                        helperText={
                          (formik.touched.concessions && formik.errors.concessions) as string
                        }
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              {/* Concession Details and Documents per Type */}
              {formik.values.concessions?.length > 0 && (
                <>
                  {formik.values.concessions.map((c, i) => (
                    <Grid key={i} size={{ xs: 12 }}>
                      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" color="#00A76F" gutterBottom>
                            {c.concessionType} Information
                          </Typography>

                          <Grid container spacing={2}>
                            {/* Fee Heads */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="body2" color="text.secondary">
                                Applicable Fee Heads
                              </Typography>
                              <Typography variant="body1">
                                {c.applicableFeeHeads?.length
                                  ? c.applicableFeeHeads.join(', ')
                                  : '-'}
                              </Typography>
                            </Grid>

                            {/* Amount */}
                            {c.amount && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Amount
                                </Typography>
                                <Typography variant="body1">
                                  {formatNumber(c.amount, 'INR')}
                                </Typography>
                              </Grid>
                            )}

                            {/* Percentage */}
                            {c.percentage && (
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Percentage
                                </Typography>
                                <Typography variant="body1">{c.percentage}%</Typography>
                              </Grid>
                            )}
                          </Grid>

                          {/* Document Table for this Concession */}
                          {c.documents?.length > 0 && (
                            <CustomizableTable
                              tableId={`documents-${i}`}
                              columns={[
                                { id: 'documentName', label: 'Name' },
                                {
                                  id: 'acceptedFormat',
                                  label: 'Accepted Format',
                                  align: 'left',
                                  minWidth: 160,
                                },
                                {
                                  id: 'status',
                                  label: 'Status',

                                  align: 'left',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <Tooltip title={row.status}>
                                      <Iconify
                                        icon={
                                          row.status === 'Uploaded'
                                            ? 'mdi:approve'
                                            : 'mage:file-cross-fill'
                                        }
                                        height={20}
                                        width={20}
                                        sx={{
                                          color: (theme) =>
                                            row.status === 'Uploaded'
                                              ? 'success.main'
                                              : theme.vars.palette.grey[500],
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
                                  render: (value, row) => (
                                    <IconButton component="label">
                                      <input
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                          const file = e.currentTarget.files?.[0];
                                          if (file) {
                                            const updatedDocs = formik.values.concessions[
                                              i
                                            ].documents.map((d) =>
                                              d.id === row.id
                                                ? { ...d, file, status: 'Uploaded' }
                                                : d
                                            );
                                            formik.setFieldValue(
                                              `concessions[${i}].documents`,
                                              updatedDocs
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
                                  isSort: false,
                                  render: (value, row) => (
                                    <IconButton
                                      onClick={() =>
                                        window.open(URL.createObjectURL(row.file), '_blank')
                                      }
                                      disabled={!row.file}
                                    >
                                      <Iconify icon="carbon:view-filled" />
                                    </IconButton>
                                  ),
                                },
                                {
                                  id: 'download',
                                  label: 'Download',
                                  isFilter: false,
                                  isSort: false,
                                  render: (value, row) => (
                                    <IconButton
                                      onClick={() => {
                                        const url = URL.createObjectURL(row.file);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = row.documentName;
                                        link.click();
                                      }}
                                      disabled={!row.file}
                                    >
                                      <Iconify
                                        icon="material-symbols:download"
                                        width={20}
                                        height={20}
                                      />
                                    </IconButton>
                                  ),
                                },
                              ]}
                              data={c.documents}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </Scrollbar>

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
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default NewConcessionRequestForm;
