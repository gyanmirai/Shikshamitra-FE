import { it, expect, describe } from 'vitest';

import {
  admissionPipelineUrl,
  readAdmissionPipelineState,
  admissionPipelineApplicationUrl,
} from './admission-pipeline-state';

describe('Pipeline navigation state', () => {
  it('restores shareable search, queue, filters, sort and pagination', () => {
    expect(
      readAdmissionPipelineState(
        new URLSearchParams(
          'search=Jay&queue=my&stage=ASSESSMENT&status=4&page=3&size=10&sort=enteredAt&direction=desc'
        )
      )
    ).toEqual({
      search: 'Jay',
      myCases: true,
      assignedCounsellorId: undefined,
      currentStageCode: 'ASSESSMENT',
      status: 4,
      page: 2,
      rowsPerPage: 10,
      sorts: [{ column: 'enteredAt', direction: 'desc' }],
    });
  });
  it('rejects terminal status, invalid page, unsupported size and unknown sort', () => {
    expect(
      readAdmissionPipelineState(
        new URLSearchParams('status=11&page=-1&size=100000&sort=unsafe&queue=other')
      )
    ).toMatchObject({
      status: undefined,
      page: 0,
      rowsPerPage: 25,
      sorts: [],
      myCases: undefined,
    });
    expect(readAdmissionPipelineState(new URLSearchParams('status='))).toMatchObject({
      status: undefined,
    });
  });
  it('resets page for filter changes while preserving unrelated academic context', () => {
    expect(
      admissionPipelineUrl(
        new URLSearchParams('board=board-id&medium=medium-id&page=4&size=25&search=old'),
        { search: 'new' }
      )
    ).toBe('/student/admissions/pipeline?board=board-id&medium=medium-id&size=25&search=new');
  });
  it('keeps pagination when continuing an application and encodes the return query once', () => {
    const target = admissionPipelineApplicationUrl(
      'app-id',
      new URLSearchParams('queue=all&search=Jay+Singh&page=2')
    );
    expect(new URL(target, 'https://school.test').searchParams.get('returnTo')).toBe(
      '/student/admissions/pipeline?queue=all&search=Jay+Singh&page=2'
    );
  });
});
