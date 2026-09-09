import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { loadIcons, _api as iconifyApi } from '@iconify/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import ChapterTable from './chapterTable';

import type { IChapter } from '../type';

export const chaptersUrl = '*/api/academic/curriculum/chapters';
export const diariesUrl = '*/api/academic/curriculum/teacher-diaries';
export const chapter: IChapter = {
  id: 'chapter-one',
  chapterName: 'Core Maths ONE',
  chapterNumber: 1,
  chapterStartTime: '2099-09-10',
  chapterEndTime: '2099-09-15',
  standardId: 'class-12',
  subjectId: 'mathematics',
  description: '',
  creatorId: 'teacher',
  creationTime: '2026-09-08',
  lastModifierId: 'teacher',
  lastModificationTime: '2026-09-08',
  lessonPlanStatus: 'Linked',
};

function DivisionChapters({ divisionId }: { divisionId: string }) {
  const dialog = useBoolean();
  const { data = [], isFetching } = useGetChaptersByStandardQuery({
    standardId: chapter.standardId,
    subjectId: chapter.subjectId,
    divisionId,
  });
  return (
    <section aria-label={divisionId}>
      <ChapterTable
        data={data}
        isLoading={isFetching}
        addChapterDialog={dialog}
        setEditData={() => {}}
        onDelete={() => {}}
        onViewDocuments={() => {}}
        handleEyeClick={() => {}}
        actions={() => <span />}
      />
    </section>
  );
}

export async function prepareChapterNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  await new Promise<void>((resolve) => {
    loadIcons(['solar:export-bold', 'fluent:filter-12-filled'], (_loaded, _missing, pending) => {
      if (!pending.length) resolve();
    });
  });
}

export function renderDivisionChapters() {
  const store = configureStore({
    reducer: { confirmPopup: confirmPopupReducer, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <DivisionChapters divisionId="division-a" />
        <DivisionChapters divisionId="division-b" />
      </ThemeProvider>
    </Provider>
  );
  return { ...view, store };
}
