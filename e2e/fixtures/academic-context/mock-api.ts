export const years = [
  { id: 'year-26', name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31' },
  { id: 'year-25', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31' },
];
export const boards = [
  {
    id: 'gseb',
    name: 'GSEB',
    academicYearId: 'year-25',
    educationMediums: [
      { id: 'gujarati', name: 'Gujarati', educationBoardId: 'gseb', educationMediumStages: [] },
    ],
  },
  {
    id: 'cbse',
    name: 'CBSE',
    academicYearId: 'year-25',
    educationMediums: [
      { id: 'english', name: 'English', educationBoardId: 'cbse', educationMediumStages: [] },
    ],
  },
];
export const fixtureState = { restricted: false, scopeFailure: false, requests: [] as string[] };

export function installFixture() {
  Object.assign(window, { fixtureAcademicRequests: fixtureState.requests });
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const path = new URL(request.url, window.location.origin).pathname;
    if (!path.startsWith('/api/')) return realFetch(input, init);
    fixtureState.requests.push(`${request.method} ${path}`);
    let body: unknown;
    if (path === '/api/app/academic-year') body = { items: years, totalCount: years.length };
    else if (path === '/api/app/education-board')
      body = { items: boards, totalCount: boards.length };
    else if (path === '/api/app/user-scope/user-scope-hierarchy') {
      if (fixtureState.scopeFailure)
        return Response.json({ detail: 'Scope unavailable' }, { status: 403 });
      body = {
        userId: 'fixture-staff',
        userName: 'fixture-staff',
        isAdmin: false,
        accessibleHierarchy: years.map((year) => ({
          academicYearId: year.id,
          academicYearName: year.name,
          hasFullBoardAccess: !fixtureState.restricted,
          boards:
            fixtureState.restricted && year.id === 'year-25'
              ? [
                  {
                    boardId: 'gseb',
                    boardName: 'GSEB',
                    hasAccess: true,
                    hasFullMediumAccess: true,
                    mediums: [],
                  },
                ]
              : [],
        })),
      };
    } else return Response.json({ detail: `Unexpected fixture request: ${path}` }, { status: 404 });
    return Response.json(body);
  };
}
