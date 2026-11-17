import { StudioHeader } from './studio-header';
import { StudioToolbar } from '../studio/studio-toolbar';

import type { useStudioView } from './use-studio-view';
import type { useStudioPhoto } from './use-studio-photo';
import type { IdentityCardDesignerProps } from '../types';
import type { StudioController } from '../studio/use-card-studio';

export function StudioCommandBar({
  view,
  studio,
  photo,
  props,
}: {
  view: ReturnType<typeof useStudioView>;
  studio: StudioController;
  photo: ReturnType<typeof useStudioPhoto>;
  props: IdentityCardDesignerProps;
}) {
  const { side, setSide, guides, setGuides, snap, setSnap, layers, setLayers, zoom, setZoom } =
    view;
  return (
    <>
      <StudioHeader
        widthMm={props.layout.widthMm}
        heightMm={props.layout.heightMm}
        side={side}
        onSideChange={setSide}
        backSideEnabled={props.backSideEnabled}
        guides={guides}
        onGuidesChange={setGuides}
        snap={snap}
        onSnapChange={setSnap}
        layers={layers}
        onLayersChange={setLayers}
        photo={photo}
        photoRecords={props.photoRecords}
        disabled={props.disabled}
      />
      <StudioToolbar
        controller={studio}
        zoom={zoom}
        onZoomChange={setZoom}
        onFit={view.fitCanvas}
        disabled={props.disabled}
      />
    </>
  );
}
