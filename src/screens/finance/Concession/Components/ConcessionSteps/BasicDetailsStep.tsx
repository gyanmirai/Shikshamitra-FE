import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';

const BasicDetailsStep = ({ formik }: { formik: any }) => {
  const { values, setFieldValue, touched, errors } = formik;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const [getStudents, { data: studentsData, isLoading: studentLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);
  }, [values.boardId, boards]);

  useEffect(() => {
    if (values.mediumId) {
      getClassByMedium(values.mediumId);
    }
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

  useEffect(() => {
    if (values.standardId && values.divisionId) {
      getStudents({
        standardId: values.standardId,
        divisionId: values.divisionId,
      });
    }
  }, [values.standardId, values.divisionId, getStudents]);

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.middleName ? `${item.middleName} ` : ''}${item.lastName}`,
      })) || [],
    [studentsData?.items]
  );

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {/* Board */}
      <Grid size={{ xs: 6, md: 4 }}>
        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
          <CustomSelect
            label="Board *"
            options={boards}
            labelKey="name"
            valueKey="id"
            value={values.boardId}
            onChange={(val) => {
              setFieldValue('boardId', val);
              setFieldValue('mediumId', '');
              setFieldValue('standardId', '');
              setFieldValue('divisionId', '');
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
            }}
            error={!!errors.boardId && touched.boardId}
            helperText={(touched.boardId && errors.boardId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 6, md: 4 }}>
        <ShakingTextField error={!!(touched.mediumId && errors.mediumId)}>
          <CustomSelect
            label="Medium *"
            disabled={!values.boardId}
            options={mediums}
            labelKey="name"
            valueKey="id"
            value={values.mediumId}
            onChange={(val) => {
              setFieldValue('mediumId', val);
              setFieldValue('standardId', '');
              setFieldValue('divisionId', '');
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
            }}
            error={!!errors.mediumId && touched.mediumId}
            helperText={(touched.mediumId && errors.mediumId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Class */}
      <Grid size={{ xs: 6, md: 4 }}>
        <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
          <CustomSelect
            label="Class *"
            disabled={!values.mediumId}
            options={classes || []}
            isLoading={classLoading}
            labelKey="name"
            valueKey="id"
            value={values.standardId}
            onChange={(val) => {
              setFieldValue('standardId', val);
              setFieldValue('divisionId', '');
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
            }}
            error={!!errors.standardId && touched.standardId}
            helperText={(touched.standardId && errors.standardId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Division */}
      <Grid size={{ xs: 6, md: 4 }}>
        <ShakingTextField error={!!(touched.divisionId && errors.divisionId)}>
          <CustomSelect
            label="Division *"
            disabled={!values.standardId}
            options={allDivisions}
            labelKey="name"
            valueKey="id"
            value={values.divisionId}
            onChange={(val) => {
              setFieldValue('divisionId', val);
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
            }}
            error={!!errors.divisionId && touched.divisionId}
            helperText={(touched.divisionId && errors.divisionId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Student */}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(touched.studentId && errors.studentId)}>
          <Autocomplete
            loading={studentLoading}
            noOptionsText="No Student Found"
            fullWidth
            disabled={!values.divisionId}
            options={studentOptions}
            value={studentOptions.find((s: any) => s.studentId === values.studentId) || null}
            onChange={(_e, value: any) => {
              setFieldValue('studentId', value?.studentId || '');
              setFieldValue('studentName', value?.name || '');
            }}
            getOptionLabel={(option: any) => option.name || ''}
            renderOption={(props, option: any) => (
              <li {...props} key={option.studentId}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Student *"
                fullWidth
                error={!!errors.studentId && touched.studentId}
                helperText={(touched.studentId && errors.studentId) as string}
              />
            )}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default BasicDetailsStep;
