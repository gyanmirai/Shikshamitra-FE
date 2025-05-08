import type { IMyResources } from '../my-resources/my-resources-interface';

export interface IMyRequestResourceTableProps {
  onClick: (data: IMyResources | null, eventName: string) => void;
}
