import { useGetMemberBorrowedBooksQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { MemberRecordTable } from './MemberRecordTable';
import { useMemberRecordPage } from './useMemberRecordPage';

import type { IMember } from '../type';

export default function IssuedBooks({ member }: { member: IMember | null }) {
  const pagination = useMemberRecordPage(member?.id);
  const query = useGetMemberBorrowedBooksQuery(pagination.args, {
    skip: pagination.skip,
    refetchOnMountOrArgChange: true,
  });
  return <MemberRecordTable kind="borrowed" query={query} pagination={pagination} />;
}
