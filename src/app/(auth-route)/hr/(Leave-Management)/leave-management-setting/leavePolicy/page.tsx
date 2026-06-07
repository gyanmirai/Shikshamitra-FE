import { redirect } from 'next/navigation';
import { hrPaths } from 'src/constants/hr-menus';

const page = () => redirect(hrPaths.policies.leavePolicies);

export default page;
