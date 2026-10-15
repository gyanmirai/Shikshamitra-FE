import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { BoardEnum } from 'src/enums/board';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useAddBoardMutation, useUpdateBoardMutation } from 'src/redux/board/boardApi';

import { getBoardValidationSchema } from './board-form-model';
import { parseAcademicYearDateForPicker } from './academic-year-date-utils';

import type { BoardFormProps, BoardFormValues } from './board-form-model';

export const useBoardForm = (props: BoardFormProps) => {
  const confirm = useBoolean();
  const [addBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBoardMutation,
    popupConfig: { success: true, successMessage: 'Board added successfully' },
  });
  const [updateBoard, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBoardMutation,
    popupConfig: { success: true, successMessage: 'Board updated successfully' },
  });
  const { editData, academicYear, academicYearId, handleClose } = props;
  const yearStart = academicYear?.startDate
    ? parseAcademicYearDateForPicker(academicYear.startDate)
    : null;
  const yearEnd = academicYear?.endDate
    ? parseAcademicYearDateForPicker(academicYear.endDate)
    : null;
  const formik = useFormik<BoardFormValues>({
    initialValues: {
      board: editData?.type?.toString() ?? '',
      customName: editData?.customName ?? '',
      startDate: editData?.startDate ? dayjs(editData.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData.endDate) : null,
    },
    validationSchema: getBoardValidationSchema(props, yearStart, yearEnd),
    onSubmit: () => confirm.onTrue(),
  });
  const onSubmit = async () => {
    const body = {
      type: Number(formik.values.board),
      academicYearId,
      customName:
        Number(formik.values.board) === BoardEnum.Custom
          ? formik.values.customName.trim()
          : undefined,
      startDate: dateConvertor(formik.values.startDate?.format(dateFormat) || '') || '',
      endDate: dateConvertor(formik.values.endDate?.format(dateFormat) || '') || '',
    };
    try {
      if (editData) await updateBoard({ id: editData.id, body }).unwrap();
      else await addBoard(body).unwrap();
      handleClose();
    } catch {
      confirm.onFalse();
    }
  };
  return { formik, confirm, yearStart, yearEnd, onSubmit, saving: isLoading || isUpdateLoading };
};
