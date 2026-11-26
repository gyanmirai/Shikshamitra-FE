import type { PointerEvent, KeyboardEvent } from 'react';
import type {
  AdmissionPrintHeaderElement,
  AdmissionPrintAssetPlacement,
} from 'src/redux/student/admissions/admission-form-print-settings';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { useRef, useMemo, useState, useEffect } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Stack, Switch, ButtonBase, FormControlLabel } from '@mui/material';
import { resolveAdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { movePrintAsset, resizePrintAsset } from './print-branding-geometry';
import { getAdmissionPrintHeaderElements } from './form-print-header-layout';

import type {
  AdmissionPrintSettings,
  AdmissionPrintBranding,
  AdmissionPrintDocument,
} from './form-print-model';

type Coordinate = 'x' | 'y' | 'width' | 'height';
type Drag = {
  element: AdmissionPrintHeaderElement;
  kind: 'move' | 'resize';
  startX: number;
  startY: number;
  placement: AdmissionPrintAssetPlacement;
  pointerId: number;
  width: number;
  height: number;
};

const ELEMENT_LABELS = {
  logo: 'School logo',
  banner: 'Banner',
  schoolName: 'School name',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  title: 'Form title',
  subtitle: 'Subtitle',
  registrationNumber: 'Registration number',
  date: 'Date',
  board: 'Board',
  medium: 'Medium',
  class: 'Class',
  academicYear: 'Academic year',
  photo: 'Applicant photo',
} satisfies Record<AdmissionPrintHeaderElement, string>;
const COORDINATES = [
  { key: 'x', label: 'Horizontal (%)' },
  { key: 'y', label: 'Vertical (%)' },
  { key: 'width', label: 'Width (%)' },
  { key: 'height', label: 'Height (%)' },
] as const;

const isResizable = (element: AdmissionPrintHeaderElement) =>
  element === 'logo' || element === 'banner';

function placementAt(drag: Drag, clientX: number, clientY: number) {
  const orig = drag.placement;
  const dx = ((clientX - drag.startX) / drag.width) * 100;
  const dy = ((clientY - drag.startY) / drag.height) * 100;
  if (dx === 0 && dy === 0) return orig;
  if (drag.kind === 'move') return movePrintAsset(orig, orig.x + dx, orig.y + dy);
  return Math.abs(dx / orig.width) >= Math.abs(dy / orig.height)
    ? resizePrintAsset(orig, 'width', orig.width + dx, orig.height + dy)
    : resizePrintAsset(orig, 'height', orig.height + dy, orig.width + dx);
}

function CoordinateInput({
  label,
  name,
  value,
  onCommit,
}: {
  label: string;
  name: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commitDraft = () => {
    if (draft != null && draft !== '' && Number.isFinite(Number(draft))) {
      onCommit(Number(draft));
    }
    setDraft(null);
  };
  return (
    <NumericFormatCustom
      label={label}
      name={name}
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
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitDraft();
        }
      }}
      onBlur={commitDraft}
    />
  );
}

