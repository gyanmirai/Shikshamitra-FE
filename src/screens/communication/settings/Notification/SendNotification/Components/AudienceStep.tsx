'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { debounce, cloneDeep } from 'lodash';
import { useTheme } from '@mui/material/styles';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Grid, Checkbox, TextField, IconButton, FormHelperText } from '@mui/material';

import type { INotificationSendSchema } from './type';

const AudienceStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  console.log('formik erroes-----', formik.errors);
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }
    const orgList = cloneDeep(medium.educationMediumStages);
    const updatedOrganizations = [
      {
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      },
      ...orgList,
    ];
    setAllOrganization(updatedOrganizations);
  }, [medium?.educationMediumStages]);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const tableData = useMemo(() => {
    let tableData2: any[] = [];

    tableData2 = [
      {
        id: '0',
        role: 'Student',
        name: 'Prerna Bhanudas Atre',
        division: 'A',
        grNo: 'GR001',
        rollNo: '101',
        email: 'prerna@gmail.com',
        employeeCode: '',
        contactNo: '1234567890',
      },
      {
        id: '1',
        role: 'Student',
        name: 'Dharmik Harishbhai Ahir',
        division: 'B',
        grNo: 'GR002',
        rollNo: '102',
        email: 'dharmik@gmail.com',
        employeeCode: '',
        contactNo: '0987654321',
      },
      {
        id: '2',
        role: 'Teacher',
        name: 'Rahul Sharma',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'rahul.sharma@school.com',
        employeeCode: 'EMP003',
        contactNo: '9876543210',
      },
      {
        id: '3',
        role: 'Parent',
        name: 'Suresh Patel',
        division: '',
        grNo: '',
        rollNo: '',
        email: 'suresh.patel@gmail.com',
        employeeCode: '',
        contactNo: '8765432109',
      },
    ];

    return tableData2;
  }, []);

  useEffect(() => {
    if (!tableData.length) {
      formik.setFieldValue('members', []);
      return;
    }

    formik.setFieldValue(
      'members',
      tableData.map((item: any) => {
        const existing = formik.values.members?.find((member: any) => member.id === item.id);
        return {
          ...item,
          isSelect: existing?.isSelect ?? false,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  const displayData = useMemo(() => {
    if (!debouncedSearch) return [];
    const lowerTerm = debouncedSearch.toLowerCase();
    return (formik.values.members || []).filter(
      (member: any) =>
        member.name?.toLowerCase().includes(lowerTerm) ||
        member.email?.toLowerCase().includes(lowerTerm) ||
        member.role?.toLowerCase().includes(lowerTerm) ||
        member.contactNo?.toLowerCase().includes(lowerTerm)
    );
  }, [debouncedSearch, formik.values.members]);
  const onClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    debouncedSetSearch.cancel(); // cancel any pending debounce
  };

  return (
    // <SectionCard title="Select Audience">
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={
            !!formik.errors.audience?.educationMediumStageId &&
            !!formik.touched.audience?.educationMediumStageId
          }
        >
          <ResponsiveMultiSelect
            label="Organizations"
            options={[{ id: 'all', name: 'All' }, ...allOrganization.filter((o) => o.id !== 'all')]}
            value={formik.values.audience?.educationMediumStageId}
            getOptionLabel={(opt) => opt?.name}
            getOptionValue={(opt) => opt?.id}
            onChange={(selectedValues) => {
              const allRealIds = allOrganization.filter((o) => o.id !== 'all').map((o) => o.id);

              const hasAllInSelection = selectedValues.includes('all');
              const wasAllPreviouslySelected =
                formik.values.audience?.educationMediumStageId.includes('all');

              let finalValues: string[] = [];

              if (hasAllInSelection && !wasAllPreviouslySelected) {
                finalValues = ['all', ...allRealIds];
              } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                finalValues = [];
              } else if (hasAllInSelection && wasAllPreviouslySelected) {
                finalValues = selectedValues.filter((id) => id !== 'all');
              } else {
                const allIndividuallySelected = allRealIds.every((id) =>
                  selectedValues.includes(id)
                );

                if (allIndividuallySelected && selectedValues.length === allRealIds.length) {
                  finalValues = ['all', ...allRealIds];
                } else {
                  finalValues = selectedValues;
                }
              }

              formik.setFieldValue('audience.educationMediumStageId', finalValues);
            }}
            error={
              !!(
                formik.touched.audience?.educationMediumStageId &&
                formik.errors.audience?.educationMediumStageId
              )
            }
            helperText={
              formik.touched.audience?.educationMediumStageId &&
              typeof formik.errors.audience?.educationMediumStageId === 'string'
                ? formik.errors.audience?.educationMediumStageId
                : undefined
            }
          />
        </ShakingTextField>
      </Grid>

      {/* Search */}
      <Grid size={{ xs: 12, md: 8 }}>
        <TextField
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={onClearSearch} edge="end">
                <ClearIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ),
            sx: {
              borderRadius: 1.5,
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
              fontSize: '14px',
              '& fieldset': {
                border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
              },
              '&:hover fieldset': {
                borderColor: `${varAlpha(theme.vars.palette.grey['500Channel'], 0.4)} !important`,
              },
            },
          }}
          sx={{
            // maxWidth: '300px',
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 1,
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            border:
              formik.touched.members && formik.errors.members ? '1.5px solid #f44336' : 'none',
            borderRadius: 2,
          }}
        >
          <CustomizableTable
            tableId="student-table"
            isLoading={isLoading}
            noDataText="No data found"
            isSearch={false}
            wrapperProps={{
              sx: {
                pt: 0,
              },
            }}
            columns={[
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
                    onChange={(e) =>
                      formik.setFieldValue(
                        'members',
                        formik.values.members.map((m: any) => ({
                          ...m,
                          isSelect: e.target.checked,
                        }))
                      )
                    }
                  />
                ),
                render: (value, row) => (
                  <Checkbox
                    checked={row.isSelect || false}
                    onChange={(e) => {
                      const updatedMembers = formik.values.members.map((member: any) =>
                        member.id === row.id ? { ...member, isSelect: e.target.checked } : member
                      );
                      formik.setFieldValue('members', updatedMembers);
                    }}
                  />
                ),
              },
              { id: 'name', label: 'Name', align: 'left', minWidth: '150px', sticky: true },
              { id: 'role', label: 'Role', align: 'left', minWidth: '150px', sticky: true },
              { id: 'division', label: 'Division', align: 'left', minWidth: '100px' },
              { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '100px' },
              { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '100px' },
              { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
              { id: 'email', label: 'Email', align: 'left', minWidth: '150px' },
              { id: 'employeeCode', label: 'Employee Code', align: 'left', minWidth: '150px' },
            ]}
            data={displayData}
          />
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {formik.touched.members && formik.errors.members && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px',
              position: 'relative',
              top: '-20px',
              marginLeft: '5px',
            }}
          >
            {String(formik.errors.members)}
          </FormHelperText>
        )}
      </Grid>
    </Grid>
    // </SectionCard>
  );
};

export default AudienceStep;
