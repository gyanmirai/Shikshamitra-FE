import { describe, expect, it } from 'vitest';

import { academicPermissions } from './academic-menu';

describe('academic curriculum permissions', () => {
  it('keeps syllabus and lesson plan permissions independent', () => {
    expect(academicPermissions.curriculum.chaptersManagement).toBe(
      'Academics.CurriculumManagement.ChapterManagement'
    );
    expect(academicPermissions.curriculum.lessonPlan).toBe(
      'Academics.CurriculumManagement.LessonPlan'
    );
    expect(academicPermissions.curriculum.lessonPlan).not.toBe(
      academicPermissions.curriculum.chaptersManagement
    );
  });
});
