import type { IHostelIncident } from '../log-disciplinary-incident/type';

export interface IArchivedIncidentTableProps {
  data: IHostelIncident[];
  editData?: IHostelIncident | null;
  setEditData: (value: IHostelIncident | null) => void;
  onView: (data: IHostelIncident) => void;
}
