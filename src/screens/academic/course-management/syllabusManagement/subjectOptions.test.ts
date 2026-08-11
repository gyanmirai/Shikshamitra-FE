import { describe, expect, it } from 'vitest';

import { buildSyllabusSubjectOptions, resolveSyllabusSubject } from './subjectOptions';

describe('syllabus subject options', () => {
  it('keeps every active subject when copied elective rows are split across items', () => {
    const items = [
      {
        id: 'assignment-computer',
        status: 1,
        subjectType: 1,
        electiveGroupId: 'pt-computer-group',
        subjects: [{ subjectId: 'computer', subjectName: 'Computer Science' }],
      },
      {
        id: 'assignment-pt',
        status: 1,
        subjectType: 1,
        electiveGroupId: 'pt-computer-group',
        subjects: [{ subjectId: 'pt', subjectName: 'Pt' }],
      },
    ];

    expect(buildSyllabusSubjectOptions(items).map((option) => option.label)).toEqual([
      'Computer Science',
      'Pt',
    ]);
    expect(resolveSyllabusSubject('pt-computer-group::pt', items)).toEqual({
      subjectId: 'pt',
      label: 'Pt',
    });
  });
});
