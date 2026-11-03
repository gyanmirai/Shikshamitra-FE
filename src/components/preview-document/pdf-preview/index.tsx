import { lazy, Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';

const PdfCanvas = lazy(() => import('./pdf-canvas'));

export default function PdfPreview({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
}) {
  return (
    <Suspense fallback={<Skeleton aria-label="Loading PDF viewer" height={400} />}>
      <PdfCanvas
        key={url}
        url={url}
        title={title}
        showPageText={showPageText}
        controlsPosition={controlsPosition}
      />
    </Suspense>
  );
}
