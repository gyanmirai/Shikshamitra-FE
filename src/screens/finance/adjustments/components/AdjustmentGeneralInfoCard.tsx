import { FinanceFieldSkeleton } from 'src/screens/finance/components/FinanceFormSkeleton';
import type { RootState } from 'src/redux/store';
import type { FormikProps } from 'formik';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import type { IAdjustmentFullFormValues } from '../types/adjustmentFormValues';

const AdjustmentGeneralInfoCard: React.FC<{ formik: FormikProps<IAdjustmentFullFormValues> }> = ({
  formik,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { values, touched, errors, setFieldValue } = formik;

  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  const [
    getClassByMedium,
    { currentData: classes, isLoading: classLoading, isFetching: classFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [
    getStudents,
    { currentData: studentsData, isLoading: studentLoading, isFetching: studentFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName}${item.middleName ? ` ${item.middleName}` : ''} ${item.lastName}`,
      })) || [],
    [studentsData?.items]
  );

  useEffect(() => {
    const yearBoards = currentYear?.boards || [];
    setBoards(yearBoards);
    if (yearBoards.length > 0) {
      if (!values.boardId) {
        const firstBoard = yearBoards[0];
        setFieldValue('boardId', firstBoard.id);
        const firstMedium = firstBoard?.educationMediums?.[0]?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      } else if (!values.mediumId) {
        const board = yearBoards.find((b: any) => b.id === values.boardId);
        const firstMedium = board?.educationMediums?.[0]?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      }
    }
  }, [currentYear, values.boardId, values.mediumId, setFieldValue]);

  useEffect(() => {
    const board = boards.find((b: any) => b.id === values.boardId);
    setMediums(board?.educationMediums || []);
  }, [values.boardId, boards]);

  useEffect(() => {
    if (values.mediumId) getClassByMedium(values.mediumId);
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

  useEffect(() => {
    if (values.divisionId) getStudents(values.divisionId);
  }, [values.divisionId, getStudents]);

  return (
    <Grid container spacing={2}>
      {/* Board */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
          <CustomSelect
            required
            name="boardId"
            label="Board"
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
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.boardId && touched.boardId}
            helperText={(touched.boardId && errors.boardId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.mediumId && errors.mediumId)}>
          <CustomSelect
            required
            label="Medium"
            name="mediumId"
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
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.mediumId && touched.mediumId}
            helperText={(touched.mediumId && errors.mediumId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Class */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
          <CustomSelect
            required
            label="Class"
            name="standardId"
            disabled={!values.mediumId || classLoading || classFetching}
            options={classes || []}
            isLoading={classLoading || classFetching}
            labelKey="name"
            valueKey="id"
            value={values.standardId}
            onChange={(val) => {
              setFieldValue('standardId', val);
              setFieldValue('divisionId', '');
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.standardId && touched.standardId}
            helperText={(touched.standardId && errors.standardId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Division */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.divisionId && errors.divisionId)}>
          <CustomSelect
            required
            label="Division"
            name="divisionId"
            disabled={!values.standardId}
            options={allDivisions}
            labelKey="name"
            valueKey="id"
            value={values.divisionId}
            onChange={(val) => {
              setFieldValue('divisionId', val);
              setFieldValue('studentId', '');
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.divisionId && touched.divisionId}
            helperText={(touched.divisionId && errors.divisionId) as string}
            formControlProps={{ fullWidth: true }}
          />
        </ShakingTextField>
      </Grid>

      {/* Student */}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(touched.studentId && errors.studentId)}>
          <FinanceFieldSkeleton
            loading={(studentLoading || studentFetching) && !formik.isSubmitting}
            label="Loading students"
          >
            <Autocomplete
              loading={studentLoading || studentFetching}
              noOptionsText={values.divisionId ? 'No Student Found' : 'Select a division first'}
              fullWidth
              disabled={!values.divisionId}
              options={studentOptions}
              value={studentOptions.find((s: any) => s.studentId === values.studentId) || null}
              onChange={(_e, value: any) => {
                setFieldValue('studentId', value?.studentId || '');
                setFieldValue('studentName', value?.name || '');
                setFieldValue('feeHeadRefunds', []);
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
                  required
                  label="Student"
                  name="studentId"
                  fullWidth
                  error={!!(touched.studentId && errors.studentId)}
                  helperText={(touched.studentId && errors.studentId) as string}
                />
              )}
            />
          </FinanceFieldSkeleton>
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default AdjustmentGeneralInfoCard;
