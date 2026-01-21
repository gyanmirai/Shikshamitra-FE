import { libraryPath } from 'src/routes/paths';

import menuIconView from './icon-view';
import { defaultModulePermissionName } from './student-menu';

const defaultLibraryPermissionName = 'Library.';

export const libraryPaths = {
  dashboard: '/library/dashboard',
  allBooks: '/library/book-list',
  issueReturn: '/library/issued-books',
  members: '/library/member-management',
  charges: '/library/charges-management',
  reports: '/library/reports',
  notification: '/library/notification',
  settings: {
    root: '',
    bookCategories: '/library/settings/book-category',
    chargeCategories: '/library/settings/charge-type',
    libraryHours: '/library/settings/library-timing',
    borrowingRules: '/library/settings/borrowing-and-return-rules',
    sectionManagement: '/library/settings/sectionManagement',
  },
};

export const libraryPermissions = {
  dashboard: `${defaultModulePermissionName}${defaultLibraryPermissionName}Dashboard`,
  allBooks: `${defaultModulePermissionName}${defaultLibraryPermissionName}AllBooks`,
  issueReturn: `${defaultModulePermissionName}${defaultLibraryPermissionName}IssueReturn`,
  members: `${defaultModulePermissionName}${defaultLibraryPermissionName}LibraryMembers`,
  charges: `${defaultModulePermissionName}${defaultLibraryPermissionName}Charges`,
  reports: `${defaultModulePermissionName}${defaultLibraryPermissionName}Reports`,
  notification: `${defaultModulePermissionName}${defaultLibraryPermissionName}Notification`,
  settings: {
    root: `${defaultModulePermissionName}${defaultLibraryPermissionName}Settings`,
    bookCategories: `${defaultLibraryPermissionName}Settings.BookCategories`,
    chargeCategories: `${defaultLibraryPermissionName}Settings.ChargesCategories`,
    libraryHours: `${defaultLibraryPermissionName}Settings.LibraryHours`,
    borrowingRules: `${defaultLibraryPermissionName}Settings.BorrowingRules`,
    sectionManagement: `${defaultLibraryPermissionName}Settings.SectionManagement`,
  },
};

const libraryModule = {
  [libraryPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: libraryPaths.dashboard,
          _action: 'library-dashboard',
          shortcutKey: 'Alt+L+1',
          shortcutKeyName: 'Alt+L+1',
          permissionName: libraryPermissions.dashboard,
          icon: menuIconView('mdi:view-dashboard-outline'),
        },
        {
          title: 'All Books',
          path: libraryPaths.allBooks,
          _action: 'book-list',
          shortcutKey: 'Alt+L+2',
          shortcutKeyName: 'Alt+L+2',
          permissionName: libraryPermissions.allBooks,
          icon: menuIconView('mdi:book-open-page-variant-outline'),
        },
        // {
        //   title: 'Book List',
        //   path: '/library/book-management',
        //   _action: 'book-management',
        //   shortcutKey: 'Alt+L+2',
        //   shortcutKeyName: 'Alt+L+2',
        // },
        {
          title: 'Issue & Return',
          path: libraryPaths.issueReturn,
          _action: 'issued-books',
          shortcutKey: 'Alt+L+2',
          shortcutKeyName: 'Alt+L+2',
          permissionName: libraryPermissions.issueReturn,
          icon: menuIconView('mdi:book-arrow-left-outline'),
        },
        {
          title: 'Library Members',
          path: libraryPaths.members,
          _action: 'member-management',
          shortcutKey: 'Alt+L+3',
          shortcutKeyName: 'Alt+L+3',
          permissionName: libraryPermissions.members,
          icon: menuIconView('mdi:account-group-outline'),
        },
        {
          title: 'Charges',
          path: libraryPaths.charges,
          _action: 'charges-management',
          shortcutKey: 'Alt+L+2',
          shortcutKeyName: 'Alt+L+2',
          permissionName: libraryPermissions.charges,
          icon: menuIconView('mdi:cash-remove'),
        },
        {
          title: 'Reports',
          path: libraryPaths.reports,
          _action: 'library-reports',
          shortcutKey: 'Alt+L+5',
          shortcutKeyName: 'Alt+L+5',
          permissionName: libraryPermissions.reports,
          icon: menuIconView('mdi:chart-box-outline'),
        },
        {
          title: 'Notification',
          path: libraryPaths.notification,
          _action: 'library-notification',
          shortcutKey: 'Alt+L+N',
          shortcutKeyName: 'Alt+L+N',
          permissionName: libraryPermissions.notification,
          icon: menuIconView('mdi:bell-outline'),
        },
        {
          title: 'Settings',
          path: libraryPaths.settings.root,
          _action: 'library-settings',
          shortcutKey: 'Alt+L+S',
          shortcutKeyName: 'Alt+L+S',
          permissionName: libraryPermissions.settings.root,
          icon: menuIconView('mdi:cog-outline'),
          children: [
            {
              title: 'Book Categories',
              path: libraryPaths.settings.bookCategories,
              _action: 'general-setting',
              shortcutKey: 'Alt+L+S+1',
              shortcutKeyName: 'Alt+L+S+1',
              permissionName: libraryPermissions.settings.bookCategories,
              icon: menuIconView('mdi:shape-outline'),
            },
            {
              title: 'Charges Categories',
              path: libraryPaths.settings.chargeCategories,
              _action: 'general-setting',
              shortcutKey: 'Alt+L+S+2',
              shortcutKeyName: 'Alt+L+S+2',
              permissionName: libraryPermissions.settings.chargeCategories,
              icon: menuIconView('mdi:tag-plus-outline'),
            },
            {
              title: 'Library Hours',
              path: libraryPaths.settings.libraryHours,
              _action: 'general-setting',
              shortcutKey: 'Alt+L+S+3',
              shortcutKeyName: 'Alt+L+S+3',
              permissionName: libraryPermissions.settings.libraryHours,
              icon: menuIconView('mdi:clock-time-four-outline'),
            },
            {
              title: 'Borrowing Rules',
              path: libraryPaths.settings.borrowingRules,
              _action: 'general-setting',
              shortcutKey: 'Alt+L+S+4',
              shortcutKeyName: 'Alt+L+S+4',
              permissionName: libraryPermissions.settings.borrowingRules,
              icon: menuIconView('mdi:gavel'),
            },
            {
              title: 'Section Management',
              path: libraryPaths.settings.sectionManagement,
              _action: 'section-management',
              shortcutKey: 'Alt+L+S+5',
              shortcutKeyName: 'Alt+L+S+5',
              permissionName: libraryPermissions.settings.sectionManagement,
              icon: menuIconView('mdi:view-grid-outline'),
            },
          ],
        },
      ],
    },
  ],
};

export default libraryModule;
