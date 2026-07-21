import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { IFeeHeadResponse } from 'src/redux/feeCategory/feeCategoryApi';

// incomeHeadId is not part of the backend Fee Head contract yet; kept optional here so the
// existing Income Head field on this screen keeps compiling until that gap is addressed.
export type IFeeHead = IFeeHeadResponse & { incomeHeadId?: string };

export interface IFeeHeadTableProps {
  data: IFeeHead[];
  isLoading: boolean;
  onAddFeeHead: any;
  editData: IFeeHead | null;
  setEditData: (value: IFeeHead | null) => void;
  onEdit: (row: IFeeHead) => void;
  onDelete: (row: IFeeHead) => void;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
