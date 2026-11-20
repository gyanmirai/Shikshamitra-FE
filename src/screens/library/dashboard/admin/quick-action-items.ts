import { libraryPaths, libraryPermissions } from 'src/constants/library-menus';

export const libraryQuickActions = [
  {
    title: 'Issue Book',
    icon: 'solar:hand-stars-bold-duotone',
    color: 'primary',
    href: libraryPaths.issueReturn,
  },
  {
    title: 'Return Book',
    icon: 'solar:restart-square-bold-duotone',
    color: 'info',
    href: libraryPaths.issueReturn,
  },
  { title: 'Add Book', icon: 'solar:book-bold', color: 'success', href: libraryPaths.allBooks },
  {
    title: 'Reservations',
    icon: 'solar:calendar-date-bold-duotone',
    color: 'warning',
    href: libraryPaths.members,
  },
  {
    title: 'Manage Fines',
    icon: 'solar:wallet-money-bold-duotone',
    color: 'error',
    href: libraryPaths.charges,
    permission: libraryPermissions.charges,
  },
];
