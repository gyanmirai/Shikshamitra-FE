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
    'VehicleDocuments',
    'VehicleTypes',
    'ServiceTypes',
    'LicenceTypes',
    'FuelTypes',
    'MaintenanceHistory',
  ],
  endpoints: () => ({}),
});
