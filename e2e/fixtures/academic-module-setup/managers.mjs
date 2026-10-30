import { randomUUID } from 'node:crypto';
import { ids, year, board, medium, standard, paged } from './data.mjs';

const endpoints = [
  [/\/academic-mediums\/[^/]+\/subjects$/, 'subjects', false],
  [/\/academic-mediums\/[^/]+\/elective-groups$/, 'elective-groups', false],
  [/\/timetable\/settings\/weekly-lecture-slots$/, 'weekly-lectures', true],
  [
    /\/timetable\/(?:settings\/lecture-slots|lecture-slots\/by-medium\/[^/]+)$/,
    'lecture-slots',
    true,
  ],
  [/\/homework-type$/, 'homework-types', true],
  [/\/assignment-type$/, 'assignment-types', true],
  [/\/academic\/rubrics$/, 'rubrics', false],
  [/\/examination\/settings\/grading-scales$/, 'grading-scales', true],
  [/\/examination\/settings\/exam-type$/, 'exam-types', true],
];
export async function handleManagers(url, method, body, send, fixture, claims) {
  const path = url.pathname;
  if (method === 'GET' && path === '/api/academic/rubrics/templates/paged') {
    fixture.state.requests.push({ method, path });
    const rows = fixture.state.settings.rubrics ?? [];
    send(200, {
      ...paged(rows),
      page: Number(url.searchParams.get('page') ?? 1),
      pageSize: Number(url.searchParams.get('pageSize') ?? 10),
      summary: {
        total: rows.length,
        published: rows.filter((row) => row.status === 1).length,
        draft: rows.filter((row) => !row.status).length,
        archived: rows.filter((row) => row.status === 2).length,
        linked: rows.filter((row) => row.isUsed).length,
      },
    });
    return true;
  }
  if (path === '/api/app/academic-year') {
    send(200, paged([year]));
    return true;
  }
  if (path === '/api/app/education-board' || path === '/api/app/education-board/hierarchy') {
    send(200, paged([board]));
    return true;
  }
  if (path === '/api/app/user-scope/user-scope-hierarchy') {
    send(200, {
      userId: claims.sub,
      userName: 'Synthetic Academic administrator',
      isAdmin: true,
      fromCache: false,
      generatedAt: '2026-10-28T00:00:00Z',
      accessibleHierarchy: [
        {
          academicYearId: ids.year,
          academicYearName: year.name,
          hasFullBoardAccess: true,
          boards: [],
        },
      ],
    });
    return true;
  }
  if (path === '/api/app/academic-organization-options') {
    send(
      200,
      paged([
        {
          academicYearId: ids.year,
          academicYearName: year.name,
          educationBoardId: ids.board,
          boardId: ids.board,
          boardName: board.name,
          educationMediumId: ids.medium,
          mediumId: ids.medium,
          mediumName: medium.name,
          educationMediumStageId: ids.stage,
          educationMediumStageName: 'Middle school',
          standardId: ids.standard,
          standardName: standard.name,
          divisionId: ids.division,
          divisionName: 'A',
        },
      ])
    );
    return true;
  }
  if (/\/standards\/[^/]+$/.test(path)) {
    send(200, [standard]);
    return true;
  }
  if (path === '/api/app/standard' || path === '/api/app/division') {
    send(200, paged(path.endsWith('/standard') ? [standard] : standard.divisions));
    return true;
  }
  if (path.endsWith('/check-duplicate')) {
    send(200, { hasExactDuplicate: false, hasSimilarDuplicate: false, matches: [] });
    return true;
  }
  const endpoint = endpoints.find(([pattern]) => pattern.test(path));
  if (!endpoint) return false;
  const [, key, isPaged] = endpoint;
  fixture.state.requests.push({ method, path, ...(method !== 'GET' ? { body } : {}) });
  fixture.state.settings[key] ??= [];
  if (method === 'POST') {
    if (fixture.state.saveDelay)
      await new Promise((resolve) => setTimeout(resolve, fixture.state.saveDelay));
    const record = {
      ...body,
      id: randomUUID(),
      isArchived: false,
      isUsed: false,
      createdAt: '2026-10-28T00:00:00Z',
    };
    fixture.state.settings[key].push(record);
    send(200, record);
    return true;
  }
  if (method === 'GET' && key === 'assignment-types') {
    send(200, { data: fixture.state.settings[key] });
    return true;
  }
  send(200, isPaged ? paged(fixture.state.settings[key]) : fixture.state.settings[key]);
  return true;
}
