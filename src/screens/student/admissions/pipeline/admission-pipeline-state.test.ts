import { it, expect, describe } from 'vitest';

import {
  admissionPipelineUrl,
  readAdmissionPipelineState,
  admissionPipelineApplicationUrl,
} from './admission-pipeline-state';

describe('Pipeline navigation state', () => {
  it('opens and closes a drawer without resetting the underlying list context', () => {
    const params = new URLSearchParams('board=board-id&search=Jay&page=3&size=10');
    const opened = admissionPipelineUrl(params, { application: 'app-id' }, false);
    expect(opened).toBe(
      '/student/admissions/pipeline?board=board-id&search=Jay&page=3&size=10&application=app-id'
    );
    const drawerParams = new URL(opened, 'https://school.test').searchParams;
    expect(admissionPipelineUrl(drawerParams, { application: undefined }, false)).toBe(
      '/student/admissions/pipeline?board=board-id&search=Jay&page=3&size=10'
    );
    const direct = admissionPipelineApplicationUrl('app-id', drawerParams);
    expect(direct).toBe(opened);
  });
  it('restores shareable search, queue, filters, sort and pagination', () => {
    expect(
      readAdmissionPipelineState(
        new URLSearchParams(
          'search=Jay&queue=my&stage=ASSESSMENT&status=4&page=3&size=10&sort=enteredAt&direction=desc'
        )
      )
    ).toEqual({
      search: 'Jay',
      myCases: false,
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
      myCases: false,
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
    const query = new URL(target, 'https://school.test').searchParams;
    expect(query.get('application')).toBe('app-id');
    expect(query.get('search')).toBe('Jay Singh');
    expect(query.get('page')).toBe('2');
    expect(query.get('queue')).toBe('all');
  });
});
