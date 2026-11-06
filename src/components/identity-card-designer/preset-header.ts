import type { IdentityCardElement } from './types';

export const text = (
  id: string,
  fieldKey: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize = 11,
  style: IdentityCardElement['style'] = {}
): IdentityCardElement => ({
  id,
  type: 'text',
  fieldKey,
  label,
  x,
  y,
  w,
  h,
  z: 2,
  visible: true,
  style: { color: '#1C252E', fontSize, fontFamily: 'Arial', showLabel: false, ...style },
});

export function presetHeader(staff: boolean, themeColor: string): IdentityCardElement[] {
  const shape = (id: string, y: number, h: number, color: string): IdentityCardElement => ({
    id,
    type: 'shape',
    x: 0,
    y,
    w: 428,
    h,
    z: 0,
    visible: true,
    style: { backgroundColor: color },
  });
  const logo: IdentityCardElement = {
    id: 'logo',
    type: 'logo',
    x: 19,
    y: 18,
    w: 34,
    h: 34,
    z: 1,
    visible: true,
  };
  const nameColor = staff ? '#FFFFFF' : '#1C252E';
  return [
    ...(staff ? [shape('header-band', 0, 66, '#1C252E')] : []),
    logo,
    text('school-name', 'schoolName', 'School name', 66, 18, 342, 24, 19, {
      fontWeight: 700,
      color: nameColor,
    }),
    text('school-address', 'schoolAddress', 'School address', 66, 44, 342, 15, 10, {
      color: staff ? '#FFFFFF' : '#637381',
    }),
    {
      ...text('card-kind', staff ? 'static' : 'headerText', 'Card heading', 19, 72, 389, 18, 12, {
        color: themeColor,
      }),
      value: staff ? 'Employee identity card' : 'Student identity card',
    },
  ];
}
