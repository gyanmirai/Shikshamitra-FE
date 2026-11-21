import { lazy, Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';

const PdfCanvas = lazy(() => import('./pdf-canvas'));

export default function PdfPreview({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
  usePageSelector = false,
  initialPage = 1,
  onPageChange,
  onPageCountChange,
  preservePageOnUpdate = false,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
  usePageSelector?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (count: number) => void;
  preservePageOnUpdate?: boolean;
}) {
  return (
    <Suspense fallback={<Skeleton aria-label="Loading PDF viewer" height={400} />}>
      <PdfCanvas
        key={preservePageOnUpdate ? undefined : url}
        url={url}
        title={title}
        showPageText={showPageText}
        controlsPosition={controlsPosition}
        hideControlsForSinglePage={hideControlsForSinglePage}
        usePageSelector={usePageSelector}
        initialPage={initialPage}
        onPageChange={onPageChange}
        onPageCountChange={onPageCountChange}
        preservePageOnUpdate={preservePageOnUpdate}
      />
    </Suspense>
  );
}
