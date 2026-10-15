import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { BoardEnum } from 'src/enums/board';

import { getConfiguredBoardTypes, getCustomBoardNameError } from './board-options-model';

export type BoardFormValues = {
  board: string;
  customName: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
};
export type BoardFormProps = {
  handleClose: () => void;
  handleSetTeb?: (value: Record<string, unknown>) => void;
  editData:
    (Pick<Board, 'id' | 'type' | 'customName'> & { startDate?: string; endDate?: string }) | null;
  academicYearId: string | number;
  boards?: readonly Board[];
  academicYear?: { startDate?: string; endDate?: string; name?: string } | null;
};

export const getBoardValidationSchema = (
  props: BoardFormProps,
  yearStart: dayjs.Dayjs | null,
  yearEnd: dayjs.Dayjs | null
) => {
  const withinYear = (value: Date | null | undefined) => {
    if (!value || !yearStart || !yearEnd) return true;
    const date = dayjs(value);
    return !date.isBefore(yearStart, 'day') && !date.isAfter(yearEnd, 'day');
  };
  return Yup.object({
    board: Yup.string()
      .required('Board is required.')
      .test(
        'available-board',
        'This board is already added to the academic year.',
        (value) =>
          !value ||
          !getConfiguredBoardTypes(
            props.boards ?? [],
            String(props.academicYearId),
            props.editData?.id
          ).includes(value)
      ),
    customName: Yup.string().when('board', {
      is: String(BoardEnum.Custom),
      then: (schema) =>
        schema.test('unique-custom-name', 'Invalid custom board name.', function (value) {
          const error = getCustomBoardNameError(
            value ?? '',
            props.boards ?? [],
            String(props.academicYearId),
            props.editData?.id
          );
          return error ? this.createError({ message: error }) : true;
        }),
    }),
    startDate: Yup.date()
      .nullable()
      .required('Start Date is required.')
      .typeError('Start Date is required.')
      .test(
        'board-start-within-year',
        yearStart && yearEnd
          ? `Start Date must be within the academic year (${yearStart.format('DD MMM YYYY')} – ${yearEnd.format('DD MMM YYYY')}).`
          : 'Start Date must be within the academic year.',
        withinYear
      ),
    endDate: Yup.date()
      .nullable()
      .required('End Date is required.')
      .typeError('End Date is required.')
      .min(Yup.ref('startDate'), 'End Date must be on or after Start Date.')
      .test(
        'board-end-within-year',
        yearStart && yearEnd
          ? `End Date must be within the academic year (${yearStart.format('DD MMM YYYY')} – ${yearEnd.format('DD MMM YYYY')}).`
          : 'End Date must be within the academic year.',
        withinYear
      ),
  });
};
