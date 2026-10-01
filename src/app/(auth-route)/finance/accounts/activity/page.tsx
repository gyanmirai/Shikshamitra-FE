import { redirect } from 'next/navigation';
import { financePaths } from 'src/constants/finance-menu';

export const metadata = { title: 'Income & Expenses' };

export default function Page() {
  redirect(financePaths.accounts.incomeAndExpense);
}
