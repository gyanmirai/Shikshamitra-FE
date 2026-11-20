import { useGetMemberBorrowHistoryQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { MemberRecordTable } from './MemberRecordTable';
import { useMemberRecordPage } from './useMemberRecordPage';

import type { IMember } from '../type';

export default function BorrowHistory({ member }: { member: IMember | null }) {
  const pagination = useMemberRecordPage(member?.id);
  const query = useGetMemberBorrowHistoryQuery(pagination.args, {
    skip: pagination.skip,
    refetchOnMountOrArgChange: true,
  });
  return <MemberRecordTable kind="history" query={query} pagination={pagination} />;
}
