export interface IResourceMeasurementUnitFormValues {
  resourceMeasurementUnit: string;
  resourceMeasurementUnitDescription: string;
}

export interface IResourceMeasurementUnitDialogProps {
  isEdit: boolean;
  data: IResourceMeasurementUnitFormValues | null;
  onClose: () => void;
}
