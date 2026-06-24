import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import { Stack } from '@mui/system';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetTransportMemberCandidatesQuery } from 'src/redux/transport/vehicle-management/member-manage-api';
import {
  Box,
  Grid,
  Checkbox,
  TextField,
  Typography,
  ToggleButton,
  FormHelperText,
  ToggleButtonGroup,
} from '@mui/material';

import type { ITransportApplicationPayload } from '../type';

const SelectStudentStep = ({ formik }: { formik: FormikProps<ITransportApplicationPayload> }) => {
  const currentMedium = useSelector((state: RootState) => state.globalState.currentMedium);
  const [, setSelectedRow] = useState<number | string>();
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const [memberType, setMemberType] = useState<number | undefined>(undefined);
  const { data: candidates, isFetching } = useGetTransportMemberCandidatesQuery(
    {
      academicMediumId: currentMedium?.id,
      memberType,
      search: searchInput,
      pageNumber: 1,
      pageSize: 25,
      excludeExisting: true,
    },
    { skip: !currentMedium?.id || !searchInput.trim() }
  );

  const filteredMembers = candidates?.data ?? [];

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
        <ToggleButtonGroup
          exclusive
          size="small"
          value={memberType ?? 'all'}
          onChange={(_, value) => {
            if (value !== null) {
              setMemberType(value === 'all' ? undefined : Number(value));
            }
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value={0}>Students</ToggleButton>
          <ToggleButton value={1}>Employees</ToggleButton>
        </ToggleButtonGroup>
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
        {formik.touched.sourceId && formik.errors.sourceId && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px',
              position: 'relative',
              bottom: 3,
              marginLeft: '5px',
            }}
          >
            {String(formik.errors.sourceId)}
          </FormHelperText>
        )}
      </Grid>
      {searchInput && (
        <Box
          sx={{
            border:
              formik.touched.sourceId && formik.errors.sourceId
                ? `1px solid ${theme.palette.error.main}`
                : 'none',
            borderRadius: 2,
          }}
        >
          <CustomizableTable
            tableId="transport-request-table"
            data={filteredMembers || []}
            noDataText={isFetching ? 'Searching members...' : 'No members found'}
            columns={[
              {
                id: 'select',
                label: 'Select',
                sticky: true,
                isSort: false,
                isFilter: false,
                render: (_, row) => (
                  <Checkbox
                    checked={formik.values.sourceId === row.sourceId}
                    onChange={() => {
                      formik.setFieldValue('sourceId', row.sourceId);
                      formik.setFieldValue('memberType', row.memberType);
                      formik.setFieldValue('studentId', row.memberType === 0 ? row.sourceId : '');
                      formik.setFieldValue('employeeId', row.memberType === 1 ? row.sourceId : '');
                      formik.setFieldTouched('sourceId', false);
                      formik.setFieldValue('name', row.name);
                      formik.setFieldValue('contactNo', row.contactNo);
                      formik.setFieldValue('role', row.role);
                      formik.setFieldValue('class', row.class);
                      formik.setFieldValue('division', row.division);
                      formik.setFieldValue('grNo', row.grNo);
                      formik.setFieldValue('photoUrl', row.photoUrl);
                      formik.setFieldValue('selectedStudent', row.sourceId);
                      setSelectedRow(row.sourceId);
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
