import { resourceManagementPath } from 'src/routes/paths';

import { defaultModulePermissionName } from './student-menu';

const defaultResourcePermissionName = 'ResourceManagement.';

export const resourcePaths = {
  dashboard: '/resourceManagement/dashboard',
  inventory: '/resourceManagement/inventory-management',
  myResources: '/resourceManagement/my-resources',
  myQuery: '/resourceManagement/my-resources-request',
  orderRequest: '/resourceManagement/order-management',
  maintenanceRequest: '/resourceManagement/maintenance-request',
  disposed: '/resourceManagement/disposed-resource',
  allocation: {
    root: '/resourceManagement/resource-allocation',
    allocate: '/resourceManagement/resource-allocation/allocation-of-resources',
    assigned: '/resourceManagement/resource-allocation/assigned-resource',
  },
  procurement: {
    root: '/resourceManagement/procurement-vendors',
    request: '/resourceManagement/procurement-vendors/procurement-request',
    review: '/resourceManagement/procurement-vendors/manage-request',
  },
  lossDamage: '/resourceManagement/report-loss-damage',
  incidentReport: '/resourceManagement/incident-report',
  audit: '/resourceManagement/audit-verification',
  reports: '/resourceManagement/reports-analytics',
  settings: {
    root: '/resourceManagement/settings',
    category: '/resourceManagement/settings/resource-category',
    subCategory: '/resourceManagement/settings/resource-sub-category',
    vendor: '/resourceManagement/settings/vendor-configuration',
    conditionStatus: '/resourceManagement/settings/resource-condition-status',
    resourceStatus: '/resourceManagement/settings/resource-status',
    measurementUnit: '/resourceManagement/settings/measurement-unit',
  },
};

export const resourcePermissions = {
  dashboard: `${defaultModulePermissionName}${defaultResourcePermissionName}Dashboard`,
  inventory: `${defaultModulePermissionName}${defaultResourcePermissionName}InventoryManagement`,
  myResources: `${defaultModulePermissionName}${defaultResourcePermissionName}MyResources`,
  myQuery: `${defaultModulePermissionName}${defaultResourcePermissionName}MyResourceQuery`,
  orderRequest: `${defaultModulePermissionName}${defaultResourcePermissionName}OrderRequest`,
  maintenanceRequest: `${defaultModulePermissionName}${defaultResourcePermissionName}MaintenanceRequest`,
  disposed: `${defaultModulePermissionName}${defaultResourcePermissionName}DisposedResources`,
  allocation: {
    root: `${defaultModulePermissionName}${defaultResourcePermissionName}ResourceAllocation`,
    allocate: `${defaultResourcePermissionName}ResourceAllocation.AllocationOfResources`,
    assigned: `${defaultResourcePermissionName}ResourceAllocation.AssignedResource`,
  },
  procurement: {
    root: `${defaultModulePermissionName}${defaultResourcePermissionName}ProcurementVendors`,
    request: `${defaultResourcePermissionName}ProcurementVendors.ProcurementRequest`,
    review: `${defaultResourcePermissionName}ProcurementVendors.RequestReviewApproval`,
  },
  lossDamage: `${defaultModulePermissionName}${defaultResourcePermissionName}ReportLossDamage`,
  incidentReport: `${defaultModulePermissionName}${defaultResourcePermissionName}IncidentReport`,
  audit: `${defaultModulePermissionName}${defaultResourcePermissionName}AuditVerification`,
  reports: `${defaultModulePermissionName}${defaultResourcePermissionName}Reports`,
  settings: {
    root: `${defaultModulePermissionName}${defaultResourcePermissionName}Settings`,
    category: `${defaultResourcePermissionName}Settings.ResourceCategory`,
    subCategory: `${defaultResourcePermissionName}Settings.ResourceSubCategory`,
    vendor: `${defaultResourcePermissionName}Settings.VendorConfiguration`,
    conditionStatus: `${defaultResourcePermissionName}Settings.ResourceConditionStatus`,
    resourceStatus: `${defaultResourcePermissionName}Settings.ResourceStatus`,
    measurementUnit: `${defaultResourcePermissionName}Settings.MeasurementUnit`,
  },
};

