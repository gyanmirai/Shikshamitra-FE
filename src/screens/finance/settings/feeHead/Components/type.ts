import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { IFeeHeadResponse } from 'src/redux/feeCategory/feeCategoryApi';

import type { IParams } from 'src/components/customizabaleTable/types';

export type IFeeHead = IFeeHeadResponse;

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
  filters?: IParams['filters'];
  onServerFilter?: (filters: IParams['filters']) => void;
  page?: number;
  rowsPerPage?: number;
}

export interface IFeeHeadFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IFeeHead | null;
}
