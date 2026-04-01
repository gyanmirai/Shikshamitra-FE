import { api } from 'src/redux/service';
import { financeModuleType } from 'src/redux/tagTypes';

export const financeModuleApi = api.injectEndpoints({
  endpoints: () => ({}), // inject later
});
