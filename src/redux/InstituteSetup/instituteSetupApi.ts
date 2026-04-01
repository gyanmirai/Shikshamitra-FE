import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

export const instituteSetupApi = api.injectEndpoints({
  endpoints: () => ({}), // inject later
});
