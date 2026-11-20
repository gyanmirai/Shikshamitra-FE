import { bookCategoryType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

import type { LibraryCopyMoveOptions } from './copy-lifecycle-types';
import type { CatalogueConfiguration } from './catalogue-configuration-types';

export type LibraryBookEditorOptions = {
  bookCategories: { id: string; name: string }[];
  sections: LibraryCopyMoveOptions['sections'];
  catalogueConfiguration?: CatalogueConfiguration | null;
};

export const libraryBookEditorApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryBookEditorOptions: builder.query<
      LibraryBookEditorOptions,
      { academicYearId: string }
    >({
      query: (params) => ({ url: '/library/books/editor-options', params }),
      providesTags: [bookCategoryType.bookCategory, librarySettingsType.librarySettings],
    }),
  }),
  overrideExisting: false,
});
export const { useGetLibraryBookEditorOptionsQuery, useLazyGetLibraryBookEditorOptionsQuery } =
  libraryBookEditorApi;
