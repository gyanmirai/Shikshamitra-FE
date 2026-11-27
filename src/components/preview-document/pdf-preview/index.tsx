import { lazy, Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';

import type { PdfPreviewReveal } from './find-pdf-preview-target';

const PdfCanvas = lazy(() => import('./pdf-canvas'));

export default function PdfPreview({
  url,
  title,
  showPageText = true,
  controlsPosition = 'top',
  hideControlsForSinglePage = false,
  usePageSelector = false,
  separateZoomControls = false,
  showAdjacentPage = false,
  initialPage = 1,
  onPageChange,
  onPageCountChange,
  preservePageOnUpdate = false,
  reveal,
  onReveal,
}: {
  url: string;
  title: string;
  showPageText?: boolean;
  controlsPosition?: 'top' | 'bottom';
  hideControlsForSinglePage?: boolean;
  usePageSelector?: boolean;
  separateZoomControls?: boolean;
  showAdjacentPage?: boolean;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (count: number) => void;
  preservePageOnUpdate?: boolean;
  reveal?: PdfPreviewReveal;
  onReveal?: (id: number, page?: number, marker?: HTMLDivElement | null) => void;
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
        separateZoomControls={separateZoomControls}
        showAdjacentPage={showAdjacentPage}
        initialPage={initialPage}
        onPageChange={onPageChange}
        onPageCountChange={onPageCountChange}
        preservePageOnUpdate={preservePageOnUpdate}
        reveal={reveal}
        onReveal={onReveal}
      />
    </Suspense>
  );
}
