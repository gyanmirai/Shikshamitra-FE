import { it, expect, describe } from 'vitest';

import { normalizeRequiredDocumentRows } from './vehicleDocumentDataApi';
import {
  stopManagementApi,
  buildStopListRequest,
  normalizeStopListResponse,
} from './stop-management-api';
import {
  routeManagementApi,
  buildRouteListRequest,
  buildRouteStopsRequest,
  normalizeRouteListResponse,
} from './route-management-api';
import {
  routeStopApi,
  buildSuggestedRoutesRequest,
  buildRouteStopAssignRequest,
  buildApplicationStatusRequest,
} from './routeStopApi';
import {
  driverConductorApi,
  buildStaffListRequest,
  buildStaffOptionsRequest,
  normalizeStaffListResponse,
} from './driver-conductor-api';
import {
  vehicleManagementApi,
  buildVehicleListRequest,
  buildVehicleOptionsRequest,
  normalizeVehicleListResponse,
} from './vehicle-management-api';
import {
  memberManageApi,
  buildTransportCandidateRequest,
  buildTransportMemberListRequest,
  normalizeTransportCandidateResponse,
  buildTransportApplicationListRequest,
  normalizeTransportApplicationListResponse,
} from './member-manage-api';
import {
  dashboardReportApi,
  buildTransportReportRowsRequest,
  buildTransportAiReportPlanRequest,
  buildTransportReportExportRequest,
  buildTransportReportCatalogRequest,
  buildTransportDashboardAlertsRequest,
  buildTransportDashboardSummaryRequest,
} from './dashboard-report-api';
import {
  vehicleSettingsApi,
  buildFeeRunListRequest,
  buildFeeDuesListRequest,
  buildZoneAreaListRequest,
  buildFuelTypeListRequest,
  buildVehicleTypeListRequest,
  buildFeeConfigurationRequest,
  buildFeeFrequencyOptionsRequest,
  buildTransportMemberDuesRequest,
} from './vehicleSettingsApi';

