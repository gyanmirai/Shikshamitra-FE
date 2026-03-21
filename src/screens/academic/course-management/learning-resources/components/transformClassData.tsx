import { dummyData } from './treeData';

import type { IClassData } from '../type';

export const transformEachClassAsRoot = (classes: IClassData[]): any[] =>
  classes.map((cls) => ({
    name: cls.name,
    role: 'Class',
    group: cls.name,
    type: 'class',
    children: cls.subjects.map((subj: any) => {
      const chapterDocs = subj.chapters?.flatMap((ch: any) => ch.documents) || [];
      const allDocs = [...subj.documents, ...chapterDocs];
      return {
        name: subj.name,
        role: `${allDocs.length}`,
        group: cls.name,
        type: 'subject',
        color: subj.subjectColor,
      };
    }),
  }));

export const ORGANIZED_CLASS_TREES = transformEachClassAsRoot(dummyData);
