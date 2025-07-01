import type { Board } from 'src/types/school';

import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

const RenderMedium = (props: any) => {
  // Destructure formik from props
  const { formik, isEdit } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch board data using custom hook, returns data and loading state
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <CustomSelect
      name="medium"
      label="Medium *"
      isLoading={boardLoading}
      disabled={!values.board || !isEdit}
      options={
        board?.items?.find((item: Board) => item.id === values.board)?.educationMediums || []
      }
      value={values.medium}
      labelKey="name"
      valueKey="id"
      onBlur={formik.handleBlur}
      onChange={(value) => {
        setFieldValue('medium', value);
        setFieldValue('class', null);
        formik.setFieldTouched('medium', true, false);
      }}
      error={!!(touched.medium && errors.medium) || false}
      helperText={(touched.medium && errors.medium) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

export default RenderMedium;
