'use client';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Save } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, TextField, Autocomplete } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { allCategory } from './bulkDataFields';

const initialData = [
  {
    id: 1,
    srNo: 1,
    grNo: 'GR001',
    name: 'John Doe',
    division: '',
    firstName: 'John',
    dateOfBirth: dayjs('28-10-2024', 'DD-MM-YYYY'),
    academicYear: '',
    board: '',
    class: '',
  },
  {
    id: 2,
    srNo: 2,
    grNo: 'GR002',
    name: 'Jane Smith',
    division: '',
    firstName: 'abc',
    dateOfBirth: dayjs('03-10-2024', 'DD-MM-YYYY'),
    academicYear: '',
    board: '',
    class: '',
  },
  {
    id: 3,
    srNo: 3,
    grNo: 'GR003',
    name: 'Alice Johnson',
    division: '',
    firstName: 'xyz',
    dateOfBirth: dayjs('19-10-2025', 'DD-MM-YYYY'),
    academicYear: '',
    board: '',
    class: '',
  },
];

const BulkDataUpdateScreen = () => {
  // State for managing selected category
  const [category, setCategory] = useState<string>('');

  // State for managing selected sub-category
  const [subCategory, setSubCategory] = useState<string>('');

  // State for storing all sub-categories with their properties
  const [allSubCategory, setAllSubCategory] = useState<
    { name: string; id: string; type: string }[]
  >([]);

  // State for managing table data initialized with initial student data
  const [tableData, setTableData] = useState(initialData);

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
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
          <Box display="flex" gap={2}>
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
              // disabled={!division}
            />
            <Autocomplete
              options={allSubCategory || []}
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
            <Button startIcon={<Save />} variant="outlined" disabled={!category || !subCategory}>
              Save
            </Button>
          </Box>
        </Box>
        {subCategory && (
          <CustomizableTable
            tableId="bulk-data-update-table"
            noDataText={<>No Bulk Update Data Found </>}
            columns={[
              { id: 'srNo', label: 'Sr. No.', minWidth: '150px', align: 'left' },
              { id: 'grNo', label: 'GR No.', minWidth: '200px', align: 'left' },
              { id: 'name', label: 'Name', minWidth: '200px', align: 'left' },
              {
                id: selectedSubCategory?.id || 'dynamic',
                label: selectedSubCategory.name,
                isSort: false,
                minWidth: '200px',
                align: 'left',
                isFilter: false,
                // renderColumn: (row: any) => <TextField size="small" label={headerLabel || 'hello'} />,
                // render: (value, row: any) => renderDynamicField({ value, row , selectedSubCategory}),
                render: (value, row: any) => (
                  <RenderDynamicField
                    value={value}
                    row={row}
                    selectedSubCategory={selectedSubCategory}
                    onChange={(newValue: any) => handleFieldChange(row.id, newValue)}
                  />
                ),

                // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
              },
            ]}
            data={tableData}
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
