import CustomSelect from 'src/components/custom-select';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

const RenderBoard = (props: any) => {
  // Destructure formik from props
  const { formik, isEdit } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch board data using custom hook, returns data and loading state
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const filteredBoard = board?.items?.filter(
    (item: any) => item.academicYearId === values.academicYear
  );

  return (
    <ShakingTextField error={!!(touched.board && errors.board) || false}>
      <CustomSelect
        name="board"
        label="Board *"
        isLoading={boardLoading}
        options={filteredBoard || []}
        disabled={!values.academicYear || !isEdit}
        labelKey="name"
        valueKey="id"
        value={values.board}
        onBlur={formik.handleBlur}
        onChange={(value) => {
          setFieldValue('board', value);
          setFieldValue('medium', null);
          setFieldValue('class', null);
        }}
        error={!!(touched.board && errors.board) || false}
        helperText={(touched.board && errors.board) || ''}
        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
      />
    </ShakingTextField>
  );
};

export default RenderBoard;
