import { it, expect, describe } from 'vitest';

import { buildChapterMultipartPayload } from './chapterMultipartPayload';

describe('buildChapterMultipartPayload', () => {
  it('keeps stored document identifiers in JSON and sends new files as multipart parts', () => {
    const firstFile = new File(['first'], 'lesson-plan.pdf', { type: 'application/pdf' });
    const secondFile = new File(['second'], 'diagram.png', { type: 'image/png' });

    const formData = buildChapterMultipartPayload(
      { chapterNo: 4, chapterName: 'Fractions' },
      ['stored-document.pdf', firstFile, secondFile]
    );

    expect(JSON.parse(String(formData.get('Payload')))).toEqual({
      chapterNo: 4,
      chapterName: 'Fractions',
      documents: ['stored-document.pdf'],
    });
    expect(formData.getAll('Files')).toEqual([firstFile, secondFile]);
  });

  it('still creates a multipart request when no new files are selected', () => {
    const formData = buildChapterMultipartPayload(
      { chapterNo: 1 },
      ['existing-one.pdf', 'existing-two.docx']
    );

    expect(JSON.parse(String(formData.get('Payload')))).toMatchObject({
      documents: ['existing-one.pdf', 'existing-two.docx'],
    });
    expect(formData.getAll('Files')).toHaveLength(0);
  });
});