const resourceManagement = {
  [resourceManagementPath]: [
    {
      subheader: '',
      items: [
        {
          title: 'Dashboard',
          path: resourcePaths.dashboard,
          _action: 'dashboard',
          permissionName: resourcePermissions.dashboard,
        },
        {
          title: 'Inventory Management',
          path: resourcePaths.inventory,
          _action: 'inventory-management',
          permissionName: resourcePermissions.inventory,
        },
        {
          title: 'My Resources',
          path: resourcePaths.myResources,
          _action: 'my-resources',
          permissionName: resourcePermissions.myResources,
        },
        {
          title: 'My Resource Query',
          path: resourcePaths.myQuery,
          _action: 'my-resources-request',
          permissionName: resourcePermissions.myQuery,
        },
        {
          title: 'Order Request',
          path: resourcePaths.orderRequest,
          _action: 'order-management',
          permissionName: resourcePermissions.orderRequest,
        },
        {
          title: 'Maintenance Request',
          path: resourcePaths.maintenanceRequest,
          _action: 'maintenance-request',
          permissionName: resourcePermissions.maintenanceRequest,
        },
        {
          title: 'Disposed Resources',
          path: resourcePaths.disposed,
          _action: 'disposed-resource',
          permissionName: resourcePermissions.disposed,
        },
        {
          title: 'Resource Allocation',
          path: resourcePaths.allocation.root,
          _action: 'resource-allocation',
          permissionName: resourcePermissions.allocation.root,
          children: [
            {
              title: 'Resource Allocation',
              path: resourcePaths.allocation.allocate,
              _action: 'allocation-of-resources',
              permissionName: resourcePermissions.allocation.allocate,
            },
            {
              title: 'Assigned Resources',
              path: resourcePaths.allocation.assigned,
              _action: 'assigned-resource',
              permissionName: resourcePermissions.allocation.assigned,
            },
          ],
        },
        {
          title: 'Procurement & Vendors',
          path: resourcePaths.procurement.root,
          _action: 'procurement-vendors',
          permissionName: resourcePermissions.procurement.root,
          children: [
            {
              title: 'Procurement Request',
              path: resourcePaths.procurement.request,
              _action: 'allocation-of-resources',
              permissionName: resourcePermissions.procurement.request,
            },
            {
              title: 'Request Review & Approval',
              path: resourcePaths.procurement.review,
              _action: 'allocation-of-resources',
              permissionName: resourcePermissions.procurement.review,
            },
          ],
        },
        {
          title: 'Report Loss / Damage ',
          path: resourcePaths.lossDamage,
          _action: 'report-loss-damage',
          permissionName: resourcePermissions.lossDamage,
        },

        {
          title: 'Incident Report',
          path: resourcePaths.incidentReport,
          _action: 'incident-report',
          permissionName: resourcePermissions.incidentReport,
        },
        {
          title: 'Audit & Verification',
          path: resourcePaths.audit,
          _action: 'audit-verification',
          permissionName: resourcePermissions.audit,
        },
        {
          title: 'Reports & Analytics',
          path: resourcePaths.reports,
          _action: 'reports-analytics',
          permissionName: resourcePermissions.reports,
        },
        {
          title: 'Settings',
          path: resourcePaths.settings.root,
          _action: 'settings',
          permissionName: resourcePermissions.settings.root,
          children: [
            {
              title: 'Resource Category',
              path: resourcePaths.settings.category,
              _action: 'resource-category',
              permissionName: resourcePermissions.settings.category,
            },
            {
              title: 'Resource Sub Category',
              path: resourcePaths.settings.subCategory,
              _action: 'resource-sub-category',
              permissionName: resourcePermissions.settings.subCategory,
            },
            {
              title: 'Vendor Configuration',
              path: resourcePaths.settings.vendor,
              _action: 'vendor-configuration',
              permissionName: resourcePermissions.settings.vendor,
            },
            {
              title: 'Resource Condition Status',
              path: resourcePaths.settings.conditionStatus,
              _action: 'resource-condition-status',
              permissionName: resourcePermissions.settings.conditionStatus,
            },
            {
              title: 'Resource Status',
              path: resourcePaths.settings.resourceStatus,
              _action: 'resource-status',
              permissionName: resourcePermissions.settings.resourceStatus,
            },
            {
              title: 'Measurement Unit',
              path: resourcePaths.settings.measurementUnit,
              _action: 'measurement-unit',
              permissionName: resourcePermissions.settings.measurementUnit,
            },
          ],
        },
      ],
    },
  ],
};

export default resourceManagement;
