import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetCurriculumFileByNameMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { fetchProtectedPreview } from './fetch-protected-preview';

export function useDocumentPreview(open: boolean, url: string, directUrl: boolean) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [directLoading, setDirectLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const [getFile, { isLoading: legacyLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGetCurriculumFileByNameMutation,
    popupConfig: { error: true, errorMessage: 'Unable to load document preview.', success: false },
  });
  useEffect(() => {
    if (!open || !url) return undefined;
    let active = true;
    const controller = new AbortController();
    setPreviewUrl(null);
    setMimeType('');
    const load = async () => {
      try {
        let blob: Blob;
        if (directUrl) {
          setDirectLoading(true);
          blob = await fetchProtectedPreview(url, controller.signal);
        } else {
          const fileName = decodeURIComponent(
            url.split('?')[0].split('/').filter(Boolean).at(-1) || ''
          );
          if (!fileName) throw new Error('Unable to resolve the document filename.');
          blob = await getFile(fileName).unwrap();
        }
        if (!active) return;
        setMimeType(blob.type || '');
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) {
          setPreviewUrl(null);
          if (directUrl) shikshaMitraToast.error({ message: 'Unable to load document preview.' });
        }
      } finally {
        if (active) setDirectLoading(false);
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
    // The legacy wrapper changes identity on render; reload only when its file or retry changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, url, directUrl, retry]);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );
  return {
    previewUrl,
    mimeType,
    isLoading: directUrl ? directLoading : legacyLoading,
    retry: () => setRetry((value) => value + 1),
    clear: () => {
      setPreviewUrl(null);
      setMimeType('');
    },
  };
}
