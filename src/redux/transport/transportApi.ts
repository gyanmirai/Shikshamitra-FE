import { api } from 'src/redux/service';
import { transportType } from 'src/redux/tagTypes';

import vehicleManagementData from '../../json/transport/transportModuleData.json';


export const transportApi = api.injectEndpoints({
  endpoints: () => ({}),
});
