import { communicationPath } from 'src/routes/paths';

const communicationModule = {
  [communicationPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/communication/dashboard',
          _action: 'dashboard',
          shortcutKey: 'Alt+C+1',
          shortcutKeyName: 'Alt+C+1',
        },
        // {
        //   title: 'Conversation',
        //   path: '/communication/messages',
        //   _action: 'conversation',
        //   shortcutKey: 'Alt+C+M',
        //   shortcutKeyName: 'Alt+C+M',
        // },
        {
          title: 'Announcements',
          path: '/communication/announcement',
          _action: 'announcement',
          shortcutKey: 'Alt+C+A',
          shortcutKeyName: 'Alt+C+A',
          // children: [
          //   {
          //     title: 'School Announcement',
          //     path: '/communication/announcement/schoolWiseAnnounsement',
          //     _action: 'announcement-schoolWiseAnnounsement',
          //     shortcutKey: 'Alt+C+A+1',
          //     shortcutKeyName: 'Alt+C+A+1',
          //   },
          //   {
          //     title: 'Class Announcement',
          //     path: '/communication/announcement/classSpecificAnnouncement',
          //     _action: 'announcement-classSpecificAnnouncement',
          //     shortcutKey: 'Alt+C+A+2',
          //     shortcutKeyName: 'Alt+C+A+2',
          //   },
          // ],
        },
        // {
        //   title: 'Events',
        //   path: '/communication/eventsAndCalendar',
        //   _action: 'eventsAndCalendar',
        //   shortcutKey: 'Alt+C+E',
        //   shortcutKeyName: 'Alt+C+E',
        // },
        // {
        //   title: 'Feedback & Survey',
        //   path: '/communication/feedbackAndSurvey',
        //   _action: 'feedbackAndSurvey',
        //   shortcutKey: 'Alt+C+F',
        //   shortcutKeyName: 'Alt+C+F',
        //   children: [
        //     {
        //       title: 'Scheduled Survey',
        //       path: '/communication/feedbackAndSurvey/scheduledSurvey',
        //       _action: 'feedbackAndSurvey-scheduledSurvey',
        //       shortcutKey: 'Alt+C+F+1',
        //       shortcutKeyName: 'Alt+C+F+1',
        //     },
        //     {
        //       title: 'Active Survey',
        //       path: '/communication/feedbackAndSurvey/activeSurvey',
        //       _action: 'feedbackAndSurvey-activeSurvey',
        //       shortcutKey: 'Alt+C+F+2',
        //       shortcutKeyName: 'Alt+C+F+2',
        //     },
        //     {
        //       title: 'Past Survey',
        //       path: '/communication/feedbackAndSurvey/pastSurvey',
        //       _action: 'feedbackAndSurvey-pastSurvey',
        //       shortcutKey: 'Alt+C+F+3',
        //       shortcutKeyName: 'Alt+C+F+3',
        //     },
        //   ],
        // },
        // {
        //   title: 'Meetings',
        //   path: '/communication/meetings',
        //   _action: 'meetings',
        //   shortcutKey: 'Alt+C+T',
        //   shortcutKeyName: 'Alt+C+T',
        // },
        // {
        //   title: 'Holidays',
        //   path: '/communication/holidays',
        //   _action: 'meetings',
        //   shortcutKey: 'Alt+C+T',
        //   shortcutKeyName: 'Alt+C+T',
        // },
        {
          title: 'Notification',
          path: '',
          _action: 'notification',
          shortcutKey: 'Alt+C+N',
          shortcutKeyName: 'Alt+C+N',
          children: [
            {
              title: 'Sent Notification',
              path: '/communication/notification/send-notification',
              _action: 'send-notification',
              shortcutKey: 'Alt+C+N+1',
              shortcutKeyName: 'Alt+C+N+1',
            },
            {
              title: 'Templates',
              path: '/communication/notification/templates',
              _action: 'templates',
              shortcutKey: 'Alt+C+T',
              shortcutKeyName: 'Alt+C+T',
            },
            {
              title: 'Notification Setting',
              path: '/communication/notification/notificationSetting',
              _action: 'notification-setting',
              shortcutKey: 'Alt+C+N+3',
              shortcutKeyName: 'Alt+C+N+3',
            },
          ],
        },
        {
          title: 'Notification History',
          path: '/communication/notification-history',
          _action: 'notification-history',
          shortcutKey: 'Alt+C+H',
          shortcutKeyName: 'Alt+C+H',
        },
        {
          title: 'Settings',
          path: '/communication/settings',
          _action: 'settings',
          shortcutKey: 'Alt+C+S',
          shortcutKeyName: 'Alt+C+S',
          children: [
            {
              title: 'Announcement Type',
              path: '/communication/settings/announcementType',
              _action: 'settings-announcementType',
              shortcutKey: 'Alt+C+S+5',
              shortcutKeyName: 'Alt+C+S+5',
            },
            // {
            //   title: 'Event Type',
            //   path: '/communication/settings/eventType',
            //   _action: 'settings-eventType',
            //   shortcutKey: 'Alt+C+S+4',
            //   shortcutKeyName: 'Alt+C+S+4',
            // },
            // {
            //   title: 'Holiday Type',
            //   path: '/communication/settings/holidayType',
            //   _action: 'settings-holidayType',
            //   shortcutKey: 'Alt+C+S+6',
            //   shortcutKeyName: 'Alt+C+S+6',
            // },
            // {
            //   title: 'Importance Level',
            //   path: '/communication/settings/importanceLevel',
            //   _action: 'settings-importanceLevel',
            //   shortcutKey: 'Alt+C+S+9',
            //   shortcutKeyName: 'Alt+C+S+9',
            // },
            // {
            //   title: 'Delivery Channel Type',
            //   path: '/communication/settings/deliveryChannelType',
            //   _action: 'settings-deliveryChannelType',
            //   shortcutKey: 'Alt+C+S+0',
            //   shortcutKeyName: 'Alt+C+S+0',
            // },
          ],
        },
      ],
    },
  ],
};

export default communicationModule;
