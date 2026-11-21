import { MemberProfile } from '../MemberManagement/Components/MemberProfile';

import type { IMember } from '../MemberManagement/Components/type';

export function LoanMemberDetails({ member }: { member: IMember }) {
  return (
    <MemberProfile
      member={{ ...member, role: member.role === 'Employee' ? 'Staff' : member.role }}
    />
  );
}
