import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassByOrganizationIdQuery } from 'src/redux/class/classApi';

const RenderClass = (props: any) => {
  const { formik, isEdit } = props;
  const { values, setFieldValue, touched, errors } = formik;
  const { data: classes, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByOrganizationIdQuery,
    options: {
      skip: !values.medium,
    },
    params: values.medium,
  });
  return (
    <ShakingTextField error={!!(touched.class && errors.class) || false}>
      <CustomSelect
        name="class"
        label="Class *"
        isLoading={classLoading}
        disabled={!values.medium || !isEdit}
        labelKey="name"
        valueKey="id"
        options={classes || []}
        value={values.class}
        onChange={(value) => setFieldValue('class', value)}
        onBlur={formik.handleBlur}
        error={!!(touched.class && errors.class) || false}
        helperText={(touched.class && errors.class) || ''}
        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
      />
    </ShakingTextField>
  );
};

export default RenderClass;
