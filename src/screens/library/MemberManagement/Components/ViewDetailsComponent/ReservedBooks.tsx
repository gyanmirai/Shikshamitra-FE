import { useGetMemberReservedBooksQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { MemberRecordTable } from './MemberRecordTable';
import { useMemberRecordPage } from './useMemberRecordPage';

import type { IMember } from '../type';

export default function ReservedBooks({ member }: { member: IMember | null }) {
  const pagination = useMemberRecordPage(member?.id);
  const query = useGetMemberReservedBooksQuery(pagination.args, {
    skip: pagination.skip,
    refetchOnMountOrArgChange: true,
  });
  return <MemberRecordTable kind="reserved" query={query} pagination={pagination} />;
}
