import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Autocomplete } from '@mui/material';
import { useGetStudentsByScopeQuery } from 'src/redux/student';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { FinanceFieldSkeleton } from 'src/screens/finance/components/FinanceFormSkeleton';

import type { RefundFormik } from './types';

interface RefundGeneralInfoCardProps {
  formik: RefundFormik;
  disabled?: boolean;
  scopeOptions?: import('src/redux/finance/financeWorkContextApi').FinanceScopeOption[] | null;
}

const RefundGeneralInfoCard: React.FC<RefundGeneralInfoCardProps> = ({
  formik,
  disabled = false,
  scopeOptions = null,
}): React.ReactElement => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const scopedClasses = useMemo(
    () =>
      (classes ?? []).filter(
        (cls: any) =>
          !scopeOptions ||
          scopeOptions.some(
            (option) =>
              option.boardId === values.boardId &&
              option.mediumId === values.mediumId &&
              option.standardId === cls.id
          )
      ),
    [classes, scopeOptions, values.boardId, values.mediumId]
  );

  const {
    currentData: studentsData,
    isLoading: studentLoading,
    isFetching: studentFetching,
    isError: studentsError,
  } = useGetStudentsByScopeQuery(
    {
      academicYearId: currentYear?.id || '',
      boardId: values.boardId,
      educationMediumId: values.mediumId,
      classIds: [values.standardId],
      divisionIds: [values.divisionId],
    },
    {
      skip:
        disabled ||
        !currentYear?.id ||
        !values.boardId ||
        !values.mediumId ||
        !values.standardId ||
        !values.divisionId,
    }
  );

  const studentOptions = useMemo(
    () =>
      studentsData?.map((item) => ({
        ...item,
        name: item.studentName,
      })) || [],
    [studentsData]
  );

  // ── Side effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    const yearBoards = (currentYear?.boards || []).filter(
      (board: any) => !scopeOptions || scopeOptions.some((option) => option.boardId === board.id)
    );
    setBoards(yearBoards);
    if (disabled) return;
    if (yearBoards.length > 0) {
      if (!values.boardId || !yearBoards.some((board: any) => board.id === values.boardId)) {
        const firstBoard = yearBoards[0];
        setFieldValue('boardId', firstBoard.id);
        const firstMedium =
          firstBoard?.educationMediums?.find(
            (medium: any) =>
              !scopeOptions ||
              scopeOptions.some(
                (option) => option.boardId === firstBoard.id && option.mediumId === medium.id
              )
          )?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      } else if (
        !values.mediumId ||
        (scopeOptions &&
          !scopeOptions.some(
            (option) => option.boardId === values.boardId && option.mediumId === values.mediumId
          ))
      ) {
        const board = yearBoards.find((b: any) => b.id === values.boardId);
        const firstMedium =
          board?.educationMediums?.find(
            (medium: any) =>
              !scopeOptions ||
              scopeOptions.some(
                (option) => option.boardId === board.id && option.mediumId === medium.id
              )
          )?.id ?? '';
        setFieldValue('mediumId', firstMedium);
      }
    }
  }, [currentYear, scopeOptions, values.boardId, values.mediumId, setFieldValue, disabled]);

  useEffect(() => {
    const board = boards.find((b: any) => b.id === values.boardId);
    setMediums(
      (board?.educationMediums || []).filter(
        (medium: any) =>
          !scopeOptions ||
          scopeOptions.some(
            (option) => option.boardId === values.boardId && option.mediumId === medium.id
          )
      )
    );
  }, [values.boardId, boards, scopeOptions]);

  useEffect(() => {
    if (values.mediumId) getClassByMedium(values.mediumId);
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(
      (scopedClasses.find((cls: any) => cls.id === values.standardId)?.divisions || []).filter(
        (division: any) =>
          !scopeOptions ||
          scopeOptions.some(
            (option) => option.standardId === values.standardId && option.divisionId === division.id
          )
      )
    );
  }, [values.standardId, scopedClasses, scopeOptions]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Grid container spacing={2}>
      {/* Board */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
          <CustomSelect
            label="Board *"
            disabled={disabled}
            options={boards}
            labelKey="name"
            valueKey="id"
            value={values.boardId}
            onChange={(val) => {
              setFieldValue('boardId', val);
              setFieldTouched('boardId', false);
              setFieldValue('mediumId', '');
              setFieldTouched('mediumId', false);
              setFieldValue('standardId', '');
              setFieldTouched('standardId', false);
              setFieldValue('divisionId', '');
              setFieldTouched('divisionId', false);
              setFieldValue('studentId', '');
              setFieldTouched('studentId', false);
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.boardId && touched.boardId}
            helperText={(touched.boardId && errors.boardId) as string}
            formControlProps={{ fullWidth: true, disabled }}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.mediumId && errors.mediumId)}>
          <CustomSelect
            label="Medium *"
            disabled={disabled || !values.boardId}
            options={mediums}
            labelKey="name"
            valueKey="id"
            value={values.mediumId}
            onChange={(val) => {
              setFieldValue('mediumId', val);
              setFieldTouched('mediumId', false);
              setFieldValue('standardId', '');
              setFieldTouched('standardId', false);
              setFieldValue('divisionId', '');
              setFieldTouched('divisionId', false);
              setFieldValue('studentId', '');
              setFieldTouched('studentId', false);
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.mediumId && touched.mediumId}
            helperText={(touched.mediumId && errors.mediumId) as string}
            formControlProps={{ fullWidth: true, disabled: disabled || !values.boardId }}
          />
        </ShakingTextField>
      </Grid>

      {/* Class */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
          <CustomSelect
            label="Class *"
            disabled={disabled || !values.mediumId}
            options={scopedClasses}
            isLoading={classLoading}
            labelKey="name"
            valueKey="id"
            value={values.standardId}
            onChange={(val) => {
              setFieldValue('standardId', val);
              setFieldTouched('standardId', false);
              setFieldValue('divisionId', '');
              setFieldTouched('divisionId', false);
              setFieldValue('studentId', '');
              setFieldTouched('studentId', false);
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.standardId && touched.standardId}
            helperText={(touched.standardId && errors.standardId) as string}
            formControlProps={{ fullWidth: true, disabled: disabled || !values.mediumId }}
          />
        </ShakingTextField>
      </Grid>

      {/* Division */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <ShakingTextField error={!!(touched.divisionId && errors.divisionId)}>
          <CustomSelect
            label="Division *"
            disabled={disabled || !values.standardId}
            options={allDivisions}
            labelKey="name"
            valueKey="id"
            value={values.divisionId}
            onChange={(val) => {
              setFieldValue('divisionId', val);
              setFieldTouched('divisionId', false);
              setFieldValue('studentId', '');
              setFieldTouched('studentId', false);
              setFieldValue('studentName', '');
              setFieldValue('feeHeadRefunds', []);
            }}
            error={!!errors.divisionId && touched.divisionId}
            helperText={(touched.divisionId && errors.divisionId) as string}
            formControlProps={{ fullWidth: true, disabled: disabled || !values.standardId }}
          />
        </ShakingTextField>
      </Grid>

      {/* Student */}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(touched.studentId && errors.studentId)}>
          <FinanceFieldSkeleton
            loading={!disabled && (studentLoading || studentFetching) && !formik.isSubmitting}
            label="Loading students"
          >
            <Autocomplete
              loading={studentLoading || studentFetching}
              noOptionsText={
                studentsError
                  ? 'Unable to load students'
                  : values.divisionId
                    ? 'No Student Found'
                    : 'Select a division first'
              }
              fullWidth
              disabled={disabled || !values.divisionId}
              options={studentOptions}
              value={
                studentOptions.find((s) => s.studentId === values.studentId) ||
                (disabled && values.studentId
                  ? { studentId: values.studentId, name: values.studentName }
                  : null)
              }
              isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
              onChange={(_e, value: any) => {
                setFieldValue('studentId', value?.studentId || '');
                setFieldTouched('studentId', false);
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
                  label="Student *"
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

export default RefundGeneralInfoCard;
