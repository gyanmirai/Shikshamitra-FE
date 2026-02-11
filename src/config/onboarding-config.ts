import type { DriveStep } from 'driver.js';

export const onboardingSteps: DriveStep[] = [
  {
    element: '[data-onboarding="academic-year"]',
    popover: {
      title: 'Academic Year Selection',
      description:
        'You must select an Academic Year to proceed. This is required for all operations.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#onboarding-sidebar',
    popover: {
      title: 'Navigation Menu',
      description: 'Access all modules like Students, Academics, and Finance from this sidebar.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[aria-label="Institute Setup"]',
    popover: {
      title: 'Institute Setup',
      description: 'Configure your institute settings, including academic years and boards.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#onboarding-user-profile',
    popover: {
      title: 'User Profile',
      description: 'Manage your personal settings, password, and logout from here.',
      side: 'bottom',
      align: 'end',
      doneBtnText: 'Finish',
    },
  },
];
