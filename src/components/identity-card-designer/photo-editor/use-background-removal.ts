import { useRef, useState, useEffect } from 'react';

import { mattePixels } from './pixels';
import { context, makeCanvas } from './image-processing';

export function useBackgroundRemoval(onResult: (mask: HTMLCanvasElement) => void) {
  const workerRef = useRef<Worker | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [percent, setPercent] = useState<number | undefined>();
  const [error, setError] = useState('');
  const resultRef = useRef(onResult); resultRef.current = onResult;
  useEffect(() => () => workerRef.current?.terminate(), []);

  function cancel() {
    workerRef.current?.terminate(); workerRef.current = null;
    setBusy(false); setProgress('Background removal cancelled.'); setPercent(undefined);
  }

  function remove(source: HTMLCanvasElement) {
    if (workerRef.current) return;
    setBusy(true); setError(''); setPercent(undefined); setProgress('Loading background removal');
    try {
      const worker = new Worker(new URL('./matting.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      const fail = () => {
        if (workerRef.current !== worker) return;
        worker.terminate(); workerRef.current = null; setBusy(false);
        setError('Background removal could not finish. Check your connection and retry, or use the erase brush.');
      };
      worker.onerror = fail;
      worker.onmessage = ({ data }) => {
        if (workerRef.current !== worker) return;
        if (data.type === 'progress') {
          setProgress(data.file ? `Downloading ${data.file.split('/').pop()}` : data.status);
          setPercent(typeof data.progress === 'number' ? data.progress : undefined);
        } else if (data.type === 'result') {
          const mask = makeCanvas(data.width, data.height);
          context(mask).putImageData(new ImageData(mattePixels(data.pixels, data.channels), data.width, data.height), 0, 0);
          resultRef.current(mask);
          worker.terminate(); workerRef.current = null; setBusy(false); setProgress('Background removed. Refine edges with the brush.');
        } else if (data.type === 'error') fail();
      };
      const pixels = context(source).getImageData(0, 0, source.width, source.height).data;
      worker.postMessage({ pixels: new Uint8Array(pixels), width: source.width, height: source.height });
    } catch {
      cancel(); setError('Background removal is unavailable in this browser. Use the erase brush instead.');
    }
  }
  function reset() {
    cancel(); setProgress(''); setError('');
  }
  return { busy, progress, percent, error, remove, cancel, reset };
}