export function AdmissionPrintHeaderEditor({
  model,
  branding,
  onChange,
}: {
  model: AdmissionPrintDocument;
  branding: AdmissionPrintBranding;
  onChange: (settings: AdmissionPrintSettings) => void;
}) {
  const { settings } = model;
  const {
    branding: brandingSettings,
    header,
    photo,
    style,
  } = resolveAdmissionPrintAdvancedSettings(settings.advanced);
  const [selected, setSelected] = useState<AdmissionPrintHeaderElement>('title');
  const [selectedPage, setSelectedPage] = useState(1);
  const [preview, setPreview] = useState<{
    element: AdmissionPrintHeaderElement;
    placement: AdmissionPrintAssetPlacement;
  }>();
  const bannerOnlyOnLaterPages =
    settings.showSchoolHeader &&
    brandingSettings.showBanner &&
    branding.bannerUrl &&
    brandingSettings.bannerPlacement === 'selected' &&
    !brandingSettings.bannerPages.includes(1);
  const pages = bannerOnlyOnLaterPages ? [1, Math.min(...brandingSettings.bannerPages)] : [1];
  const page = pages.includes(selectedPage) ? selectedPage : 1;
  const { width, height, elements } = useMemo(
    () => getAdmissionPrintHeaderElements(model, branding, page),
    [model, branding, page]
  );
  const active = elements.find(({ key }) => key === selected) ?? elements[0];
  const band = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
  }, []);

  if (!active) return null;

  const { placement } = active;
  const commit = (element: AdmissionPrintHeaderElement, next: AdmissionPrintAssetPlacement) => {
    const current = elements.find(({ key }) => key === element)?.placement;
    if (
      !current ||
      Object.keys(next).every(
        (key) => next[key as keyof typeof next] === current[key as keyof typeof next]
      )
    ) {
      return;
    }
    onChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        header: {
          ...settings.advanced?.header,
          layout: { ...settings.advanced?.header?.layout, [element]: next },
        },
      },
    });
  };

  const start = (
    event: PointerEvent<HTMLButtonElement>,
    element: (typeof elements)[number],
    kind: Drag['kind']
  ) => {
    if (event.button !== 0 || drag.current) return;
    const surface = band.current;
    if (!surface?.clientWidth || !surface.clientHeight) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setSelected(element.key);
    drag.current = {
      element: element.key,
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: surface.clientWidth,
      height: surface.clientHeight,
      placement: element.placement,
    };
    surface.setPointerCapture(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const { current } = drag;
    if (!current || current.pointerId !== event.pointerId) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      if (drag.current !== current) return;
      setPreview({
        element: current.element,
        placement: placementAt(current, pointer.current.x, pointer.current.y),
      });
    });
  };

  const finish = (event: PointerEvent<HTMLDivElement>, canceled = false) => {
    const { current } = drag;
    if (current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    setPreview(undefined);
    if (!canceled) commit(current.element, placementAt(current, event.clientX, event.clientY));
  };

  const moveByKey = (event: KeyboardEvent<HTMLButtonElement>, element: (typeof elements)[number]) => {
    const offsets = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    } as const;
    const delta = offsets[event.key as keyof typeof offsets];
    if (!delta) return;
    event.preventDefault();
    setSelected(element.key);
    const { placement: original } = element;
    const step = event.shiftKey ? 5 : 1;
    commit(
      element.key,
      movePrintAsset(original, original.x + delta[0] * step, original.y + delta[1] * step)
    );
  };

  const updateCoordinate = (axis: Coordinate, value: number) => {
    if (axis === 'x' || axis === 'y') {
      commit(
        active.key,
        movePrintAsset(
          placement,
          axis === 'x' ? value : placement.x,
          axis === 'y' ? value : placement.y
        )
      );
    } else {
      commit(active.key, resizePrintAsset(placement, axis, value));
    }
  };

  return (
    <FormSectionCard
      title="Header Layout"
      icon={GlobalIcons.edit}
      descriptionTooltip="Drag an element or use the arrow keys to move it. Hold Shift for larger steps. Position and size are percentages of the printable header."
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
        {pages.length > 1 && (
          <CustomSelect
            label="Header page"
            size="small"
            value={page}
            options={pages.map((value) => ({ value, label: `Page ${value}` }))}
            onChange={(value) => setSelectedPage(Number(value))}
            formControlProps={{ fullWidth: true }}
          />
        )}
        <CustomSelect
          label="Header element"
          size="small"
          value={active.key}
          options={elements.map(({ key }) => ({ value: key, label: ELEMENT_LABELS[key] }))}
          onChange={(value) => {
            const element = elements.find(({ key }) => key === value);
            if (element) setSelected(element.key);
          }}
          formControlProps={{ fullWidth: true }}
        />
      </Stack>
      {active.key === 'address' && (
        <CustomSelect
          label="Address layout"
          size="small"
          value={header.addressLayout}
          options={[
            { value: 'vertical', label: 'Vertical (stacked)' },
            { value: 'horizontal', label: 'Horizontal (single line)' },
          ]}
          formControlProps={{ sx: { width: { xs: 1, sm: 240 } } }}
          onChange={(value) =>
            onChange({
              ...settings,
              advanced: {
                ...settings.advanced,
                header: {
                  ...settings.advanced?.header,
                  addressLayout: value === 'horizontal' ? 'horizontal' : 'vertical',
                },
              },
            })
          }
        />
      )}
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
          aspectRatio: width / height,
          containerType: 'inline-size',
          bgcolor: 'common.white',
          color: 'common.black',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {elements.map((element) => {
          const { key, src, text, value, field } = element;
          const label = ELEMENT_LABELS[key].toLowerCase();
          const position = preview?.element === key ? preview.placement : element.placement;
          const isActive = active.key === key;
          const prominent = key === 'title' || key === 'schoolName';
          const fontSize = prominent
            ? style.titleSize
            : key === 'address'
              ? style.baseSize - 1
              : style.baseSize;
          const photoUrl = key === 'photo' && photo.useSaved ? field?.imageUrl : undefined;
          return (
            <Box
              key={key}
              sx={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${position.width}%`,
                height: `${position.height}%`,
                zIndex: isActive ? 1 : 0,
                outline: '1px dashed',
                outlineOffset: -1,
                outlineColor: isActive ? 'primary.main' : 'grey.500',
              }}
            >
              <ButtonBase
                aria-label={`Move ${label}`}
                aria-pressed={isActive}
                type="button"
                onClick={() => setSelected(key)}
                onKeyDown={(event) => moveByKey(event, element)}
                onPointerDown={(event) => start(event, element, 'move')}
                sx={{
                  width: 1,
                  height: 1,
                  touchAction: 'none',
                  color: 'inherit',
                  overflow: 'hidden',
                  cursor: preview?.element === key ? 'grabbing' : 'grab',
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                {src ? (
                  <Box
                    component="img"
                    src={src}
                    alt=""
                    draggable={false}
                    sx={{ width: 1, height: 1, objectFit: 'contain', pointerEvents: 'none' }}
                  />
                ) : (
                  <Box
                    component="span"
                    sx={{
                      width: 1,
                      height: photoUrl ? 1 : undefined,
                      display: photoUrl ? 'flex' : 'block',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      fontSize: `${(fontSize / width) * 100}cqw`,
                      fontWeight: prominent ? 'fontWeightBold' : 'fontWeightRegular',
                      whiteSpace: 'pre-line',
                      overflowWrap: 'anywhere',
                      textAlign:
                        key === 'photo' ? 'center' : key === 'date' ? 'right' : header.alignment,
                      pointerEvents: 'none',
                    }}
                  >
                    {photoUrl && (
                      <Box
                        component="img"
                        src={photoUrl}
                        alt=""
                        draggable={false}
                        sx={{
                          display: 'block',
                          maxWidth: 1,
                          maxHeight: '80%',
                          objectFit: 'contain',
                          mx: 'auto',
                        }}
                      />
                    )}
                    {text}
                    {value !== undefined && (
                      <Box
                        component="span"
                        sx={{ display: 'inline-block', width: '42%', borderBottom: 1, ml: 0.5 }}
                      >
                        {value || ' '}
                      </Box>
                    )}
                  </Box>
                )}
              </ButtonBase>
              {isActive && isResizable(key) && (
                <ButtonBase
                  aria-label={`Resize ${label}`}
                  type="button"
                  onPointerDown={(event) => start(event, element, 'resize')}
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
                    '&.Mui-focusVisible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 9,
                      height: 9,
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
        {COORDINATES.filter(({ key }) => key === 'x' || key === 'y' || isResizable(active.key)).map(
          ({ key, label }) => (
            <CoordinateInput
              key={`${page}-${active.key}-${key}`}
              label={label}
              name={`printSettings.advanced.header.layout.${active.key}.${key}`}
              value={placement[key]}
              onCommit={(value) => updateCoordinate(key, value)}
            />
          )
        )}
      </Box>
      {isResizable(active.key) && (
        <FormControlLabel
          label="Lock aspect ratio"
          control={
            <Switch
              size="small"
              checked={placement.lockAspectRatio !== false}
              onChange={(_, checked) => commit(active.key, { ...placement, lockAspectRatio: checked })}
            />
          }
        />
      )}
    </FormSectionCard>
  );
}
