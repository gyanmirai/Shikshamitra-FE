import type { IZoneArea } from './type';

export const getZoneAreaInitialValues = (editData: IZoneArea | null) => ({
  zoneName: editData?.zoneName || '',
  description: editData?.description || '',
});
