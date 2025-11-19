import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Chip, Grid, TextField, Autocomplete } from '@mui/material';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const RefundGeneralInfoCard: React.FC<any> = ({ formik }) => {
  //   const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Lazy query hook to fetch classes by medium
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);

  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  useEffect(() => {
    setBoards(currentYear?.boards);
    const selectedBoard = boards?.find((item: any) => item.id === formik.values.board);

    setMediums((selectedBoard as unknown as Board)?.educationMediums || []);
    if (formik.values.medium) {
      getClassByMedium(formik.values.medium);
    }
  }, [boards, currentYear?.boards, formik.values.board, formik.values.medium, getClassByMedium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(
      classes?.find((org: any) => org?.id === formik.values.className)?.divisions || []
    );
  }, [classes, formik.values.className]);

  // Initialize query hook for fetching students
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (formik.values.className && formik.values.division) {
      getStudents({
        standardId: formik.values.className,
        divisionId: formik.values.division,
      });
    }
  }, [classes, formik.values.className, formik.values.division, getStudents]);

  // Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Board */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.board && formik.errors.board)}>
              <CustomSelect
                name="board"
                label="Board *"
                // isLoading={boardLoading}
                options={boards || []}
                labelKey="name"
                valueKey="id"
                value={formik.values.board || ''}
                onChange={(value) => {
                  formik.setFieldValue('medium', '');
                  formik.setFieldValue('className', '');
                  formik.setFieldValue('division', '');
                  formik.setFieldValue('board', value);
                }}
                error={!!(formik.touched.board && formik.errors.board) || false}
                helperText={(formik.touched.board && formik.errors.board) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* Medium */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.medium && formik.errors.medium)}>
              <CustomSelect
                label="Medium *"
                options={mediums || []}
                labelKey="name"
                disabled={!formik.values.board}
                valueKey="id"
                value={formik.values.medium}
                onChange={(val) => formik.setFieldValue('medium', val)}
                error={!!(formik.touched.medium && formik.errors.medium)}
                helperText={(formik.touched.medium && formik.errors.medium) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Class */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
              <CustomSelect
                label="Class *"
                options={classes || []}
                labelKey="name"
                valueKey="id"
                disabled={!formik.values.medium}
                value={formik.values.className}
                onChange={(val) => formik.setFieldValue('className', val)}
                error={!!(formik.touched.className && formik.errors.className)}
                helperText={(formik.touched.className && formik.errors.className) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Division */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
              <CustomSelect
                label="Division *"
                options={allDivision}
                labelKey="name"
                valueKey="id"
                disabled={!formik.values.className}
                value={formik.values.division}
                onChange={(val) => formik.setFieldValue('division', val)}
                error={!!(formik.touched.division && formik.errors.division)}
                helperText={(formik.touched.division && formik.errors.division) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Student */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.student && formik.errors.student) || false}>
              <Autocomplete
                loading={isLoading}
                disabled={!formik.values.division}
                noOptionsText="No Student Found"
                fullWidth
                value={tableData.find((s: any) => s.name === formik.values.student) || null}
                onChange={(e, value: any) => {
                  formik.setFieldValue('student', value?.name || '');
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.name}
                      variant="soft"
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                options={tableData}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Student *"
                    fullWidth
                    error={!!(formik.touched.student && formik.errors.student)}
                    helperText={(formik.touched.student && formik.errors.student) as string}
                  />
                )}
                renderOption={(prop: any, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
    </BackPopUpChecked>
  );
};

export default RefundGeneralInfoCard;
