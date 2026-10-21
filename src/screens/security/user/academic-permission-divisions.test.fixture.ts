import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import { renderAcademicPermission } from './academic-permission.test.support';

const boards = [
  {
    id: 'board-1',
    name: 'CBSE',
    academicYearId: 'year-1',
    educationMediums: [
      {
        id: 'medium-1',
        name: 'English',
        educationMediumStages: [
          {
            id: 'stage-1',
            name: 'Primary',
            standards: [
              {
                id: 'std-1',
                name: 'Class 3',
                divisions: [
                  { id: 'div-a', name: 'A' },
                  { id: 'div-b', name: 'B' },
                  { id: 'div-c', name: 'C' },
                ],
              },
              { id: 'std-2', name: 'Class 4', divisions: [{ id: 'div-d', name: 'D' }] },
            ],
          },
        ],
      },
    ],
  },
];

export function renderDivisionPermission(full = false) {
  mswServer.use(
    http.get('*/api/app/education-board', () => HttpResponse.json({ items: boards })),
    http.get('*/api/app/user-scope/user-scope-hierarchy', () =>
      HttpResponse.json({
        accessibleHierarchy: full ? [{ hasFullBoardAccess: true, boards: [] }] : [],
      })
    )
  );
  return renderAcademicPermission();
}
