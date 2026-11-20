import { redirect } from 'next/navigation';
import { libraryPaths } from 'src/constants/library-menus';

export default function LibraryReportSettingsRedirect() {
  redirect(libraryPaths.reports);
}
