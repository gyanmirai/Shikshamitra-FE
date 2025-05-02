import type { IHostelIncident } from '../logDisciplinaryIncident/type';

export interface IArchivedIncidentTableProps {
  data: IHostelIncident[];
  editData?: IHostelIncident | null;
  setEditData: (value: IHostelIncident | null) => void;
  onView: (data: IHostelIncident) => void;
}
