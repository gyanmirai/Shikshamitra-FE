'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Checkbox, TextField, Autocomplete } from '@mui/material';

import type { INotificationSendSchema } from './type';

const AudienceStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // Update class list when medium/organization changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    // Add "All" option if not present
    if (!allClasses.some((std: Standards) => std.id === 'all')) {
      allClasses.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      });
    }
    setAllClass(allClasses);
  }, [medium]);

  // Update division list based on class selection
  useEffect(() => {
    if (formik.values.audience.classes?.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('audience.divisions', []);
      return;
    }

    if (
      formik.values.audience.classes?.length === 1 &&
      formik.values.audience.classes[0] !== 'all'
    ) {
      const selectedClass = allClass.find(
        (cls: any) => cls?.id === formik.values.audience?.classes?.[0]
      );
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      formik.setFieldValue(
        'audience.divisions',
        divisions.map((d: any) => d.id)
      );
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      formik.setFieldValue('audience.divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.audience?.classes]);

  useEffect(() => {
    const classes = formik.values.audience?.classes || [];
    const divisions = formik.values.audience?.divisions || [];

    if (classes.length === 0 || divisions.length === 0) return;

    const payload = {
      educationMediumStageId: medium?.id,
      standardIds: classes.filter((id) => id !== 'all'),
      divisionIds: divisions.filter((id) => id !== 'all'),
    };

    if (payload.standardIds.length > 0 && payload.divisionIds.length > 0) {
      getStudents(payload);
    }
  }, [formik.values.audience?.classes, formik.values.audience?.divisions, getStudents, medium]);

  const tableData = useMemo(() => {
    let tableData2: any[] = [];

    if (formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad') {
      tableData2 =
        StudentsData?.items?.map((item: any) => ({
          ...item,
          name: `${item.firstName} ${item.lastName} ${item.middleName}`,
        })) || [];
    } else {
      tableData2 = [
        {
          id: '0',
          name: 'Prerna Bhanudas Atre',
          division: '',
          grNo: '',
          rollNo: '',
          contactNo: '1234567890',
        },
        {
          id: '1',
          name: 'Dharmik Harishbhai Ahir',
          division: '',
          grNo: '',
          rollNo: '',
          contactNo: '0987654321',
        },
      ];
    }
    return tableData2;
  }, [StudentsData?.items, formik.values.audience?.role]);

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

  // useEffect(() => {
  //   if (tableData && tableData.length && !formik.values.members?.length) {
  //     formik.setFieldValue(
  //       'members',
  //       tableData.map((item: IAudienceMember) => ({ ...item, isSelect: false }))
  //     );
  //   }
  // }, [tableData, formik]);

  return (
    // <SectionCard title="Select Audience">
    <Grid container spacing={3}>
      {/* Role */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={formik.touched.audience?.role && Boolean(formik.errors.audience?.role)}
        >
          <Autocomplete
            disabled={isLoading}
            options={data?.items || []}
            value={
              data?.items?.find((item: any) => item.id === formik.values.audience?.role) || null
            }
            fullWidth
            getOptionLabel={(option: any) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Role *"
                size="small"
                fullWidth
                error={formik.touched.audience?.role && Boolean(formik.errors.audience?.role)}
                helperText={formik.touched.audience?.role && formik.errors.audience?.role}
              />
            )}
            onChange={(e, value) => {
              formik.setFieldValue('audience.role', value?.id);
            }}
            onBlur={() => formik.setFieldTouched('audience.role', true)}
          />
        </ShakingTextField>
      </Grid>

      {/* Class */}
      {formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad' && (
        <>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={formik.touched.audience?.classes && Boolean(formik.errors.audience?.classes)}
            >
              <CustomSelect
                options={allClass}
                label="Class *"
                multiple
                value={formik.values.audience?.classes || []}
                onChange={(val) => {
                  const value = val as string[];
                  const allClassIds =
                    allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                  const isAllClicked = value.includes('all');
                  const wasAllPreviouslySelected = (
                    formik.values.audience?.classes as string[]
                  ).includes('all');

                  if (isAllClicked && !wasAllPreviouslySelected) {
                    formik.setFieldValue('audience.classes', ['all', ...allClassIds]);
                  } else if (!isAllClicked && wasAllPreviouslySelected) {
                    formik.setFieldValue('audience.classes', []);
                  } else if (isAllClicked && wasAllPreviouslySelected) {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allClassIds.length) {
                      formik.setFieldValue('audience.classes', ['all', ...allClassIds]);
                    } else {
                      formik.setFieldValue('audience.classes', selectedWithoutAll);
                    }
                  } else {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allClassIds.length) {
                      formik.setFieldValue('audience.classes', ['all', ...allClassIds]);
                    } else {
                      formik.setFieldValue('audience.classes', selectedWithoutAll);
                    }
                  }
                }}
                onBlur={() => formik.setFieldTouched('audience.classes', true)}
                error={formik.touched.audience?.classes && Boolean(formik.errors.audience?.classes)}
                helperText={
                  (formik.touched.audience?.classes && formik.errors.audience?.classes) as string
                }
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={
                formik.touched.audience?.divisions && Boolean(formik.errors.audience?.divisions)
              }
            >
              {!(formik.values.audience?.classes as string[]).includes('all') &&
                (formik.values.audience?.classes as string[])?.length > 0 && (
                  <CustomSelect
                    options={allDivision}
                    label="Division *"
                    value={formik.values.audience?.divisions || []}
                    onChange={(val) => formik.setFieldValue('audience.divisions', val)}
                    onBlur={() => formik.setFieldTouched('audience.divisions', true)}
                    error={
                      formik.touched.audience?.divisions &&
                      Boolean(formik.errors.audience?.divisions)
                    }
                    helperText={
                      (formik.touched.audience?.divisions &&
                        formik.errors.audience?.divisions) as string
                    }
                    labelKey="name"
                    valueKey="id"
                    multiple={
                      !(formik.values.audience?.classes as string[]).includes('all') ||
                      (formik.values.audience?.classes?.length ?? 0) > 1
                    }
                    formControlProps={{ fullWidth: true }}
                    disabled={formik.values.audience?.classes?.length === 0}
                  />
                )}
            </ShakingTextField>
          </Grid>
        </>
      )}
      {formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad' ? (
        <Grid size={{ xs: 12 }}>
          <CustomizableTable
            tableId="student-table"
            isLoading={isLoading}
            noDataText="No student data found"
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
              { id: 'name', label: 'Name', align: 'left', minWidth: '150px' },
              { id: 'division', label: 'Division', align: 'left', minWidth: '100px' },
              { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '100px' },
              { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '100px' },
              { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
            ]}
            data={formik.values.members || []}
          />
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }}>
          <CustomizableTable
            tableId="student-table"
            isLoading={isLoading}
            noDataText="No student data found"
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
              { id: 'name', label: 'Name', align: 'left', minWidth: '150px' },
              { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
            ]}
            data={formik.values.members || []}
          />
        </Grid>
      )}
    </Grid>
    // </SectionCard>
  );
};

export default AudienceStep;
