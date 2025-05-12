import type { IResourceMeasurementUnitFormValues } from './resource-measurement-unit-interface';

export function getResourceMeasurementUnitInitialValues(
  data: Partial<IResourceMeasurementUnitFormValues> | null = null
): IResourceMeasurementUnitFormValues {
  return {
    resourceMeasurementUnit: data?.resourceMeasurementUnit || '',
    resourceMeasurementUnitDescription: data?.resourceMeasurementUnitDescription || '',
  };
}
