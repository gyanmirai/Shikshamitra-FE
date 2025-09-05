'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Grid,
  Chip,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { concessionValidation } from './ConcessionValidation';
import { getInitialConcessionFormData } from './ConcessionInitialValues';

import type { IConcession, IConcessionDocument, IConcessionFormProps } from '../type';

// Extend validation

// 🔹 Mapping concession type → required documents
const concessionDocumentsMap: Record<string, IConcessionDocument[]> = {
  Full: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Income Certificate', acceptedFormat: 'PDF', status: 'Pending' },
  ],
  Partial: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Father Pan Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
  ],
  Scholarship: [
    { id: 1, name: 'Adhar Card', acceptedFormat: 'jpeg, png', status: 'Pending' },
    { id: 2, name: 'Income Certificate', acceptedFormat: 'PDF', status: 'Pending' },
    { id: 3, name: 'Caste Certificate', acceptedFormat: 'jpeg, png, pdf', status: 'Pending' },
  ],
};

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
      getStudents({
        standardId: formik.values.className,
        divisionId: formik.values.division,
      });
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
          <Grid size={12}>
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
              <TextField
                select
                fullWidth
                label="Concession Type *"
                name="concessionType"
                size="small"
                value={formik.values.concessionType}
                onChange={(e) => {
                  const selected = e.target.value;
                  formik.setFieldValue('concessionType', selected);
                  formik.setFieldTouched('concessionType', false);
                  formik.setFieldValue('documents', concessionDocumentsMap[selected] || []);
                }}
                error={formik.touched.concessionType && Boolean(formik.errors.concessionType)}
                helperText={formik.touched.concessionType && formik.errors.concessionType}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Full">Full Concession</MenuItem>
                <MenuItem value="Partial">Partial Concession</MenuItem>
                <MenuItem value="Scholarship">Scholarship</MenuItem>
              </TextField>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.feeHead && formik.errors.feeHead)}>
              <CustomSelect
                label="Fee Head *"
                options={[
                  { id: 'tuition', name: 'Tuition Fee' },
                  { id: 'admission', name: 'Admission Fee' },
                  { id: 'exam', name: 'Examination Fee' },
                  { id: 'transport', name: 'Transport Fee' },
                  { id: 'library', name: 'Library Fee' },
                  { id: 'lab', name: 'Laboratory Fee' },
                  { id: 'sports', name: 'Sports Fee' },
                  { id: 'other', name: 'Other Fees' },
                ]}
                labelKey="name"
                valueKey="id"
                value={formik.values.feeHead}
                onChange={(val) => {
                  formik.setFieldValue('feeHead', val);
                  formik.setFieldTouched('feeHead', false);
                }}
                error={!!formik.errors.feeHead && formik.touched.feeHead}
                helperText={(formik.touched.feeHead && formik.errors.feeHead) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>

        {formik.values.concessionType && (
          <CustomizableTable
            tableId="documents"
            columns={[
              { id: 'name', label: 'Name' },
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
                          row.status === 'Uploaded' ? 'success.main' : theme.palette.grey[500],
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
                        link.download = row.name;
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
        )}
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
