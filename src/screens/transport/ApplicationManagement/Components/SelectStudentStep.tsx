import type { FormikProps } from 'formik';

import { Stack } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Checkbox, TextField, Typography, FormHelperText } from '@mui/material';
import { useGetTransportMembersQuery } from 'src/redux/transport/vehicle-management/member-manage-api';

import type { ITransportApplicationPayload } from '../type';

const SelectStudentStep = ({ formik }: { formik: FormikProps<ITransportApplicationPayload> }) => {
  const { data: requestData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTransportMembersQuery,
  });
  console.log('formik values---', formik.values);
  console.log('formik erroe---', formik.errors);

  const [selectedRow, setSelectedRow] = useState<number>();

  const theme = useTheme();
  const [searchInput, setSearchInput] = useState(''); // typed text
  const filteredMembers = useMemo(() => {
    if (!searchInput) return requestData;
    const term = searchInput.toLowerCase();
    return requestData.filter(
      (member: ITransportApplicationPayload) =>
        member.name?.toLowerCase().includes(term) ||
        member.studentId?.toLowerCase().includes(term) ||
        member.class?.toString().toLowerCase().includes(term) ||
        member.rollNo?.toString().toLowerCase().includes(term) ||
        member.grNo?.toString().toLowerCase().includes(term)
    );
  }, [requestData, searchInput]);

  // const rowProps = useCallback(
  //   (row: any, index: number) => ({
  //     onClick: () => {
  //       formik.setFieldValue('studentId', row.studentId);
  //       formik.setFieldValue('name', row.name);
  //       formik.setFieldValue('email', row.email);
  //       formik.setFieldValue('contactNo', row.contactNo);
  //       formik.setFieldValue('role', row.role);
  //       formik.setFieldValue('selectedStudent', index);
  //       setSelectedRow(index);
  //     },
  //     sx: {
  //       backgroundColor:
  //         formik.values.selectedStudent === index
  //           ? varAlpha(theme.palette.primary.mainChannel, 0.2)
  //           : 'inherit',
  //       color: formik.values.selectedStudent === index ? '#fff' : 'inherit',
  //       cursor: 'pointer',
  //       '&:hover': {
  //         backgroundColor:
  //           formik.values.selectedStudent === index
  //             ? theme.palette.primary.dark
  //             : theme.palette.action.hover,
  //       },
  //     },
  //   }),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [formik.values.selectedStudent, theme] // ⚠️ include dependencies
  // );
  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          label="Search by Name, Role, Class.."
          sx={{ flex: 1 }}
        />
      </Stack>
      <Grid size={{ xs: 12 }}>
        {formik.touched.studentId && formik.errors.studentId && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px',
              position: 'relative',
              bottom: 3,
              marginLeft: '5px',
            }}
          >
            {String(formik.errors.studentId)}
          </FormHelperText>
        )}
      </Grid>
      {searchInput && (
        <Box
          sx={{
            border:
              formik.touched.studentId && formik.errors.studentId
                ? `1px solid ${theme.palette.error.main}`
                : 'none',
            borderRadius: 2,
          }}
        >
          <CustomizableTable
            tableId="transport-request-table"
            data={filteredMembers || []}
            noDataText="No requests found"
            columns={[
              {
                id: 'select',
                label: 'Select',
                sticky: true,
                isSort: false,
                isFilter: false,
                render: (_, row) => (
                  <Checkbox
                    checked={formik.values.studentId === row.studentId}
                    onChange={() => {
                      formik.setFieldValue('studentId', row.studentId);
                      formik.setFieldValue('studentId', row.studentId);
                      formik.setFieldTouched('studentId', false);
                      formik.setFieldValue('name', row.name);
                      formik.setFieldValue('email', row.email);
                      formik.setFieldValue('contactNo', row.contactNo);
                      formik.setFieldValue('role', row.role);
                      formik.setFieldValue('selectedStudent', row.studentId);
                      setSelectedRow(row.studentId);
                    }}
                  />
                ),
              },
              { id: 'name', label: 'Name', align: 'left', sticky: true },
              { id: 'role', label: 'Role', align: 'left' },
              {
                id: 'class',
                label: 'Class',
                align: 'left',
              },
              {
                id: 'division',
                label: 'Div',
                align: 'left',
              },
              {
                id: 'grNo',
                label: 'GR No.',
                align: 'left',
                minWidth: 80,
              },
              {
                id: 'rollNo',
                label: 'Roll No.',
                align: 'left',
                minWidth: 90,
              },
              {
                id: 'searchStop',
                label: 'Preferred Stop',
                align: 'left',
                minWidth: 150,
              },
              {
                id: 'areaLocality',
                label: 'Address',
                align: 'left',
                render: (val) => (
                  <Typography variant="caption" fontSize="13px" color="text.primary">
                    {val}
                  </Typography>
                ),
              },
            ]}
          />
        </Box>
      )}
      {!searchInput && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <EmptyContent
            title="Search Member"
            sx={{
              width: '100%',
            }}
          />
        </Box>
      )}
    </>
  );
};

export default SelectStudentStep;
