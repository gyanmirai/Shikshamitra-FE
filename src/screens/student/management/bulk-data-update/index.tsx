'use client';

import dayjs from 'dayjs';
import { Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Alert,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Autocomplete,
} from '@mui/material';

import { allCategory } from './bulkDataFields';

const BulkDataUpdateScreen = () => {
  const { data: classes, isLoading: classesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [divisions, setDivisions] = useState([]);
  const [classValue, setClassValue] = useState('');
  const [division, setDivision] = useState('');
  const [tableParams, setTableParams] = useState({ page: 1, rowsPerPage: 10, searchTerm: '' });
  const {
    data: students,
    isLoading: studentsLoading,
    isError,
  } = useGetStudentsByDivisionQuery(
    {
      divisionId: division,
      skipCount: (tableParams.page - 1) * tableParams.rowsPerPage,
      maxResultCount: tableParams.rowsPerPage,
      searchTerm: tableParams.searchTerm,
    },
    { skip: !division }
  );
  const isBulkSaveAvailable = false;

  // State for managing selected category
  const [category, setCategory] = useState<string>('');

  // State for managing selected sub-category
  const [subCategory, setSubCategory] = useState<string>('');

  // State for storing all sub-categories with their properties
  const [allSubCategory, setAllSubCategory] = useState<
    { name: string; id: string; type: string }[]
  >([]);

  const initialData = useMemo(
    () =>
      students?.items?.map((student: any, index: number) => ({
        ...student,
        id: student.studentId,
        srNo: index + 1,
        grNo: student.grNo || '-',
        name:
          student.studentName ||
          [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        division: student.divisionId || division,
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth) : null,
        academicYear: student.academicYearId || '',
        board: student.academicBoardId || '',
        medium: student.academicMediumId || '',
        class: student.standardId || '',
      })) || [],
    [division, students?.items]
  );

  // State for managing table data initialized with API student data
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  const handleClassChange = (event: any) => {
    setClassValue(event.target.value);
    setDivision('');
    setTableParams({ page: 1, rowsPerPage: 10, searchTerm: '' });
    setDivisions(
      classes?.items?.find((item: any) => item.id === event.target.value)?.divisions || []
    );
  };

  // Find the currently selected sub-category object from allSubCategory array
  const selectedSubCategory = allSubCategory.find((cat: any) => cat.id === subCategory) || {
    name: '',
    id: '',
    type: '',
  };

  // Handler function to update table data when field values change
  const handleFieldChange = (rowId: any, value: any) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, [selectedSubCategory.id]: value } : row))
    );
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="bulk-class-select-label" size="small">
                Class
              </InputLabel>
              <Select
                labelId="bulk-class-select-label"
                value={classValue}
                label="Class"
                onChange={handleClassChange}
                size="small"
              >
                {classesLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : classes?.items?.length > 0 ? (
                  classes.items.map((classItem: any) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No class available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="bulk-division-select-label" size="small">
                Division
              </InputLabel>
              <Select
                labelId="bulk-division-select-label"
                value={division}
                label="Division"
                onChange={(event) => {
                  setDivision(event.target.value);
                  setTableParams({ page: 1, rowsPerPage: 10, searchTerm: '' });
                }}
                size="small"
                disabled={!classValue}
              >
                {divisions.length > 0 ? (
                  divisions.map((divisionItem: any) => (
                    <MenuItem key={divisionItem.id} value={divisionItem.id}>
                      {divisionItem.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No division available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <CustomSelect
              options={allCategory}
              label="Category"
              value={category}
              onChange={(val) => {
                setAllSubCategory(
                  allCategory.find((cat: any) => cat.id === val)?.subCategory || []
                );
                setSubCategory('');
                setCategory(val as string);
              }}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '200px' } }}
              disabled={!division || !isBulkSaveAvailable}
            />
            <Autocomplete
              options={allSubCategory || []}
              disabled={!division || !category || !isBulkSaveAvailable}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sub Category"
                  placeholder="Search Sub Category"
                  size="small"
                  fullWidth
                  sx={{ width: '100%', minWidth: '200px' }}
                />
              )}
              onChange={(e, value) => {
                // formik.setFieldValue('examType', value?.id);
                setSubCategory(value?.id || '');
              }}
            />
          </Box>
          <Box display="flex" gap={2}>
            {' '}
            <Button
              startIcon={<Save />}
              variant="outlined"
              disabled
              title="Bulk save API is not available yet."
            >
              Save
            </Button>
          </Box>
        </Box>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Unable to load students for the selected division.
          </Alert>
        )}
        {division && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bulk data updates are temporarily unavailable while backend validation is being
            finalized. Student records below are loaded from the selected class and division.
          </Alert>
        )}

        {division && (
          <CustomizableTable
            tableId="bulk-data-update-table"
            noDataText={<>No students found for the selected division.</>}
            columns={[
              { id: 'srNo', label: 'Sr. No.', minWidth: '150px', align: 'left' },
              { id: 'grNo', label: 'GR No.', minWidth: '200px', align: 'left' },
              { id: 'name', label: 'Name', minWidth: '200px', align: 'left' },
              ...(subCategory && isBulkSaveAvailable
                ? [
                    {
                      id: selectedSubCategory?.id || 'dynamic',
                      label: selectedSubCategory.name,
                      isSort: false,
                      minWidth: '200px',
                      align: 'left' as const,
                      isFilter: false,
                      render: (value: any, row: any) => (
                        <RenderDynamicField
                          value={value}
                          row={row}
                          selectedSubCategory={selectedSubCategory}
                          onChange={(newValue: any) => handleFieldChange(row.id, newValue)}
                        />
                      ),
                    },
                  ]
                : []),
            ]}
            data={tableData}
            isLoading={studentsLoading}
            serverSidePagination
            serverSideSearch
            totalCount={students?.totalCount || 0}
            onServerPagination={(page, rowsPerPage) =>
              setTableParams((prev) => ({ ...prev, page, rowsPerPage }))
            }
            onServerSearch={(searchTerm) =>
              setTableParams((prev) => ({ ...prev, page: 1, searchTerm }))
            }
          />
        )}
      </BackPopUpChecked>
    </Box>
  );
};

export default BulkDataUpdateScreen;

const RenderDynamicField = ({ value, row, selectedSubCategory, onChange }: any) =>
  selectedSubCategory?.renderComp ? (
    selectedSubCategory.renderComp({ value, row, onChange })
  ) : selectedSubCategory.type === 'date' ? (
    <DatePicker
      label={selectedSubCategory.label}
      name={selectedSubCategory.name}
      value={value}
      format="DD-MM-YYYY"
      onChange={(newValue) => onChange(newValue)}
      slotProps={{
        textField: {
          placeholder: selectedSubCategory.placeholder,
          fullWidth: true,
          size: 'small',
          // helperText: formik.touched[field.name] && formik.errors[field.name],
          // error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
        },
      }}
    />
  ) : (
    <TextField
      fullWidth
      variant="outlined"
      label={selectedSubCategory.label} // Corrected `label` usage
      size="small"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{ sx: { width: '100%', maxWidth: '200px' } }}
      {...((typeof selectedSubCategory?.otherProps === 'function'
        ? selectedSubCategory?.otherProps({ onChange })
        : selectedSubCategory?.otherProps) || {})}
    />
  );
