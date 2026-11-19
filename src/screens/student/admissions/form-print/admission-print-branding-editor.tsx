import type { KeyboardEvent, PointerEvent } from 'react';
import type { AdmissionPrintAssetPlacement } from 'src/redux/student/admissions/admission-form-print-settings';

import { useRef, useState, useEffect } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Stack,
  Switch,
  ButtonBase,
  Typography,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ADMISSION_PRINT_BRANDING_ASPECT,
  resolveAdmissionPrintAdvancedSettings,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { movePrintAsset, resizePrintAsset } from './print-branding-geometry';

import type { AdmissionPrintSettings, AdmissionPrintBranding } from './form-print-model';

type Asset = 'logo' | 'banner';
type Coordinate = 'x' | 'y' | 'width' | 'height';
type Drag = {
  asset: Asset;
  kind: 'move' | 'resize';
  startX: number;
  startY: number;
  placement: AdmissionPrintAssetPlacement;
  pointerId: number;
  width: number;
  height: number;
};

const ASSETS = [
  { key: 'logo', label: 'Logo' },
  { key: 'banner', label: 'Banner' },
] as const;
const COORDINATES = [
  { key: 'x', label: 'X (%)' },
  { key: 'y', label: 'Y (%)' },
  { key: 'width', label: 'Width (%)' },
  { key: 'height', label: 'Height (%)' },
] as const;

function placementAt(drag: Drag, clientX: number, clientY: number) {
  const orig = drag.placement;
  const dx = ((clientX - drag.startX) / drag.width) * 100;
  const dy = ((clientY - drag.startY) / drag.height) * 100;
  if (drag.kind === 'move') return movePrintAsset(orig, orig.x + dx, orig.y + dy);
  return Math.abs(dx / orig.width) >= Math.abs(dy / orig.height)
    ? resizePrintAsset(orig, 'width', orig.width + dx, orig.height + dy)
    : resizePrintAsset(orig, 'height', orig.height + dy, orig.width + dx);
}

function CoordinateInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <NumericFormatCustom
      label={label}
      size="small"
      fullWidth
      value={draft ?? value}
      valueIsNumericString={draft != null}
      decimalScale={1}
      roundToWholeRupees={false}
      prefix=""
      thousandSeparator={false}
      isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
      onValueChange={({ value: next }, source) => {
        if (source.source === 'event') setDraft(next);
      }}
      onBlur={() => {
        if (draft) onCommit(Number(draft));
        setDraft(null);
      }}
    />
  );
}

