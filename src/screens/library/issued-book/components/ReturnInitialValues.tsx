import dayjs from 'dayjs';

export const buildInitialBookReturnValues = (data?: any) => ({
  memberId: data?.memberId ?? '',
  memberName: data?.memberName ?? '',
  bookCategory: data?.bookCategory ?? 'Text Book',
  bookTitle: data?.bookTitle ?? '',
  edition: data?.edition ?? '',
  className: data?.className ?? '',
  division: data?.division ?? '',
  studentName: data?.studentName ?? '',
  issueDate: data?.issueDate ?? dayjs(),
  dueDate: data?.dueDate ?? dayjs().add(7, 'day'),
  quantity: data?.quantity ?? 1,
  bookCondition: data?.bookCondition ?? '',
  isFixed: data?.isFixed ?? false,
  fineAmount: data?.fineAmount ?? 0,
  returnDate: data?.returnDate ?? null,
});
