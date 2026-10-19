import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Box,
  Menu,
  Select,
  Button,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { parseFormattedNumber } from '../utils';

import type { IColumnFilterAnchor } from '../types';

interface ColumnFilterMenuProps {
  anchorEl: IColumnFilterAnchor | null;
  onClose: () => void;
  onApplyFilter: (
    columnId: string,
    filterType: string,
    value: any,
    valueType: string,
    label?: ReactNode,
    displayValue?: ReactNode
  ) => void;
}

export const ColumnFilterMenu = ({ anchorEl, onClose, onApplyFilter }: ColumnFilterMenuProps) => {
  const filterTypeLabelId = React.useId();
  const filterValueLabelId = React.useId();
  const formik = useFormik<{
    min: number | null;
    max: number | null;
    filterValue: null | string | Dayjs | number | { min: number; max: number };
    filterType: string;
  }>({
    initialValues: { min: null, max: null, filterValue: null, filterType: '' },
    validationSchema: yup.object({
      filterType: yup.string().test('filterType', 'Filter type is required', (value) => {
        if (anchorEl?.column.filterType === 'enum') {
          return true;
        }
        return !!value;
      }),
      min: yup.number().when('filterType', {
        is: 'between',
        then: (schema) => schema.required('Min value is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      max: yup.number().when('filterType', {
        is: 'between',
        then: (schema) => schema.required('Max value is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      filterValue: yup.mixed().when('filterType', {
        is: 'between',
        then: (schema) => schema.nullable(),
        otherwise: (schema) => schema.required('value is required'),
      }),
    }),
    onSubmit: () => {
      handleApply();
    },
  });

  const getFilterOptions = () => {
    if (!anchorEl) return [];

    switch (anchorEl.column.filterType) {
      case 'formattedNumber':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
        ];

      case 'string':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
          { value: 'between', label: 'Between' },
        ];
      case 'date':
      case 'dateTime':
        return [
          { value: 'equals', label: 'Equals' },
          // { value: 'range', label: 'Date Range' },
          { value: 'after', label: 'After' },
          { value: 'before', label: 'Before' },
        ];
      case 'enum':
        return [{ value: 'equals', label: 'Equals' }];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
        ];
    }
  };

  const handleApply = () => {
    if (!anchorEl) return;

    let value: any = formik.values.filterValue;
    let filterTypeValue = formik.values.filterType;
    if (anchorEl.column.filterType === 'date') {
      value = (value as Dayjs).format('DD-MM-YYYY');
    }
    if (anchorEl.column.filterType === 'dateTime') {
      value = (value as Dayjs).format('DD-MM-YYYY HH:mm');
    }
    if (anchorEl.column.filterType === 'enum') {
      filterTypeValue = 'equals';
    }
    if (anchorEl.column.filterType === 'formattedNumber') {
      value = parseFormattedNumber(value);
    }
    if (formik.values.filterType === 'between') {
      value = { min: formik.values.min, max: formik.values.max };
    }

    onApplyFilter(
      anchorEl.column.id,
      filterTypeValue,
      value,
      anchorEl.column.filterType as string,
      anchorEl.column.label,
      anchorEl.column.filterType === 'enum'
        ? anchorEl.column.enumOptions?.find((option) => String(option.value) === String(value))
            ?.label
        : undefined
    );
    formik.setFieldValue('filterValue', null);
    formik.setFieldValue('filterType', '');
    formik.setFieldValue('min', null);
    formik.setFieldValue('max', null);
    formik.resetForm();
    onClose();
  };
  return (
    <Menu
      anchorEl={anchorEl?.element}
      open={Boolean(anchorEl)}
      onClose={() => {
        formik.setFieldValue('filterValue', null);
        formik.setFieldValue('filterType', '');
        formik.setFieldValue('min', null);
        formik.setFieldValue('max', null);
        formik.resetForm();
        onClose();
      }}
      slotProps={{ paper: { sx: { width: '260px' } } }}
    >
      <Box component="form" sx={{ p: 2, maxWidth: 350 }} onSubmit={formik.handleSubmit}>
        {anchorEl?.column.filterType !== 'enum' && (
          <FormControl
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            error={formik.touched.filterType && !!formik.errors.filterType}
          >
            <InputLabel id={filterTypeLabelId}>Filter Type *</InputLabel>
            <Select
              labelId={filterTypeLabelId}
              value={formik.values.filterType}
              onChange={(e) => formik.setFieldValue('filterType', e.target.value)}
              label="Filter Type *"
            >
              {getFilterOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.filterType && formik.errors.filterType && (
              <FormHelperText error>{formik.errors.filterType}</FormHelperText>
            )}
          </FormControl>
        )}

        {anchorEl?.column.filterType === 'enum' && (
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.filterValue && !!formik.errors.filterValue}
          >
            <InputLabel id={filterValueLabelId}>{anchorEl.column.label} *</InputLabel>
            <Select
              labelId={filterValueLabelId}
              value={formik.values.filterValue ?? ''}
              onChange={(e) => formik.setFieldValue('filterValue', e.target.value)}
              label={`${anchorEl.column.label} *`}
            >
              {anchorEl.column.enumOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.filterValue && formik.errors.filterValue && (
              <FormHelperText error>{formik.errors.filterValue}</FormHelperText>
            )}
          </FormControl>
        )}

        {formik.values.filterType &&
          (anchorEl?.column.filterType === 'date' ? (
            <DatePicker
              value={formik.values.filterValue as null | Dayjs}
              onChange={(newValue) => formik.setFieldValue('filterValue', newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: `${anchorEl?.column.label} *`,
                  error: Boolean(formik.touched.filterValue && formik.errors.filterValue),
                  helperText: (formik.touched.filterValue && formik.errors.filterValue) as string,
                },
              }}
              format="DD-MM-YYYY"
            />
          ) : anchorEl?.column.filterType === 'dateTime' ? (
            <DateTimePicker
              value={formik.values.filterValue as null | Dayjs}
              onChange={(newValue) => formik.setFieldValue('filterValue', newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: `${anchorEl?.column.label} *`,
                  error: Boolean(formik.touched.filterValue && formik.errors.filterValue),
                  helperText: (formik.touched.filterValue && formik.errors.filterValue) as string,
                },
              }}
              format="DD-MM-YYYY HH:mm"
            />
          ) : formik.values.filterType === 'between' ? (
            <>
              <TextField
                fullWidth
                size="small"
                value={formik.values.min ?? ''}
                onChange={(e) => formik.setFieldValue('min', e.target.value)}
                type="number"
                label={`${anchorEl?.column.label} Min *`}
                sx={{ mb: 2 }}
                error={Boolean(formik.touched.min && formik.errors.min)}
                helperText={formik.touched.min && formik.errors.min}
              />

              <TextField
                fullWidth
                size="small"
                value={formik.values.max ?? ''}
                onChange={(e) => formik.setFieldValue('max', e.target.value)}
                type="number"
                label={`${anchorEl?.column.label} Max *`}
                error={Boolean(formik.touched.max && formik.errors.max)}
                helperText={formik.touched.max && formik.errors.max}
              />
            </>
          ) : (
            <TextField
              fullWidth
              size="small"
              value={formik.values.filterValue ?? ''}
              onChange={(e) => {
                const sanitizedValue = e.target.value;
                formik.setFieldValue('filterValue', sanitizedValue);
              }}
              type={anchorEl?.column.filterType === 'number' ? 'number' : 'text'}
              label={`${anchorEl?.column.label} *`}
              error={Boolean(formik.touched.filterValue && formik.errors.filterValue)}
              helperText={formik.touched.filterValue && formik.errors.filterValue}
            />
          ))}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            onClick={() => {
              formik.setFieldValue('filterValue', null);
              formik.setFieldValue('filterType', '');
              formik.setFieldValue('min', null);
              formik.setFieldValue('max', null);
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" size="small" type="submit">
            Apply
          </Button>
        </Box>
      </Box>
    </Menu>
  );
};
