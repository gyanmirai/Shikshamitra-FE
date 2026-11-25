import type { IdentityCardPrintSettings } from './types';

type Rectangle = { x: number; y: number; width: number; height: number };

export const CUT_MARK_REACH_MM = 1.2;
const STROKE_MM = 0.1;

export function CardCutMarks({
  trim,
  page,
  settings,
}: {
  trim: Rectangle;
  page: Pick<Rectangle, 'width' | 'height'>;
  settings: IdentityCardPrintSettings;
}) {
  if (!settings.showCutMarks || settings.pageSize !== 'A4') return null;
  const { x, y, width, height } = trim;
  const { bleedMm, gap } = settings;
  const start = bleedMm + 0.2;
  const minimumReach = start + 0.1 - 0.00001;
  const reach = (space: number) =>
    bleedMm + Math.min(CUT_MARK_REACH_MM, gap / 2 - 0.2, space - bleedMm - STROKE_MM / 2);
  return [-1, 1].flatMap((dx) =>
    [-1, 1].flatMap((dy) => {
      const edgeX = dx < 0 ? x : x + width;
      const edgeY = dy < 0 ? y : y + height;
      const horizontal = reach(dx < 0 ? edgeX : page.width - edgeX);
      const vertical = reach(dy < 0 ? edgeY : page.height - edgeY);
      return [
        horizontal >= minimumReach && (
          <line
            key={`${dx}:${dy}:horizontal`}
            data-cut-mark=""
            x1={edgeX + dx * start}
            x2={edgeX + dx * horizontal}
            y1={edgeY}
            y2={edgeY}
            stroke="#333333"
            strokeWidth={STROKE_MM}
          />
        ),
        vertical >= minimumReach && (
          <line
            key={`${dx}:${dy}:vertical`}
            data-cut-mark=""
            x1={edgeX}
            x2={edgeX}
            y1={edgeY + dy * start}
            y2={edgeY + dy * vertical}
            stroke="#333333"
            strokeWidth={STROKE_MM}
          />
        ),
      ];
    })
  );
}
