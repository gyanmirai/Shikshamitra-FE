import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IdentityCardPreview } from './preview';
import { createIdentityCardPreset } from './presets';
import { validateIdentityCardLayout } from './validation';

describe('studio print-compatible preview', () => {
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