export function AdmissionPrintBrandingEditor({
  settings,
  branding,
  onChange,
}: {
  settings: AdmissionPrintSettings;
  branding: AdmissionPrintBranding;
  onChange: (settings: AdmissionPrintSettings) => void;
}) {
  const config = resolveAdmissionPrintAdvancedSettings(settings.advanced).branding;
  const visible = {
    logo: settings.showSchoolHeader && config.showLogo ? branding.logoUrl : undefined,
    banner: settings.showSchoolHeader && config.showBanner ? branding.bannerUrl : undefined,
  };
  const [selected, setSelected] = useState<Asset>('banner');
  const [preview, setPreview] = useState<{
    asset: Asset;
    placement: AdmissionPrintAssetPlacement;
  }>();
  const active = visible[selected] ? selected : selected === 'logo' ? 'banner' : 'logo';
  const placement = config[active];
  const band = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
  }, []);

  const commit = (asset: Asset, next: AdmissionPrintAssetPlacement) => {
    if (
      Object.keys(next).every(
        (key) => next[key as keyof typeof next] === config[asset][key as keyof typeof next]
      )
    ) {
      return;
    }
    onChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        branding: { ...settings.advanced?.branding, [asset]: next },
      },
    });
  };

  const start = (event: PointerEvent<HTMLButtonElement>, asset: Asset, kind: Drag['kind']) => {
    if (event.button !== 0 || drag.current) return;
    const surface = band.current;
    if (!surface?.clientWidth || !surface.clientHeight) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setSelected(asset);
    drag.current = {
      asset,
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: surface.clientWidth,
      height: surface.clientHeight,
      placement: config[asset],
    };
    surface.setPointerCapture(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      if (drag.current !== current) return;
      setPreview({
        asset: current.asset,
        placement: placementAt(current, pointer.current.x, pointer.current.y),
      });
    });
  };

  const finish = (event: PointerEvent<HTMLDivElement>, canceled = false) => {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    setPreview(undefined);
    if (!canceled) commit(current.asset, placementAt(current, event.clientX, event.clientY));
  };

  const moveByKey = (event: KeyboardEvent<HTMLButtonElement>, asset: Asset) => {
    const offsets = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    } as const;
    const delta = offsets[event.key as keyof typeof offsets];
    if (!delta) return;
    event.preventDefault();
    const original = config[asset];
    const step = event.shiftKey ? 5 : 1;
    commit(
      asset,
      movePrintAsset(original, original.x + delta[0] * step, original.y + delta[1] * step)
    );
  };

  const updateCoordinate = (axis: Coordinate, value: number) => {
    if (axis === 'x' || axis === 'y') {
      commit(
        active,
        movePrintAsset(
          placement,
          axis === 'x' ? value : placement.x,
          axis === 'y' ? value : placement.y
        )
      );
    } else {
      commit(active, resizePrintAsset(placement, axis, value));
    }
  };

  return (
    <FormSectionCard title="Edit School Branding">
      <Typography variant="body2" color="text.secondary">
        Drag an asset to move it, or resize it from the bottom corner. Position and size use
        percentages of the printable header.
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        aria-label="Branding asset"
        value={active}
        onChange={(_, value: Asset | null) => value && setSelected(value)}
      >
        {ASSETS.map(({ key, label }) => (
          <ToggleButton key={key} value={key} disabled={!visible[key]}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box
        ref={band}
        aria-label="Printable header"
        role="group"
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={(event) => finish(event, true)}
        onLostPointerCapture={(event) => finish(event, true)}
        sx={{
          position: 'relative',
          aspectRatio: ADMISSION_PRINT_BRANDING_ASPECT,
          bgcolor: 'common.white',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {ASSETS.map(({ key, label }) => {
          const url = visible[key];
          const position = preview?.asset === key ? preview.placement : config[key];
          if (!url) return null;
          return (
            <Box
              key={key}
              sx={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${position.width}%`,
                height: `${position.height}%`,
                zIndex: active === key ? 1 : 0,
                outline: '1px dashed',
                outlineOffset: -1,
                outlineColor: active === key ? 'success.main' : 'grey.400',
              }}
            >
              <ButtonBase
                aria-label={`Move ${label.toLowerCase()}`}
                aria-pressed={active === key}
                onClick={() => setSelected(key)}
                onKeyDown={(event) => moveByKey(event, key)}
                onPointerDown={(event) => start(event, key, 'move')}
                sx={{
                  width: 1,
                  height: 1,
                  display: 'block',
                  touchAction: 'none',
                  cursor: preview?.asset === key ? 'grabbing' : 'grab',
                }}
              >
                <Box
                  component="img"
                  src={url}
                  alt=""
                  draggable={false}
                  sx={{ width: 1, height: 1, objectFit: 'contain', pointerEvents: 'none' }}
                />
              </ButtonBase>
              {active === key && (
                <ButtonBase
                  aria-label={`Resize ${label.toLowerCase()}`}
                  onPointerDown={(event) => start(event, key, 'resize')}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    const direction = event.key === 'ArrowLeft' ? -1 : 1;
                    updateCoordinate(
                      'width',
                      placement.width + direction * (event.shiftKey ? 5 : 1)
                    );
                  }}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 'min(24px, 45%)',
                    height: 'min(24px, 45%)',
                    touchAction: 'none',
                    cursor: 'nwse-resize',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 9,
                      height: 9,
                      bgcolor: 'success.main',
                    },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1,
        }}
      >
        {COORDINATES.map(({ key, label }) => (
          <CoordinateInput
            key={`${active}-${key}`}
            label={label}
            value={placement[key]}
            onCommit={(value) => updateCoordinate(key, value)}
          />
        ))}
      </Box>
      <FormControlLabel
        label="Lock aspect ratio"
        control={
          <Switch
            size="small"
            checked={placement.lockAspectRatio !== false}
            onChange={(_, checked) => commit(active, { ...placement, lockAspectRatio: checked })}
          />
        }
      />
    </FormSectionCard>
  );
}
