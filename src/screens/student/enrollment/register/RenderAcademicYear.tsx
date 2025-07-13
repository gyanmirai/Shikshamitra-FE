import { useGetYearQuery } from 'src/redux/year/yearApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

const RenderAcademicYear = (props: any) => {
  // Destructure formik and isEdit from props
  const { formik, isEdit } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch academic year data using custom hook, returns data and loading state
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  return (
    <ShakingTextField error={!!(touched.academicYear && errors.academicYear) || false}>
      <CustomSelect
        name="academicYear"
        label="Academic Year *"
        isLoading={yearLoading}
        options={academicYear?.items || []}
        value={values.academicYear}
        labelKey="name"
        valueKey="id"
        disabled={!isEdit}
        onBlur={formik.handleBlur}
        onChange={(value) => {
          setFieldValue('academicYear', value);
          setFieldValue('board', null);
          setFieldValue('medium', null);
          setFieldValue('class', null);
        }}
        error={!!(touched.academicYear && errors.academicYear) || false}
        helperText={(touched.academicYear && errors.academicYear) || ''}
        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
      />
    </ShakingTextField>
  );
};

export default RenderAcademicYear;
