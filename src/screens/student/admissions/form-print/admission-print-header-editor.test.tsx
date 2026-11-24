import { it, vi, expect, describe } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import { AdmissionPrintHeaderEditor } from './admission-print-header-editor';
import { buildAdmissionPrintDocument, DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';

import type { AdmissionPrintSettings } from './form-print-model';

const settings = {
  ...DEFAULT_ADMISSION_PRINT_SETTINGS,
  advanced: {
    header: {
      title: 'School Registration',
      layout: {
        title: { x: 10, y: 10, width: 30, height: 12 },
        banner: { x: 20, y: 35, width: 40, height: 25, lockAspectRatio: true },
        photo: { x: 75, y: 40, width: 20, height: 40 },
      },
    },
    photo: { placement: 'header-top-right' as const },
  },
};
const branding = { logoUrl: 'logo.png', bannerUrl: 'banner.png' };

function renderEditor(printSettings: AdmissionPrintSettings = settings) {
  const onChange = vi.fn();
  const model = buildAdmissionPrintDocument({
    definition: {
      name: 'Registration',
      sections: [
        {
          id: 'student',
          code: 'STUDENT',
          name: 'Student',
          displayOrder: 0,
          fields: [
            {
              id: 'photo',
              code: 'PHOTO',
              label: 'Photograph',
              fieldType: 0,
              bindingType: 1,
              required: false,
              readOnly: false,
              displayOrder: 0,
              validationJson: '{"format":"photo"}',
            },
          ],
        },
      ],
    },
    settings: printSettings,
    values: {},
    mode: 'blank',
  });
  render(<AdmissionPrintHeaderEditor model={model} branding={branding} onChange={onChange} />);
  return onChange;
}

describe('Registration print header placement', () => {
  it('moves the applicant photo independently with the keyboard', () => {
    const onChange = renderEditor();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Move applicant photo' }), {
      key: 'ArrowLeft',
      shiftKey: true,
    });
    expect(onChange.mock.lastCall?.[0].advanced).toEqual({
      ...settings.advanced,
      header: {
        ...settings.advanced.header,
        layout: {
          ...settings.advanced.header.layout,
          photo: expect.objectContaining({ x: 70, y: 40 }),
        },
      },
    });
  });

  it('resizes the selected banner while retaining its locked aspect ratio', () => {
    const onChange = renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Move banner' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Resize banner' }), {
      key: 'ArrowLeft',
    });
    expect(onChange.mock.lastCall?.[0].advanced.header.layout.banner).toEqual({
      x: 20,
      y: 35,
      width: 39,
      height: 24.4,
      lockAspectRatio: true,
    });
  });

  it('keeps the form title within the header when a position is entered', () => {
    const onChange = renderEditor();
    const horizontal = screen.getByRole('textbox', { name: 'Horizontal (%)' });
    act(() => horizontal.focus());
    fireEvent.change(horizontal, { target: { value: '100' } });
    fireEvent.keyDown(horizontal, { key: 'Enter' });
    const title = onChange.mock.lastCall?.[0].advanced.header.layout.title;
    expect(title.y).toBe(10);
    expect(title.x + title.width).toBeLessThanOrEqual(100);
    expect(title.x + title.width).toBeGreaterThan(99.9);
    expect(horizontal).toHaveFocus();
  });

  it('updates the dragged element once when the pointer is released', () => {
    const onChange = renderEditor();
    const header = screen.getByRole('group', { name: 'Printable header' });
    Object.defineProperties(header, {
      clientWidth: { value: 500 },
      clientHeight: { value: 200 },
      setPointerCapture: { value: vi.fn() },
    });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Move form title' }), {
      pointerId: 1,
      button: 0,
      clientX: 50,
      clientY: 20,
    });
    fireEvent.pointerMove(header, { pointerId: 1, clientX: 100, clientY: 80 });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(header, { pointerId: 1, clientX: 100, clientY: 80 });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0].advanced.header.layout.title).toMatchObject({
      x: 20,
      y: 40,
    });
  });

  it('lets the user move a banner assigned to a later page', () => {
    renderEditor({
      ...settings,
      advanced: {
        ...settings.advanced,
        branding: { bannerPlacement: 'selected', bannerPages: [3, 4] },
      },
    });
    expect(screen.queryByRole('button', { name: 'Move banner' })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Header page' }));
    fireEvent.click(screen.getByRole('option', { name: 'Page 3' }));
    expect(screen.getByRole('button', { name: 'Move banner' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move form title' })).not.toBeInTheDocument();
  });

  it('omits disabled elements even when their position is saved', () => {
    renderEditor({ ...settings, showPhoto: false, showSchoolHeader: false });
    expect(screen.queryByRole('button', { name: 'Move applicant photo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move school logo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move banner' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move form title' })).toBeInTheDocument();
  });
});
