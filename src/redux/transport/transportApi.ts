import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import vehicleManagementData from '../../json/transport/transportModuleData.json';

const isDev = process.env.NODE_ENV === 'development';

export const transportApi = createApi({
  reducerPath: 'transportApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/vehicleManagementData':
            return { data: vehicleManagementData.vehicleManagementData };
          case '/documentRows':
            return { data: vehicleManagementData.documentRows };
          case '/vehicleTypeOptions':
            return { data: vehicleManagementData.vehicleTypeOptions };
          case '/fuelTypeOptions':
            return { data: vehicleManagementData.fuelTypeOptions };
          case '/insurance':
            return { data: vehicleManagementData.insurance };
          case '/driver':
            return { data: vehicleManagementData.driver };
          case '/documents':
            return { data: vehicleManagementData.documents };
          case '/maintenanceHistoryData':
            return { data: vehicleManagementData.maintenanceHistoryData };
          case '/vehicleInformation':
            return { data: vehicleManagementData.vehicleInformation };
          case '/serviceTypes':
            return { data: vehicleManagementData.serviceTypes };
          case '/vehicleTypes':
            return { data: vehicleManagementData.vehicleTypes };
          case '/licenceTypes':
            return { data: vehicleManagementData.licenceTypes };
          case '/fuelTypes':
            return { data: vehicleManagementData.fuelTypes };
          case '/vehicleDocuments':
            return { data: vehicleManagementData.vehicleDocuments };
          case '/routeHistoryData':
            return { data: vehicleManagementData.routeHistoryData };
          case '/driverHistoryData':
            return { data: vehicleManagementData.driverHistoryData };
          case '/maintenanceData':
            return { data: vehicleManagementData.maintenanceData };
          case '/driverConductorData':
            return { data: vehicleManagementData.driverConductorData };
          case '/availableRoutes':
            return { data: vehicleManagementData.availableRoutes };
          case '/documentDetailsData':
            return { data: vehicleManagementData.documentDetailsData };
          case '/stopManagementData':
            return { data: vehicleManagementData.stopManagementData };
          case '/routeAssignedStudentData':
            return { data: vehicleManagementData.routeAssignedStudentData };
          case '/routeStopsData':
            return { data: vehicleManagementData.routeStopsData };
          case '/availableVehiclesData':
            return { data: vehicleManagementData.availableVehiclesData };
          case '/vehicleHistoryData':
            return { data: vehicleManagementData.vehicleHistoryData };
          case '/driverConductorHistoryData':
            return { data: vehicleManagementData.driverConductorHistoryData };
          case '/assignableVehiclesData':
            return { data: vehicleManagementData.assignableVehiclesData };
          case '/selectableDriversData':
            return { data: vehicleManagementData.selectableDriversData };
          case '/selectableConductorsData':
            return { data: vehicleManagementData.selectableConductorsData };
          case '/routeTypeOptions':
            return { data: vehicleManagementData.routeTypeOptions };
          case '/locationOptions':
            return { data: vehicleManagementData.locationOptions };
          case '/routeManagementData':
            return { data: vehicleManagementData.routeManagementData };
          case '/stopBasedFeeData':
            return { data: vehicleManagementData.stopBasedFeeData };
          case '/distanceCalculationOptions':
            return { data: vehicleManagementData.distanceCalculationOptions };
          case '/frequencyOptions':
            return { data: vehicleManagementData.frequencyOptions };
          case '/zoneBasedFeeData':
            return { data: vehicleManagementData.zoneBasedFeeData };
          case '/availableStopsOptions':
            return { data: vehicleManagementData.availableStopsOptions };
          case '/zoneAreas':
            return { data: vehicleManagementData.zoneAreas };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this route',
              },
            };
        }
      },
  tagTypes: [
    'VehicleManagement',
    'DocumentRows',
    'VehicleTypeOptions',
    'FuelTypeOptions',
    'Insurance',
    'Driver',
    'Documents',
    'documentDetailsData',
    'VehicleDocuments',
    'VehicleTypes',
    'ServiceTypes',
    'LicenceTypes',
    'FuelTypes',
    'MaintenanceHistory',
    'routeHistoryData',
    'DriverHistory',
    'DriverConductorData',
    'MaintenanceData',
    'AvailableRoutes',
    'StopManagement',
    'RouteAssignedStudentData',
    'RouteStopsData',
    'VehicleHistoryData',
    'DriverConductorHistoryData',
    'AvailableVehicles',
    'AssignableVehicles',
    'SelectableDrivers',
    'SelectableConductors',
    'RouteTypeOptions',
    'LocationOptions',
    'RouteManagementData',
    'StopBasedFeeData',
    'DistanceCalculationOptions',
    'FrequencyOptions',
    'ZoneBasedFeeData',
    'AvailableStopsOptions',
    'ZoneAreaOptions',
  ],
  endpoints: () => ({}),
});
