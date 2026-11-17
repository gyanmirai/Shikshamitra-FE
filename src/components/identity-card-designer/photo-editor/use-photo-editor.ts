import { useState, useEffect } from 'react';

import { DEFAULT_SETTINGS } from './geometry';
import { fullMask, loadPhoto } from './image-processing';
import { useBackgroundRemoval } from './use-background-removal';

export function usePhotoEditor(imageData: string) {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [mask, setMask] = useState<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [version, setVersion] = useState(0);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [before, setBefore] = useState(false);
  const [tool, setTool] = useState<'move' | 'erase' | 'restore'>('move');
  const [brushSize, setBrushSize] = useState(24);
  const removal = useBackgroundRemoval((result) => { setMask(result); setDirty(true); });
  useEffect(() => {
    let active = true;
    loadPhoto(imageData).then((canvas) => {
      if (active) { setSource(canvas); setMask(fullMask(canvas)); }
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [imageData]);

  function reset() {
    removal.reset(); setSettings({ ...DEFAULT_SETTINGS });
    if (source) setMask(fullMask(source));
    setDirty(false); setBefore(false); setTool('move'); setError('');
  }
  function update(next: Partial<typeof settings>) {
    setSettings((current) => ({ ...current, ...next })); setDirty(true);
  }
  return {
    source, mask, settings, version, error, setError, dirty, before, setBefore, tool, setTool,
    brushSize, setBrushSize, removal, update, reset,
    maskChanged: () => { setVersion((value) => value + 1); setDirty(true); },
  };
}

export type PhotoEditorState = ReturnType<typeof usePhotoEditor>;
