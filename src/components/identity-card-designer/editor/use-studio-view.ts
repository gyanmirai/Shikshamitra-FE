import { useRef, useState, useCallback } from 'react';

export function useStudioView(backSideEnabled: boolean, brandingContent: unknown) {
  const [requestedSide, setSide] = useState<'front' | 'back'>('front');
  const side = backSideEnabled ? requestedSide : 'front';
  const [tab, setTab] = useState(brandingContent ? 'school' : 'layout');
  const [guides, setGuides] = useState(true);
  const [snap, setSnap] = useState(true);
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const [zoom, setZoom] = useState(1);
  const fitZoom = useRef(1);
  const automaticFit = useRef(true);
  const [layers, setLayers] = useState(false);
  const [configuration, setConfiguration] = useState(true);
  // ResizeObserver needs a stable callback; Fit follows resizing until the user chooses a zoom.
  const measureFit = useCallback((value: number) => {
    fitZoom.current = value;
    if (automaticFit.current) {
      setZoom(value);
    }
  }, []);
  return {
    side,
    setSide,
    tab,
    setTab,
    guides,
    setGuides,
    snap,
    setSnap,
    tool,
    setTool,
    zoom,
    setZoom: (value: number) => {
      automaticFit.current = false;
      setZoom(value);
    },
    fitCanvas: () => {
      automaticFit.current = true;
      setZoom(fitZoom.current);
    },
    layers,
    setLayers,
    configuration,
    setConfiguration,
    fitZoom,
    measureFit,
  };
}
