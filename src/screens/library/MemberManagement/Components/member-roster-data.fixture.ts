import type { LibraryMemberStatistics } from 'src/redux/library/member-statistics-types';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

type RosterDto = {
  id: string;
  memberName: string;
  memberIdentifier: string;
  role: string;
  classDivision: string;
  rollNo: string;
  grNo: string;
  statistics: LibraryMemberStatistics;
};
export const rosterApi = 'http://library.test/api/library/members';
export const rosterMember: RosterDto = {
  id: '00000000-0000-0000-0000-000000000001',
  memberName: 'First Roster Person',
  memberIdentifier: 'CARD/0001',
  role: 'Student',
  classDivision: 'Grade-1-A',
  rollNo: '1',
  grNo: '41',
  statistics: {
    currentIssue: 2,
    overdueReturnBooks: 0,
    reservedBooks: 1,
    overdueClassificationAvailable: true,
    unknownDueDateCount: 0,
    overdueAsOfDate: '2026-11-18',
    overdueDateSource: 'ConfirmedLibraryClock',
  },
};
export const rosterRows = Array.from({ length: 21 }, (_, index) => ({
  ...rosterMember,
  id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
  memberName:
    index === 0
      ? rosterMember.memberName
      : index === 10
        ? 'Second Page Person'
        : index === 20
          ? 'Maya José'
          : `Roster Person ${index + 1}`,
  memberIdentifier: `CARD/${String(index + 1).padStart(4, '0')}`,
}));
export function rosterResponse(
  items: RosterDto[] = [rosterMember],
  totalCount = items.length,
  page = 1,
  pageSize = 10
) {
  return {
    items,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
export function serveRoster(requests: URL[], rows = rosterRows) {
  mswServer.use(
    http.get(rosterApi, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const visible = rows.filter((row) => row.memberName.toLowerCase().includes(search));
      const skip = Number(url.searchParams.get('skipCount') || 0);
      const take = Number(url.searchParams.get('maxResultCount') || 10);
      return HttpResponse.json(
        rosterResponse(
          visible.slice(skip, skip + take),
          visible.length,
          Math.floor(skip / take) + 1,
          take
        )
      );
    })
  );
}
