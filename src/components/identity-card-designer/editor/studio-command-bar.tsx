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
  layersId,
  configurationId,
}: {
  view: ReturnType<typeof useStudioView>;
  studio: StudioController;
  photo: ReturnType<typeof useStudioPhoto>;
  props: IdentityCardDesignerProps;
  layersId: string;
  configurationId: string;
}) {
  const { zoom, setZoom } = view;
  return (
    <StudioToolbar
      controller={studio}
      zoom={zoom}
      onZoomChange={setZoom}
      onFit={view.fitCanvas}
      disabled={props.disabled}
      viewControls={
        <StudioHeader
          view={view}
          widthMm={props.layout.widthMm}
          heightMm={props.layout.heightMm}
          backSideEnabled={props.backSideEnabled}
          photo={photo}
          photoRecords={props.photoRecords}
          disabled={props.disabled}
          layersId={layersId}
          configurationId={configurationId}
        />
      }
    />
  );
}
