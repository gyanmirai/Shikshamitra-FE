import { TextField, Autocomplete } from '@mui/material';
import { useGetAllStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

const RenderStudent = ({ formik, ...props }: any) => {
  const { data: students } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentsQuery,
  });
  console.log(students);
  return (
    <Autocomplete
      disabled={!props.isEdit}
      // loading={isLoading}
      noOptionsText="No Student Found"
      fullWidth
      value={formik.values.sponsorStudent}
      onChange={(e, value: any) => {
        formik.setFieldValue('sponsorStudent', value);
      }}
      options={students?.items || []}
      getOptionLabel={(option: any) => `${option.firstName || ''} ${option.lastName || ''}`}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Student Referrer"
          placeholder="Search Student Referrer"
          fullWidth
        />
      )}
      renderOption={(prop: any, option: any) => (
        <li {...prop} key={option.id}>
          {option.firstName || ''} {option.lastName || ''}
        </li>
      )}
    />
  );
};

export default RenderStudent;
