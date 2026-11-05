import { lazy, Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';

const PdfCanvas = lazy(() => import('./pdf-canvas'));

export default function PdfPreview({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
}) {
  return (
    <Suspense fallback={<Skeleton aria-label="Loading PDF viewer" height={400} />}>
      <PdfCanvas
        key={url}
        url={url}
        title={title}
        showPageText={showPageText}
        controlsPosition={controlsPosition}
        hideControlsForSinglePage={hideControlsForSinglePage}
      />
    </Suspense>
  );
}
