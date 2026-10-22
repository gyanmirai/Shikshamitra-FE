import type { IData } from 'src/components/customizabaleTable/types';

import { getSubjectMasterStatusLabel } from '../subjectMasterStatus';

import type { ISubject } from './type';

export const getSubjectTableRows = (subjects: ISubject[] = []): ISubject[] =>
  subjects.map((subject) => ({
    ...subject,
    status: getSubjectMasterStatusLabel(subject.status),
  }));

export const getSubjectNameSearchValue = (value: unknown, row: IData): string =>
  `${value ?? ''} ${row.displayName ?? ''}`;
