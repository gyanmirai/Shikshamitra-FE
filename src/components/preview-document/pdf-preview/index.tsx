import { lazy, Suspense } from 'react';
import Skeleton from '@mui/material/Skeleton';

const PdfCanvas = lazy(() => import('./pdf-canvas'));

export default function PdfPreview({ url, title }: { url: string; title: string }) {
  return (
    <Suspense fallback={<Skeleton aria-label="Loading PDF viewer" height={400} />}>
      <PdfCanvas key={url} url={url} title={title} />
    </Suspense>
  );
}
