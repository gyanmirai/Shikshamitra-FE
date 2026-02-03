'use client';

import type { FormikProps } from 'formik';

import React, { memo } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Checkbox, FormHelperText } from '@mui/material';

import type { INotificationSendSchema } from './type';

interface AudienceTableProps {
  formik: FormikProps<INotificationSendSchema>;
}

/**
 * Component: AudienceTable
 * Responsibilities:
 * - Rendering the student or employee table based on the selected role
 * - Managing "Select All" and individual row selection in the table
 * - Displaying validation errors for member selection
 */
const AudienceTable = ({ formik }: AudienceTableProps) => {
  const isStudentRole = formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad';

  if (!formik.values.audience.role) return null;

  const handleSelectAll = (checked: boolean) => {
    formik.setFieldValue(
      'members',
      formik.values.members.map((m: any) => ({
        ...m,
        isSelect: checked,
      }))
    );
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const updatedMembers = formik.values.members.map((member: any) =>
      member.id === id ? { ...member, isSelect: checked } : member
    );
    formik.setFieldValue('members', updatedMembers);
  };

  const columns = isStudentRole
    ? [
        {
          id: 'checkBox',
          align: 'left',
          minWidth: '60px',
          isSort: false,
          isFilter: false,
          label: '',
          renderColumn: () => (
            <Checkbox
              checked={
                formik.values.members?.length > 0 &&
                formik.values.members.every((m: any) => m.isSelect)
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          ),
          render: (value: any, row: any) => (
            <Checkbox
              checked={row.isSelect || false}
              onChange={(e) => handleSelectRow(row.id, e.target.checked)}
            />
          ),
        },
        { id: 'name', label: 'Name', align: 'left', minWidth: '150px' },
        { id: 'division', label: 'Division', align: 'left', minWidth: '100px' },
        { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '100px' },
        { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '100px' },
        { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
      ]
    : [
        {
          id: 'checkBox',
          align: 'left',
          minWidth: '60px',
          isSort: false,
          isFilter: false,
          label: '',
          renderColumn: () => (
            <Checkbox
              checked={
                formik.values.members?.length > 0 &&
                formik.values.members.every((m: any) => m.isSelect)
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          ),
          render: (value: any, row: any) => (
            <Checkbox
              checked={row.isSelect || false}
              onChange={(e) => handleSelectRow(row.id, e.target.checked)}
            />
          ),
        },
        { id: 'name', label: 'Name', align: 'left', minWidth: '150px' },
        { id: 'employeeCode', label: 'Employee Code', align: 'left', minWidth: '150px' },
        { id: 'email', label: 'Email', align: 'left', minWidth: '200px' },
        { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
      ];

  const hasError = formik.touched.members && Boolean(formik.errors.members);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            border: hasError ? '1.5px solid #f44336' : 'none',
            borderRadius: 2,
            p: isStudentRole ? 0 : 0.5,
          }}
        >
          <CustomizableTable
            tableId="audience-selection-table"
            noDataText="No data found"
            columns={columns as any}
            data={formik.values.members || []}
          />
        </Box>
      </Grid>
      {hasError && (
        <Grid size={{ xs: 12 }}>
          <FormHelperText
            error
            sx={{
              fontSize: '10px',
              position: 'relative',
              top: '-10px',
              marginLeft: '5px',
            }}
          >
            {String(formik.errors.members)}
          </FormHelperText>
        </Grid>
      )}
    </Grid>
  );
};

/**
 * Memoization Justification:
 * Pure component that displays table data from Formik.
 * Prevents re-renders of the entire table when unrelated form fields change.
 */
export default memo(AudienceTable);
