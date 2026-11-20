import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { DashboardFinancePanel } from '../finance/DashboardFinancePanel';

export default function Financials({ overview }: { overview?: LibraryDashboardOverview }) {
  return <DashboardFinancePanel overview={overview} />;
}
