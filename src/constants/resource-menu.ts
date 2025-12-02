import { resourceManagementPath } from 'src/routes/paths';

const resourceManagement = {
  [resourceManagementPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: '/resourceManagement/dashboard',
          _action: 'dashboard',
        },
        {
          title: 'Inventory Management',
          path: '/resourceManagement/inventory-management',
          _action: 'inventory-management',
        },
        {
          title: 'My Resources',
          path: '/resourceManagement/my-resources',
          _action: 'my-resources',
        },
        {
          title: 'My Resource Query',
          path: '/resourceManagement/my-resources-request',
          _action: 'my-resources-request',
        },
        {
          title: 'Review Resource Request',
          path: '/resourceManagement/review-resource-request',
          _action: 'review-resource-request',
        },
        {
          title: 'Order Request',
          path: '/resourceManagement/order-management',
          _action: 'order-management',
        },
        {
          title: 'Maintenance Request',
          path: '/resourceManagement/maintenance-request',
          _action: 'maintenance-request',
        },
        {
          title: 'Disposed Resources',
          path: '/resourceManagement/disposed-resource',
          _action: 'disposed-resource',
        },
        {
          title: 'Resource Allocation',
          path: '/resourceManagement/resource-allocation',
          _action: 'resource-allocation',
          children: [
            {
              title: 'Resource Allocation',
              path: '/resourceManagement/resource-allocation/allocation-of-resources',
              _action: 'allocation-of-resources',
            },
            {
              title: 'Assigned Resources',
              path: '/resourceManagement/resource-allocation/assigned-resource',
              _action: 'assigned-resource',
            },
          ],
        },
        // {
        //   title: 'Classroom & Facilities',
        //   path: '/resourceManagement/classroom-facilities',
        //   _action: 'classroom-facilities',
        // },
        // {
        //   title: 'Booking Management',
        //   path: '/resourceManagement/booking-management',
        //   _action: 'classroom-facilities',
        //   children: [
        //     {
        //       title: 'Book Resource',
        //       path: '/resourceManagement/booking-management/booking',
        //       _action: 'booking',
        //     },
        //     {
        //       title: 'Manage Booking',
        //       path: '/resourceManagement/booking-management/manage-request',
        //       _action: 'manage-request',
        //     },
        //   ],
        // },
        {
          title: 'Procurement & Vendors',
          path: '/resourceManagement/procurement-vendors',
          _action: 'procurement-vendors',
          children: [
            {
              title: 'Procurement Request',
              path: '/resourceManagement/procurement-vendors/procurement-request',
              _action: 'allocation-of-resources',
            },
            {
              title: 'Request Review & Approval',
              path: '/resourceManagement/procurement-vendors/manage-request',
              _action: 'allocation-of-resources',
            },
          ],
        },
        {
          title: 'Report Loss / Damage ',
          path: '/resourceManagement/report-loss-damage',
          _action: 'report-loss-damage',
        },

        {
          title: 'Incident Report',
          path: '/resourceManagement/incident-report',
          _action: 'incident-report',
        },
        {
          title: 'Audit & Verification',
          path: '/resourceManagement/audit-verification',
          _action: 'audit-verification',
        },
        // {
        //   title: 'Usage & Maintenance',
        //   path: '/resourceManagement/usage-maintenance',
        //   _action: 'usage-maintenance',
        // },
        {
          title: 'Reports & Analytics',
          path: '/resourceManagement/reports-analytics',
          _action: 'reports-analytics',
        },
        // {
        //   title: 'Documentation',
        //   path: '/resourceManagement/documentation',
        //   _action: 'documentation',
        // },
        {
          title: 'Settings',
          path: '/resourceManagement/settings',
          _action: 'settings',
          children: [
            {
              title: 'Resource Category',
              path: '/resourceManagement/settings/resource-category',
              _action: 'resource-category',
            },
            {
              title: 'Resource Sub Category',
              path: '/resourceManagement/settings/resource-sub-category',
              _action: 'resource-sub-category',
            },
            {
              title: 'Vendor Configuration',
              path: '/resourceManagement/settings/vendor-configuration',
              _action: 'vendor-configuration',
            },
            {
              title: 'Resource Condition Status',
              path: '/resourceManagement/settings/resource-condition-status',
              _action: 'resource-condition-status',
            },
            {
              title: 'Resource Status',
              path: '/resourceManagement/settings/resource-status',
              _action: 'resource-status',
            },
            {
              title: 'Measurement Unit',
              path: '/resourceManagement/settings/measurement-unit',
              _action: 'measurement-unit',
            },
          ],
        },
      ],
    },
  ],
};

export default resourceManagement;
