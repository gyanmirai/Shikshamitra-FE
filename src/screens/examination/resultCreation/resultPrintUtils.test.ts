import { describe, expect, it } from 'vitest';

import { buildStudentResultDocumentTitle } from './resultPrintUtils';

describe('buildStudentResultDocumentTitle', () => {
  it('builds the contextual result document title', () => {
    expect(buildStudentResultDocumentTitle('Mira Chauhan', 'Final Exam')).toBe(
      'Mira_Chauhan_Final_Exam_Result'
    );
  });

  it('removes characters that are invalid in Windows filenames', () => {
    expect(buildStudentResultDocumentTitle('Mira: Chauhan', 'Exam / One?')).toBe(
      'Mira_Chauhan_Exam_One_Result'
    );
  });

  it('uses readable fallbacks when names are missing', () => {
    expect(buildStudentResultDocumentTitle('', null)).toBe('Student_Exam_Result');
  });
});
