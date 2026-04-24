import { dummyData } from './treeData';

import type { ISubject, IChapter, IClassData } from '../type';

interface ClassTreeNode {
  name: string;
  role: string;
  group: string;
  type: string;
  children?: ClassTreeNode[];
  color?: string;
}

export const transformEachClassAsRoot = (classes: IClassData[]): ClassTreeNode[] =>
  classes.map((cls) => ({
    name: cls.name,
    role: 'Class',
    group: cls.name,
    type: 'class',
    children: cls.subjects.map((subj: ISubject) => {
      const chapterDocs = subj.chapters?.flatMap((ch: IChapter) => ch.documents) || [];
      const allDocs = [...(subj.documents || []), ...chapterDocs];
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
