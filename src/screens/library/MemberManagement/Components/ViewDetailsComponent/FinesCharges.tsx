import { useGetMemberChargesQuery } from 'src/redux/library/libraryMembers/memberManagementApi';

import { MemberChargeTable } from './MemberChargeTable';
import { useMemberRecordPage } from './useMemberRecordPage';

import type { IMember } from '../type';

export default function FinesCharges({ member }: { member: IMember | null }) {
  const pagination = useMemberRecordPage(member?.id);
  const query = useGetMemberChargesQuery(pagination.args, {
    skip: pagination.skip,
    refetchOnMountOrArgChange: true,
  });
  return <MemberChargeTable query={query} pagination={pagination} />;
}
