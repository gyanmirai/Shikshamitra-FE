import { api } from 'src/redux/service';
import { libraryModuleType } from 'src/redux/tagTypes';

export const libraryModuleApi = api.injectEndpoints({
  endpoints: () => ({}), // inject later
});
