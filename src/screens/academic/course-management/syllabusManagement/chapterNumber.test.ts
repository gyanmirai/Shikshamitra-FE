import { it, expect, describe } from 'vitest';

import {
  getChapterNumberApiError,
  CHAPTER_NUMBER_RANGE_MESSAGE,
  CHAPTER_NUMBER_REQUIRED_MESSAGE,
} from './chapterNumber';

describe('getChapterNumberApiError', () => {
  it('maps an indexed JSON conversion failure to an actionable range error', () => {
    const error = {
      data: {
        errors: {
          input: ['The input field is required.'],
          '$[0].chapterNo': ['The JSON value could not be converted to System.Int32.'],
        },
      },
    };

    expect(getChapterNumberApiError(error)).toBe(CHAPTER_NUMBER_RANGE_MESSAGE);
  });

  it('maps a backend required error to the chapter number field', () => {
    const error = {
      data: {
        errors: {
          ChapterNo: ['Chapter Number is required'],
        },
      },
    };

    expect(getChapterNumberApiError(error)).toBe(CHAPTER_NUMBER_REQUIRED_MESSAGE);
  });

  it('maps a backend range validation response to the chapter number field', () => {
    const error = {
      data: {
        errors: {
          '[0].ChapterNo': ['Chapter Number must be between 1 and 1000'],
        },
      },
    };

    expect(getChapterNumberApiError(error)).toBe(CHAPTER_NUMBER_RANGE_MESSAGE);
  });

  it('ignores validation errors belonging to other fields', () => {
    const error = {
      data: {
        errors: {
          ChapterName: ['Chapter Name is required'],
        },
      },
    };

    expect(getChapterNumberApiError(error)).toBeUndefined();
  });
});
