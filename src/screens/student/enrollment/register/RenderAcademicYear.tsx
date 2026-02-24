import { useGetYearQuery } from 'src/redux/year/yearApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

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
      <PaginatedSearchSelect
        label="Academic Year *"
        // disabled={isEdit}
        fetchOptions={async (query) => {
          const items = (academicYear?.items || []).filter((item: any) =>
            item?.name?.toLowerCase().includes(query.toLowerCase())
          );
          return {
            data: items.map((item: any) => ({
              label: item.name,
              id: item.id,
            })),
            hasMore: false,
          };
        }}
        value={
          values.academicYear
            ? {
                label:
                  academicYear?.items?.find((y: any) => y.id === values.academicYear)?.name || '',
                id: values.academicYear,
              }
            : null
        }
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        getOptionLabel={(option: any) => option?.label || ''}
        renderOption={(prop, option: any) => (
          <li {...prop} key={option.id}>
            {option.label}
          </li>
        )}
        minChars={0}
        onChange={(_, value: any) => {
          setFieldValue('board', '');
          setFieldValue('medium', '');
          setFieldValue('class', '');
          setFieldValue('academicYear', value?.id || '');
        }}
        error={!!(touched.academicYear && errors.academicYear)}
        helperText={(touched.academicYear && errors.academicYear) || ''}
        fullWidth
        sx={{ maxWidth: 'unset' }}
        size="small"
      />
    </ShakingTextField>
  );
};

export default RenderAcademicYear;
