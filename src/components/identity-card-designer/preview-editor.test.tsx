import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IdentityCardPreview } from './preview';
import { createIdentityCardPreset } from './presets';
import { validateIdentityCardLayout } from './validation';

describe('studio print-compatible preview', () => {
  it('round-trips line strokes and bordered shapes while retaining legacy dividers', () => {
    const layout = createIdentityCardPreset('classic-identity');
    const line = {
      id: 'divider',
      type: 'line',
      x: 10,
      y: 10,
      w: 40,
      h: 3,
      z: 0,
      visible: true,
    } as const;
    layout.front.elements = [
      { ...line, style: { backgroundColor: '#112233' } },
      {
        ...line,
        id: 'dashed',
        y: 20,
        style: { borderStyle: 'dashed', borderColor: '#234567', borderWidth: 2 },
      },
      { ...line, id: 'dotted', y: 30, style: { borderStyle: 'dotted' } },
      { ...line, id: 'explicit-solid', y: 40, style: { borderStyle: 'solid', borderWidth: 0 } },
      {
        ...line,
        id: 'outline',
        type: 'shape',
        y: 50,
        style: { shape: 'ellipse', borderStyle: 'dashed', borderColor: '#234567', borderWidth: 1 },
      },
    ];
    const saved = JSON.parse(JSON.stringify(layout)) as typeof layout;
    const { container } = render(<IdentityCardPreview layout={saved} />);
    const [dashed, dotted, solid] = container.querySelectorAll('line');
    expect(container.querySelector('rect[fill="#112233"]')).toHaveAttribute('height', '3');
    expect(dashed).toHaveAttribute('stroke', '#234567');
    expect(dashed).toHaveAttribute('stroke-width', '2');
    expect(dashed).toHaveAttribute('stroke-dasharray', '8 4');
    expect(dotted).toHaveAttribute('stroke-dasharray', '0.03 6');
    expect(dotted).toHaveAttribute('stroke-linecap', 'round');
    expect(solid).toHaveAttribute('stroke-width', '0');
    expect(solid).not.toHaveAttribute('stroke-dasharray');
    expect(container.querySelector('ellipse')).toHaveAttribute('stroke-dasharray', '4 2');
    expect(validateIdentityCardLayout(saved)).toEqual([]);
  });

  it('keeps design tokens out of a student card preview and ignores stale static text', () => {
    const layout = createIdentityCardPreset('classic-identity');
    const name = layout.front.elements.find((element) => element.fieldKey === 'StudentName')!;
    name.prefix = 'Name: ';
    name.value = 'Enter text';
    const { rerender } = render(<IdentityCardPreview layout={layout} />);
    expect(screen.queryByText(/Enter text/)).not.toBeInTheDocument();
    rerender(<IdentityCardPreview layout={layout} values={{ StudentName: 'Aarav Shah' }} />);
    expect(screen.getByText('Name: Aarav Shah')).toBeInTheDocument();
    expect(screen.queryByText(/\[Student Name\]/)).not.toBeInTheDocument();
  });
  it('renders rotation, opacity, ellipse and text formatting from saved schema', () => {
    const layout = createIdentityCardPreset('classic-identity');
    layout.front.elements = [
      {
        id: 'ellipse',
        type: 'shape',
        x: 10,
        y: 10,
        w: 40,
        h: 20,
        z: 1,
        visible: true,
        rotation: 45,
        opacity: 0.5,
        style: { shape: 'ellipse', backgroundColor: '#112233' },
      },
      {
        id: 'text',
        type: 'text',
        fieldKey: 'static',
        value: 'School',
        x: 50,
        y: 10,
        w: 100,
        h: 20,
        z: 2,
        visible: true,
        style: { fontStyle: 'italic', textDecoration: 'underline' },
      },
    ];
    const { container } = render(<IdentityCardPreview layout={layout} />);
    const ellipse = container.querySelector('ellipse')!;
    expect(ellipse.parentElement).toHaveAttribute('transform', 'rotate(45 30 20)');
    expect(ellipse.parentElement).toHaveAttribute('opacity', '0.5');
    expect(screen.getByText('School')).toHaveStyle({
      fontStyle: 'italic',
      textDecoration: 'underline',
    });
    expect(validateIdentityCardLayout(layout)).toEqual([]);
  });
  it('rejects invalid transforms and raster references before saving', () => {
    const layout = createIdentityCardPreset('classic-identity');
    layout.front.elements = [
      {
        id: 'image',
        type: 'image',
        x: 0,
        y: 0,
        w: 20,
        h: 20,
        z: 1,
        visible: true,
        rotation: 181,
        opacity: 2,
        imageData: 'https://example.com/picture.png',
      },
    ];
    const errors = validateIdentityCardLayout(layout).join(' ');
    expect(errors).toContain('Rotation');
    expect(errors).toContain('Opacity');
    expect(errors).toContain('PNG or JPEG');
  });
});
