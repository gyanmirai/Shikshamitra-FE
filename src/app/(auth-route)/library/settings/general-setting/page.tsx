import { redirect } from 'next/navigation';

export default function LibraryGeneralSettingRedirect() {
  redirect('/library/settings/borrowing-and-return-rules');
}
