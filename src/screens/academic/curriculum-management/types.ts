import type { Dayjs } from 'dayjs';

export interface TSubject {
  name: string;
  color: string;
}

export interface TCurriculum {
  id: number;
  className: string;
  curriculumName: string;
  subjects: TSubject[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  scheduleDate: Dayjs | null;
  status: string;
}

export interface CurriculumFormProps {
  setSearchParams?: any;
  onSubmit: (values: TCurriculum) => void;
  onClose: () => void;
  data: TCurriculum | null;
  isEdit: boolean;
}
