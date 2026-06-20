import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type {
  ProviderSettingFormValues,
  ChannelProviderSettingDto,
} from 'src/redux/communication/communicationTypes';

export type IProviderSetting = ChannelProviderSettingDto;

export interface IProviderSettingTableProps {
  data: IProviderSetting[];
  isLoading?: boolean;
  onAddProvider: UseBooleanReturn;
  setEditData: (val: IProviderSetting | null) => void;
  onDelete: (row: IProviderSetting) => void;
  onEdit: (row: IProviderSetting) => void;
}

export interface IProviderSettingFormProps {
  open: { value: boolean; onTrue: () => void; onFalse: () => void };
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: IProviderSetting | null;
}

export type IProviderSettingFormValues = ProviderSettingFormValues;