describe('transport stop and route API contracts', () => {
  it('builds the stop list request with default pagination when params are omitted', () => {
    expect(buildStopListRequest()).toEqual({
      url: '/transport/stops',
      method: 'GET',
      params: {
        pageNumber: 1,
        pageSize: 10,
        search: undefined,
        zoneId: undefined,
        status: undefined,
        academicMediumId: undefined,
      },
    });
  });

  it('preserves stop list filters including academic medium and inactive status', () => {
    expect(
      buildStopListRequest({
        pageNumber: 2,
        pageSize: 25,
        search: 'central',
        zoneId: 'zone-1',
        status: 1,
        academicMediumId: 'medium-1',
      })
    ).toEqual({
      url: '/transport/stops',
      method: 'GET',
      params: {
        pageNumber: 2,
        pageSize: 25,
        search: 'central',
        zoneId: 'zone-1',
        status: 1,
        academicMediumId: 'medium-1',
      },
    });
  });

  it('normalizes backend paged stop responses into screen data', () => {
    expect(
      normalizeStopListResponse({
        data: {
          items: [{ id: 'stop-1', stopName: 'Central Stop' }],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [{ id: 'stop-1', stopName: 'Central Stop' }],
      totalCount: 1,
    });
  });

  it('builds route and route-stop requests against canonical transport URLs', () => {
    expect(buildRouteListRequest({ academicMediumId: 'medium-1', search: 'north' })).toEqual({
      url: '/transport/routes',
      method: 'GET',
      params: {
        pageNumber: 1,
        pageSize: 10,
        search: 'north',
        status: undefined,
        academicMediumId: 'medium-1',
      },
    });

    expect(buildRouteStopsRequest({ routeId: 'route-1', academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/routes/route-1/stops',
      method: 'GET',
      params: { page: 1, academicMediumId: 'medium-1' },
    });
  });

  it('normalizes backend paged route responses into screen data', () => {
    expect(
      normalizeRouteListResponse({
        data: {
          items: [{ id: 'route-1', routeName: 'North Route' }],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [{ id: 'route-1', routeName: 'North Route' }],
      totalCount: 1,
    });
  });

  it('exposes stop and route CRUD/status endpoints', () => {
    expect(stopManagementApi.endpoints.getStops).toBeTruthy();
    expect(stopManagementApi.endpoints.createStop).toBeTruthy();
    expect(stopManagementApi.endpoints.updateStop).toBeTruthy();
    expect(stopManagementApi.endpoints.changeStopStatus).toBeTruthy();

    expect(routeManagementApi.endpoints.getRoutes).toBeTruthy();
    expect(routeManagementApi.endpoints.createRoute).toBeTruthy();
    expect(routeManagementApi.endpoints.updateRoute).toBeTruthy();
    expect(routeManagementApi.endpoints.assignStopsToRoute).toBeTruthy();
    expect(routeManagementApi.endpoints.assignVehicleToRoute).toBeTruthy();
    expect(routeManagementApi.endpoints.deleteVehicleAssignment).toBeTruthy();
    expect(routeManagementApi.endpoints.changeRouteStatus).toBeTruthy();
  });

  it('builds vehicle list requests against the canonical transport URL', () => {
    expect(
      buildVehicleListRequest({
        academicMediumId: 'medium-1',
        search: 'gj-01',
        status: 2,
        vehicleTypeId: 'type-1',
        fuelTypeId: 'fuel-1',
      })
    ).toEqual({
      url: '/transport/vehicles',
      method: 'GET',
      params: {
        pageNumber: 1,
        pageSize: 10,
        search: 'gj-01',
        status: 2,
        vehicleTypeId: 'type-1',
        fuelTypeId: 'fuel-1',
        academicMediumId: 'medium-1',
      },
    });
  });

  it('normalizes backend paged vehicle responses into the active table shape', () => {
    expect(
      normalizeVehicleListResponse({
        data: {
          items: [{ id: 'vehicle-1', registrationNo: 'GJ01AB1234' }],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [{ id: 'vehicle-1', registrationNo: 'GJ01AB1234' }],
      totalCount: 1,
    });
  });

  it('builds vehicle and staff option requests for route assignment', () => {
    expect(
      buildVehicleOptionsRequest({ academicMediumId: 'medium-1', onlyAssignable: true })
    ).toEqual({
      url: '/transport/vehicles/options',
      method: 'GET',
      params: { academicMediumId: 'medium-1', onlyAssignable: true },
    });

    expect(
      buildStaffOptionsRequest({ academicMediumId: 'medium-1', role: 0, onlyAssignable: true })
    ).toEqual({
      url: '/transport/staff/options',
      method: 'GET',
      params: { academicMediumId: 'medium-1', role: 0, onlyAssignable: true },
    });
  });

  it('builds and normalizes transport staff list requests', () => {
    expect(
      buildStaffListRequest({
        academicMediumId: 'medium-1',
        pageNumber: 2,
        pageSize: 25,
        search: 'driver',
        role: 0,
        status: 1,
      })
    ).toEqual({
      url: '/transport/staff',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        pageNumber: 2,
        pageSize: 25,
        search: 'driver',
        role: 0,
        status: 1,
      },
    });

    expect(
      normalizeStaffListResponse({
        data: {
          items: [{ id: 'staff-1', name: 'Driver One' }],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [{ id: 'staff-1', name: 'Driver One' }],
      totalCount: 1,
    });
  });

  it('builds vehicle settings requests with academic medium scope', () => {
    expect(buildVehicleTypeListRequest({ academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/vehicle-types',
      method: 'GET',
      params: { academicMediumId: 'medium-1' },
    });

    expect(buildFuelTypeListRequest({ academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/fuel-types',
      method: 'GET',
      params: { academicMediumId: 'medium-1' },
    });
  });

  it('builds transport billing settings requests against canonical URLs', () => {
    expect(buildFeeConfigurationRequest({ academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/fee-configuration',
      method: 'GET',
      params: { academicMediumId: 'medium-1' },
    });

    expect(buildFeeFrequencyOptionsRequest()).toEqual({
      url: '/transport/fee-frequency-options',
      method: 'GET',
    });

    expect(buildZoneAreaListRequest({ academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/zones-areas',
      method: 'GET',
      params: { academicMediumId: 'medium-1' },
    });
  });

  it('builds transport fee run and dues requests with default paging', () => {
    expect(
      buildFeeRunListRequest({ academicMediumId: 'medium-1', academicYearId: 'year-1' })
    ).toEqual({
      url: '/transport/fees/runs',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        pageNumber: 1,
        pageSize: 10,
        status: undefined,
        periodFrom: undefined,
        periodTo: undefined,
      },
    });

    expect(
      buildFeeDuesListRequest({
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        runId: 'run-1',
        memberType: 0,
      })
    ).toEqual({
      url: '/transport/fees/dues',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        pageNumber: 1,
        pageSize: 10,
        memberType: 0,
        status: undefined,
        routeId: undefined,
        stopId: undefined,
        runId: 'run-1',
      },
    });

    expect(
      buildTransportMemberDuesRequest({
        memberId: 'member-1',
        academicMediumId: 'medium-1',
      })
    ).toEqual({
      url: '/transport/members/member-1/dues',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        pageNumber: 1,
        pageSize: 10,
      },
    });
  });

  it('normalizes required vehicle document rows for the vehicle form', () => {
    expect(
      normalizeRequiredDocumentRows({
        data: [{ id: 'doc-1', name: 'Insurance', maxSizeMb: 5 }],
      })
    ).toEqual([
      {
        key: 0,
        id: 'doc-1',
        requiredDocumentId: 'doc-1',
        name: 'Insurance',
        maxSizeMb: 5,
      },
    ]);
  });

  it('exposes vehicle core and settings endpoints', () => {
    expect(vehicleManagementApi.endpoints.getVehicleManagementData).toBeTruthy();
    expect(vehicleManagementApi.endpoints.addVehicle).toBeTruthy();
    expect(vehicleManagementApi.endpoints.updateVehicle).toBeTruthy();
    expect(vehicleManagementApi.endpoints.changeVehicleStatus).toBeTruthy();
    expect(vehicleManagementApi.endpoints.getVehicleDocuments).toBeTruthy();
    expect(vehicleManagementApi.endpoints.uploadVehicleDocument).toBeTruthy();
    expect(vehicleManagementApi.endpoints.downloadVehicleDocument).toBeTruthy();
    expect(vehicleManagementApi.endpoints.addMaintenanceRecord).toBeTruthy();
    expect(vehicleManagementApi.endpoints.getVehicleOptions).toBeTruthy();

    expect(driverConductorApi.endpoints.getDriverConductorData).toBeTruthy();
    expect(driverConductorApi.endpoints.addDriverConductor).toBeTruthy();
    expect(driverConductorApi.endpoints.updateDriverConductor).toBeTruthy();
    expect(driverConductorApi.endpoints.changeDriverConductorStatus).toBeTruthy();
    expect(driverConductorApi.endpoints.getStaffOptions).toBeTruthy();

    expect(vehicleSettingsApi.endpoints.getVehicleTypes).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addVehicleType).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getVehicleDocuments).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addVehicleDocument).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getServiceTypes).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addServiceType).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getFuelTypes).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addFuelType).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getFeeConfiguration).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addFeeConfiguration).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.updateFeeConfiguration).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getZoneAreaOptions).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.addZoneAreaOptions).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.updateZoneAreaOptions).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.deleteZoneAreaOptions).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.previewFeeRun).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.createFeeRun).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getFeeRuns).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getFeeRun).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.postFeeRunToFinance).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getTransportFeeDues).toBeTruthy();
    expect(vehicleSettingsApi.endpoints.getTransportMemberDues).toBeTruthy();
  });

  it('builds transport application and member requests against canonical URLs', () => {
    expect(
      buildTransportApplicationListRequest({
        academicMediumId: 'medium-1',
        memberType: 0,
        status: 3,
        applicationType: 1,
      })
    ).toEqual({
      url: '/transport/applications',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        pageNumber: 1,
        pageSize: 10,
        search: undefined,
        memberType: 0,
        status: 3,
        applicationType: 1,
      },
    });

    expect(buildTransportCandidateRequest({ academicMediumId: 'medium-1', memberType: 1 })).toEqual(
      {
        url: '/transport/member-candidates',
        method: 'GET',
        params: {
          academicMediumId: 'medium-1',
          memberType: 1,
          search: undefined,
          pageNumber: 1,
          pageSize: 10,
          excludeExisting: true,
        },
      }
    );

    expect(
      buildTransportMemberListRequest({ academicMediumId: 'medium-1', routeId: 'route-1' })
    ).toEqual({
      url: '/transport/members',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        pageNumber: 1,
        pageSize: 10,
        search: undefined,
        memberType: undefined,
        status: undefined,
        routeId: 'route-1',
        stopId: undefined,
      },
    });
  });

  it('normalizes transport application and candidate responses for screens', () => {
    expect(
      normalizeTransportApplicationListResponse({
        data: {
          items: [
            {
              id: 'app-1',
              memberType: 1,
              sourceId: 'emp-1',
              employeeId: 'emp-1',
              name: 'Employee One',
              memberCode: 'EMP001',
              requestedStopName: 'Central Stop',
              status: 0,
            },
          ],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [
        expect.objectContaining({
          id: 'app-1',
          employeeId: 'emp-1',
          sourceId: 'emp-1',
          name: 'Employee One',
          grNo: 'EMP001',
          searchStop: 'Central Stop',
          status: 0,
        }),
      ],
      totalCount: 1,
    });

    expect(
      normalizeTransportCandidateResponse({
        data: {
          items: [{ sourceId: 'student-1', memberType: 0, name: 'Student One', memberCode: 'GR1' }],
          totalCount: 1,
        },
      })
    ).toEqual({
      data: [
        expect.objectContaining({
          id: 'student-1',
          studentId: 'student-1',
          sourceId: 'student-1',
          name: 'Student One',
          grNo: 'GR1',
        }),
      ],
      totalCount: 1,
    });
  });

  it('builds route-stop review requests against canonical URLs', () => {
    expect(
      buildRouteStopAssignRequest({
        applicationId: 'app-1',
        academicMediumId: 'medium-1',
        body: { routeId: 'route-1', stopId: 'stop-1' },
      })
    ).toEqual({
      url: '/transport/applications/app-1/route-stop',
      method: 'PUT',
      params: { academicMediumId: 'medium-1' },
      body: { routeId: 'route-1', stopId: 'stop-1' },
    });

    expect(
      buildApplicationStatusRequest({
        applicationId: 'app-1',
        academicMediumId: 'medium-1',
        body: { status: 1, remarks: 'Approved' },
      })
    ).toEqual({
      url: '/transport/applications/app-1/status',
      method: 'PUT',
      params: { academicMediumId: 'medium-1' },
      body: { status: 1, remarks: 'Approved' },
    });

    expect(
      buildSuggestedRoutesRequest({ applicationId: 'app-1', academicMediumId: 'medium-1' })
    ).toEqual({
      url: '/transport/applications/app-1/suggested-routes',
      method: 'GET',
      params: { academicMediumId: 'medium-1' },
    });
  });

  it('exposes transport application, member, and route-stop endpoints', () => {
    expect(memberManageApi.endpoints.getTransportMembers).toBeTruthy();
    expect(memberManageApi.endpoints.getTransportMemberCandidates).toBeTruthy();
    expect(memberManageApi.endpoints.addTransportMember).toBeTruthy();
    expect(memberManageApi.endpoints.updateTransportApplication).toBeTruthy();
    expect(routeStopApi.endpoints.getSuggestedRouteData).toBeTruthy();
    expect(routeStopApi.endpoints.postRouteStopData).toBeTruthy();
    expect(routeStopApi.endpoints.statusRouteStopData).toBeTruthy();
  });

  it('builds transport dashboard and report requests against canonical URLs', () => {
    expect(
      buildTransportDashboardSummaryRequest({
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
      })
    ).toEqual({
      url: '/transport/dashboard/summary',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
      },
    });

    expect(
      buildTransportDashboardAlertsRequest({
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        category: 'Assignment',
      })
    ).toEqual({
      url: '/transport/dashboard/alerts',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        pageNumber: 1,
        pageSize: 10,
        category: 'Assignment',
        severity: undefined,
      },
    });

    expect(buildTransportReportCatalogRequest({ academicMediumId: 'medium-1' })).toEqual({
      url: '/transport/reports/catalog',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
      },
    });

    expect(
      buildTransportReportRowsRequest({
        reportKey: 'route-master',
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        status: 'Active',
      })
    ).toEqual({
      url: '/transport/reports/route-master',
      method: 'GET',
      params: {
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        pageNumber: 1,
        pageSize: 10,
        fromDate: undefined,
        toDate: undefined,
        routeId: undefined,
        stopId: undefined,
        vehicleId: undefined,
        staffId: undefined,
        memberType: undefined,
        status: 'Active',
      },
    });

    const exportRequest = buildTransportReportExportRequest({
      reportKey: 'route-master',
      academicMediumId: 'medium-1',
    });
    expect(exportRequest.url).toBe('/transport/reports/route-master/export');
    expect(exportRequest.method).toBe('GET');
    expect(exportRequest.params).toEqual(
      expect.objectContaining({ academicMediumId: 'medium-1', format: 'csv' })
    );
    expect(exportRequest.responseHandler).toBeTruthy();

    expect(
      buildTransportAiReportPlanRequest({
        prompt: 'Show active route capacity this month',
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        clarificationAnswers: [],
      })
    ).toEqual({
      url: '/transport/reports/ai/plan',
      method: 'POST',
      body: {
        prompt: 'Show active route capacity this month',
        academicMediumId: 'medium-1',
        academicYearId: 'year-1',
        clarificationAnswers: [],
      },
    });
  });

  it('exposes transport dashboard and report endpoints', () => {
    expect(dashboardReportApi.endpoints.getTransportDashboardSummary).toBeTruthy();
    expect(dashboardReportApi.endpoints.getTransportDashboardAlerts).toBeTruthy();
    expect(dashboardReportApi.endpoints.getTransportReportCatalog).toBeTruthy();
    expect(dashboardReportApi.endpoints.getTransportReport).toBeTruthy();
    expect(dashboardReportApi.endpoints.exportTransportReport).toBeTruthy();
    expect(dashboardReportApi.endpoints.createTransportAiReportPlan).toBeTruthy();
  });
});
