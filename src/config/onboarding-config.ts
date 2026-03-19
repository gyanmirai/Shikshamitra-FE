import type { DriveStep } from 'driver.js';

export const onboardingSteps: DriveStep[] = [
  {
    element: '[data-onboarding="academic-year"]',
    popover: {
      title: 'Select Academic Year',
      description:
        'Choose the academic year you want to work in. All records such as students, subjects, attendance, and exams will be managed based on the selected academic year.',
      side: 'bottom',
      align: 'center',
    },
    disableActiveInteraction: false,
  },
  {
    element: '#onboarding-sidebar',
    popover: {
      title: 'Main Navigation Menu',
      description:
        'Use this sidebar to navigate through different modules of the system such as Students, Academics, Library, Transport, and more. Click any module to open and manage its features.',
      side: 'right',
      align: 'start',
    },
    disableActiveInteraction: true,
  },
  {
    element: '[aria-label="Institute Setup"]',
    popover: {
      title: 'Institute Setup',
      description:
        'Start by configuring your institute structure here. Set up boards, mediums, standards, divisions.',
      side: 'right',
      align: 'center',
    },
    disableActiveInteraction: true,
  },
  {
    element: '#onboarding-user-profile',
    popover: {
      title: 'User Profile & Settings',
      description:
        'Access your profile settings from here. You can update your account details, change your password, and log out of the system when needed.',
      side: 'bottom',
      align: 'end',
      doneBtnText: 'Finish',
    },
    disableActiveInteraction: true,
  },
];
