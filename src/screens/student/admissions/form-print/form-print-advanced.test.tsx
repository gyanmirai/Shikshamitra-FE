// @vitest-environment node
import type { PdfPreviewTarget } from 'src/components/preview-document/pdf-preview/find-pdf-preview-target';
import type { AdmissionPrintAdvancedSettings } from 'src/redux/student/admissions/admission-form-print-settings';

import { act } from 'react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { mswServer } from 'src/test/mswServer';
import { mkdir, writeFile } from 'node:fs/promises';
import { it, expect, describe, beforeAll } from 'vitest';
import { findPdfPreviewTarget } from 'src/components/preview-document/pdf-preview/find-pdf-preview-target';

import { createAdmissionFormPdfBlob } from './form-print-pdf';
import { buildAdmissionPrintDocument } from './form-print-model';

import type { AdmissionPrintBranding } from './form-print-model';

const pdfjs = () =>
  import(
    /* @vite-ignore */ pathToFileURL(
      createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs')
    ).href
  ) as Promise<typeof import('pdfjs-dist')>;
beforeAll(() => mswServer.close());
const question = (code: string, options: Record<string, unknown> = {}) => ({
  id: code,
  code,
  label: code,
  fieldType: 0,
  bindingType: 1,
  required: true,
  readOnly: false,
  displayOrder: 0,
  ...options,
});
const section = (
  code: string,
  fields = [question('NAME')],
  options: Record<string, unknown> = {}
) => ({ id: code, code, name: code, displayOrder: 0, fields, ...options });
const branding = {
  schoolName: 'Example Institute',
  addressLines: ['Complete campus address', 'Surat, Gujarat'],
  schoolPhone: '9876543210',
  schoolEmail: 'school@example.test',
  schoolWebsite: 'https://example.test',
};
async function artifact(
  name: string,
  model: ReturnType<typeof buildAdmissionPrintDocument>,
  paperBranding: AdmissionPrintBranding = branding,
  targets: PdfPreviewTarget[] = []
) {
  let blob!: Blob;
  await act(async () => {
    blob = await createAdmissionFormPdfBlob(model, paperBranding, path.resolve('public/fonts'));
  });
  if (process.env.ADMISSION_PRINT_ARTIFACT_DIR) {
    await mkdir(process.env.ADMISSION_PRINT_ARTIFACT_DIR, { recursive: true });
    await writeFile(
      path.join(process.env.ADMISSION_PRINT_ARTIFACT_DIR, `${name}.pdf`),
      new Uint8Array(await blob.arrayBuffer())
    );
  }
  const loading = (await pdfjs()).getDocument({
    data: new Uint8Array(await blob.arrayBuffer()),
    standardFontDataUrl: `${path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'))}/standard_fonts/`,
  });
  const doc = await loading.promise;
  const pages = await Promise.all(
    Array.from({ length: doc.numPages }, async (_, index) => {
      const page = await doc.getPage(index + 1);
      return {
        viewport: page.getViewport({ scale: 1 }),
        items: (await page.getTextContent()).items,
        operators: await page.getOperatorList(),
      };
    })
  );
  const texts = pages.map((page) =>
    page.items.map((item) => ('str' in item ? item.str : '')).join(' ')
  );
  const locations = await Promise.all(
    targets.map((target) => findPdfPreviewTarget(doc, target, 1, () => true))
  );
  await loading.destroy();
  return { pages, texts, text: texts.join(' '), locations };
}

describe('Advanced Registration paper settings', () => {
  it.each([false, true])(
    'prints the comma-separated address with positioned header %s',
    async (positioned) => {
      const model = buildAdmissionPrintDocument({
        definition: { name: 'Registration', sections: [section('STUDENT')] },
        values: {},
        mode: 'blank',
        settings: {
          advanced: {
            header: {
              addressLayout: 'horizontal',
              ...(positioned && { layout: { address: { x: 0, y: 14, width: 100, height: 10 } } }),
            },
          },
        },
      });
      const output = await artifact('horizontal-address', model);
      expect(output.text.replace(/\s+/g, ' ')).toContain('Complete campus address, Surat, Gujarat');
    }
  );

  it('prints independently moved header text at its saved coordinates', async () => {
    const build = (moved: boolean) =>
      buildAdmissionPrintDocument({
        definition: { name: 'Movable Form Title', sections: [section('STUDENT')] },
        values: {},
        mode: 'blank',
        settings: {
          advanced: {
            header: {
              alignment: 'left',
              layout: moved
                ? {
                    title: { x: 50, y: 18, width: 30, height: 12 },
                    schoolName: { x: 32, y: 0, width: 30, height: 12 },
                  }
                : undefined,
            },
          },
        },
      });
    const original = await artifact('header-preset', build(false));
    const revised = await artifact('header-custom', build(true));
    const getX = (output: typeof revised, text: string) => {
      const item = output.pages[0].items.find(
        (entry) => 'str' in entry && entry.str.includes(text)
      );
      if (!item || !('transform' in item))
        throw new Error(`Missing PDF text ${text}: ${output.text}`);
      return item.transform[4];
    };
    expect(revised.text.replace(/\s+/g, ' ')).toContain('Movable Form Title');
    expect(getX(revised, 'Movable') - getX(original, 'Movable')).toBeGreaterThan(150);
    expect(getX(revised, 'Example') - getX(original, 'Example')).toBeGreaterThan(80);
    expect(revised.text).toContain('NAME');
  }, 25000);

  it('reveals the changed section and field on page 3 in the generated PDF', async () => {
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        sections: [
          section('FIRST', [question('FIRST_NAME', { label: 'Student name' })], {
            name: 'Student details',
          }),
          section('SECOND', [question('FAMILY')], { displayOrder: 1 }),
          section('THIRD', [question('THIRD_NAME', { label: 'Student name' })], {
            name: 'Student details',
            displayOrder: 2,
          }),
        ],
      },
      values: {},
      mode: 'blank',
      settings: {
        advanced: { sections: { SECOND: { startNewPage: true }, THIRD: { startNewPage: true } } },
      },
    });
    const { locations } = await artifact('reveal-page-three', model, {}, [
      { destination: 'section:THIRD', text: ['Student details'] },
      {
        destination: 'field:THIRD:THIRD_NAME',
        text: ['Student name'],
        afterText: 'Student details',
      },
    ]);
    expect(locations).toMatchObject([{ page: 3 }, { page: 3 }]);
  });

  it.each(['A4', 'A5'] as const)(
    'fits a top-right photo beside the first-page title on %s',
    async (paperSize) => {
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration header test',
          sections: [
            section('Student', [
              question('STUDENT_PHOTO', {
                label: 'Student header photo',
                bindingType: 0,
                bindingKey: 'Applicant.ProfilePhoto',
                validationJson: '{"format":"photo"}',
              }),
              question('STUDENT_NAME', { label: 'Student name' }),
            ]),
            section(
              'Family',
              [
                question('OTHER_PHOTO', {
                  label: 'Parent photo',
                  validationJson: '{"format":"photo"}',
                }),
              ],
              { displayOrder: 1 }
            ),
          ],
        },
        mode: 'blank',
        values: {},
        settings: {
          paperSize,
          showPhoto: true,
          showSignature: false,
          advanced: {
            photo: { placement: 'header-top-right', alignment: 'left', width: 35, height: 45 },
            header: { continuation: 'full' },
            sections: { FAMILY: { startNewPage: true } },
          },
        },
      });
      const result = await artifact(`header-photo-${paperSize}`, model, {
        ...branding,
        bannerUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=',
      });
      const firstPage = result.pages[0];
      const textAt = (label: string) => {
        const item = firstPage.items.find((text) => 'str' in text && text.str.includes(label));
        if (!item || !('transform' in item)) throw new Error(`Missing "${label}" on page 1.`);
        return item;
      };
      const title = textAt('Registration header test');
      const photo = textAt('Student header photo');
      const registration = textAt('Registration No.');
      const name = textAt('Student name');
      const photoLeft = firstPage.viewport.width - ((12 + 35) * 72) / 25.4;
      expect(title.transform[4] + title.width).toBeLessThan(photoLeft);
      expect(photo.transform[4]).toBeGreaterThan(photoLeft);
      expect(photo.transform[5]).toBeGreaterThan(registration.transform[5]);
      expect(registration.transform[5]).toBeGreaterThan(name.transform[5]);
      expect(result.texts.slice(1).join(' ')).not.toContain('Student header photo');
      expect(result.texts.slice(1).join(' ')).toContain('Parent photo');
      expect(result.texts[0]).toContain('35 × 45 mm');
    }
  );

  it.each(['first', 'last', 'field', 'header-top-right'] as const)(
    'omits the %s photo space when no photo question is printable',
    async (placement) => {
      const result = await artifact(
        `no-configured-photo-${placement}`,
        buildAdmissionPrintDocument({
          definition: { name: 'Registration', sections: [section('Student')] },
          values: {},
          mode: 'blank',
          settings: {
            showPhoto: true,
            advanced: { photo: { placement, caption: 'Photo space sample' } },
          },
        })
      );
      expect(result.text).toContain('NAME');
      expect(result.text).not.toMatch(/Photograph|Photo space sample/);
    }
  );

  it('keeps photos from other steps out of a single-step PDF', async () => {
    const output = await artifact(
      'scoped-without-photo',
      buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          sections: [
            section('Student'),
            section('Photo', [question('PHOTO', { validationJson: '{"format":"photo"}' })]),
          ],
        },
        values: {},
        mode: 'blank',
        stepKey: 'Student',
        settings: { advanced: { photo: { placement: 'header-top-right' } } },
      })
    );
    expect(output.text).toContain('NAME');
    expect(output.text).not.toContain('Photograph');
  });

  it('aligns or hides a printed photo space while keeping other questions', async () => {
    const definition = {
      name: 'Photo alignment',
      sections: [
        section('Student', [
          question('NAME'),
          question('PHOTO', { validationJson: '{"format":"photo"}' }),
        ]),
      ],
    };
    const render = (showPhoto: boolean, alignment: 'left' | 'center' | 'right') =>
      artifact(
        `photo-${alignment}-${showPhoto}`,
        buildAdmissionPrintDocument({
          definition,
          values: {},
          mode: 'blank',
          settings: {
            showPhoto,
            advanced: { photo: { alignment, caption: 'Photo space sample' } },
          },
        })
      );
    const captionPosition = async (alignment: 'left' | 'center' | 'right') => {
      const result = await render(true, alignment);
      const caption = result.pages[0].items.find(
        (item) => 'str' in item && item.str === 'Photo space sample'
      );
      if (!caption || !('transform' in caption))
        throw new Error('Photo caption was missing from the PDF.');
      return caption.transform[4];
    };
    const left = await captionPosition('left');
    const centre = await captionPosition('center');
    const right = await captionPosition('right');
    expect(left).toBeLessThan(centre);
    expect(centre).toBeLessThan(right);
    const hidden = await render(false, 'right');
    expect(hidden.text).not.toContain('Photo space sample');
    expect(hidden.text).toContain('NAME');
  });

  it.each([
    ['first', 'full', [1]],
    ['selected', 'none', [2, 4]],
    ['selected', 'full', [1, 3]],
    ['every', 'compact', [1, 2, 3, 4]],
  ] as const)(
    'prints %s banner pages with a %s header',
    async (placement, continuation, expected) => {
      const pages = [1, 2, 3, 4];
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Banner pages',
          sections: pages.map((page) =>
            section(`PAGE_${page}`, [question(`FIELD_${page}`)], { displayOrder: page })
          ),
        },
        values: {},
        mode: 'blank',
        settings: {
          showPhoto: false,
          showSignature: false,
          advanced: {
            branding: { bannerPlacement: placement, bannerPages: [...expected] },
            header: { continuation },
            sections: Object.fromEntries(
              pages.slice(1).map((page) => [`PAGE_${page}`, { startNewPage: true }])
            ),
          },
        },
      });
      const bannerUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
      const output = await artifact(`banner-${placement}-${continuation}`, model, { bannerUrl });
      const { OPS } = await pdfjs();
      expect(output.pages).toHaveLength(4);
      expect(
        pages.filter((page) =>
          output.pages[page - 1].operators.fnArray.includes(OPS.paintImageXObject)
        )
      ).toEqual(expected);
    }
  );

  it('keeps a section heading with its first field when the photo and header consume space', async () => {
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'QA Printed Registration',
        sections: [
          section('Student Details', [
            question('FIRST_NAME', { label: 'First name' }),
            question('PHOTO', { displayOrder: 1, validationJson: '{"format":"photo"}' }),
          ]),
        ],
      },
      values: {},
      mode: 'blank',
      settings: {
        paperSize: 'A5',
        showPhoto: true,
        showSignature: false,
        advanced: {
          border: { enabled: true },
          header: { board: true, medium: true, class: true, academicYear: true },
          sections: { 'STUDENT DETAILS': { keepHeading: true } },
          fields: { FIRST_NAME: { width: 'full', writingLines: 6 } },
          content: {
            showInstructions: true,
            translations: { en: { instructions: 'Use BLOCK CAPITALS.' } },
          },
        },
      },
    });
    const result = await artifact('advanced-keep-section-heading', model);

    expect(result.pages.length).toBeGreaterThan(1);
    expect(result.texts.find((page) => page.includes('Student Details'))).toContain('First name');
  }, 30000);
  it('retains the school logo and a registration line on compact continuation pages', async () => {
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        sections: [
          section('STUDENT'),
          section('PARENT', [question('PARENT_NAME')], { displayOrder: 1 }),
        ],
      },
      values: {},
      mode: 'blank',
      settings: {
        showPhoto: false,
        showSignature: false,
        advanced: {
          header: { continuation: 'compact', registrationNumber: true },
          sections: { PARENT: { startNewPage: true } },
        },
      },
    });
    const result = await artifact('advanced-compact-header', model, { ...branding, logoUrl: png });

    expect(result.pages).toHaveLength(2);
    expect(result.texts[1]).toContain('Registration No.');
    expect(result.texts[1]).not.toContain('Complete campus address');
    expect(result.pages[1].operators.fnArray).toContain((await pdfjs()).OPS.paintImageXObject);
  }, 30000);
  it('keeps boxed rows from collapsing together at a tight page boundary', async () => {
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
    const fields = [
      ['First name', 'Applicant.FirstName'],
      ['Middle name', 'Applicant.MiddleName'],
      ['Last name', 'Applicant.LastName'],
      ['Date of birth', 'Applicant.DateOfBirth'],
      ['Gender', 'Applicant.Gender'],
    ];
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        fieldsPerRow: 2,
        sections: [
          section(
            'Student Details',
            fields.map(([label, bindingKey], index) =>
              question(`FIELD_${index}`, { label, bindingKey, bindingType: 0, displayOrder: index })
            )
          ),
        ],
      },
      values: {},
      mode: 'blank',
      settings: {
        paperSize: 'A5',
        template: 'boxed-grid',
        showPhoto: true,
        showSignature: false,
        advanced: {
          header: { board: true, medium: true, class: true, academicYear: true },
          fields: { FIELD_0: { width: 'full' } },
          content: {
            showInstructions: true,
            translations: { en: { instructions: 'Write clearly.' } },
          },
        },
      },
    });
    const result = await artifact('advanced-boxed-row-boundary', model, {
      ...branding,
      logoUrl: png,
    });
    const positions = result.pages.flatMap(({ items }, page) =>
      items.flatMap((item) => {
        if (!('str' in item)) return [];
        const matching = fields.find(([label]) => item.str.startsWith(label));
        return matching ? [{ label: matching[0], page, y: item.transform[5] }] : [];
      })
    );
    const [first, middle, , birth] = fields.map(([label]) =>
      positions.find((item) => item.label === label)!
    );
    expect(positions).toHaveLength(5);
    expect(middle.page > first.page || first.y - middle.y > 20).toBe(true);
    expect(birth.page > middle.page || middle.y - birth.y > 20).toBe(true);
  }, 30000);
  it('returns an actionable layout error rather than clipping an oversized A5 landscape header', async () => {
    const model = buildAdmissionPrintDocument({
      definition: { name: 'Registration', sections: [section('STUDENT')] },
      values: {},
      mode: 'blank',
      settings: {
        paperSize: 'A5',
        showPhoto: false,
        advanced: {
          paper: { orientation: 'landscape' },
          header: {
            phone: true,
            email: true,
            website: true,
            board: true,
            medium: true,
            class: true,
            academicYear: true,
            subtitle: 'Detailed registration for the upcoming academic session',
          },
        },
      },
    });
    const longBranding = {
      ...branding,
      schoolName: 'Example International Senior Secondary School and Learning Institute',
      addressLines: Array.from(
        { length: 6 },
        () =>
          'A long complete persisted institute address with street, building, location, district and postal details.'
      ),
    };
    await expect(
      createAdmissionFormPdfBlob(model, longBranding, path.resolve('public/fonts'))
    ).rejects.toMatchObject({
      name: 'AdmissionPrintLayoutError',
      message: expect.stringContaining('Choose a larger paper'),
    });
  }, 30000);
  it('honors table-heading opt-out and a last-page-only footer without losing rows', async () => {
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        sections: [
          section(
            'FAMILY',
            [question('PERSON', { label: 'Person name', helpText: 'Unique table help' })],
            { isRepeatable: true, minEntries: 1 }
          ),
        ],
      },
      values: {
        PERSON: JSON.stringify(Array.from({ length: 45 }, (_, index) => `Person ${index + 1}`)),
      },
      mode: 'filled',
      settings: {
        showPhoto: false,
        showSignature: false,
        advanced: {
          sections: { FAMILY: { repeatTableHeadings: false } },
          fields: { PERSON: { showHelp: true } },
          footer: { placement: 'last' },
          border: { enabled: true, placement: 'first' },
          flow: { sectionNumbers: false },
        },
      },
    });
    const result = await artifact('advanced-table-headings-once', model);
    expect(result.pages.length).toBeGreaterThan(1);
    expect(result.text.match(/Person name/g)).toHaveLength(1);
    expect(result.text).toContain('Unique table help');
    expect(result.text.match(/Person \d+(?!\d)/g)).toHaveLength(45);
    expect(result.texts.slice(0, -1).every((text) => !/Page \d+ of/.test(text))).toBe(true);
    expect(result.texts.at(-1)).toContain(`Page ${result.pages.length} of ${result.pages.length}`);
  }, 30000);
  it.each(['first', 'last', 'field'] as const)(
    'keeps all configured %s photographs and honors saved-photo suppression',
    async (placement) => {
      const image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
      const module = await pdfjs();
      await [true, false].reduce(async (previous, useSaved) => {
        await previous;
        const model = buildAdmissionPrintDocument({
          definition: {
            name: 'Registration',
            fieldsPerRow: 4,
            sections: [
              section('STUDENT', [
                question('PHOTO', {
                  label: 'Student photograph',
                  validationJson: '{"format":"photo"}',
                }),
                question('PARENT_PHOTO', {
                  label: 'Parent photograph',
                  validationJson: '{"format":"photo"}',
                  displayOrder: 1,
                }),
              ]),
            ],
          },
          values: { PHOTO: JSON.stringify(image), PARENT_PHOTO: JSON.stringify(image) },
          mode: 'filled',
          settings: {
            showSignature: false,
            advanced: {
              photo: {
                placement,
                width: 30,
                height: 35,
                useSaved,
                caption: 'Configured photograph',
              },
            },
          },
        });
        const result = await artifact(`advanced-photo-${placement}-${useSaved}`, model);
        const imageCount = result.pages.flatMap((page) =>
          page.operators.fnArray.filter((operation) =>
            [module.OPS.paintImageXObject, module.OPS.paintInlineImageXObject].includes(operation)
          )
        ).length;
        expect(imageCount).toBe(useSaved ? 2 : 0);
        expect(result.text.includes('30 × 35 mm')).toBe(!useSaved);
        expect(
          result.text
            .replace(/-\s/g, '')
            .replace(/\s/g, '')
            .match(/Configuredphotograph/g)
        ).toHaveLength(2);
        expect(result.pages).toHaveLength(1);
        expect(result.text.includes('STUDENT')).toBe(placement === 'field');
      }, Promise.resolve());
    },
    30000
  );

  it('positions resized branding assets in the shared band and preserves long metadata without body/footer overlap', async () => {
    const red =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
    const blue =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWMUcbvznwEJMDGgASYGNMDEgAYAkDgCPdM8czMAAAAASUVORK5CYII=';
    const model = buildAdmissionPrintDocument({
      definition: { name: 'Registration', sections: [section('STUDENT')] },
      values: { NAME: '"Saved name"' },
      mode: 'filled',
      registrationNumber: 'REG-2026-0017',
      settings: {
        showPhoto: false,
        advanced: {
          branding: {
            logo: { x: 80, y: 0, width: 20, height: 100, lockAspectRatio: true },
            banner: { x: 0, y: 0, width: 70, height: 100, lockAspectRatio: false },
          },
          border: { enabled: true, style: 'double', corners: 'rounded' },
          style: { palette: 'school-blue' },
        },
      },
    });
    const result = await artifact('advanced-assets-long-branding', model, {
      ...branding,
      schoolName: 'Example International Senior Secondary School and Learning Institute',
      addressLines: [
        'First floor educational campus',
        'Near the Science Centre',
        'Building and wing details',
        'Surat, Gujarat, 395006',
        'India',
      ],
      logoUrl: red,
      bannerUrl: blue,
    });
    const module = await pdfjs();
    expect(result.pages).toHaveLength(1);
    expect(
      result.pages[0].operators.fnArray.filter((operation) =>
        [module.OPS.paintImageXObject, module.OPS.paintInlineImageXObject].includes(operation)
      )
    ).toHaveLength(2);
    expect(result.text).toContain('India');
    expect(result.text).toContain('Saved name');
    const { items } = result.pages[0];
    const india = items.find((item) => 'str' in item && item.str === 'India');
    const field = items.find((item) => 'str' in item && item.str === 'NAME *');
    expect(
      india && field && 'transform' in india && 'transform' in field
        ? india.transform[5] - field.transform[5]
        : -1
    ).toBeGreaterThan(35);
  }, 30000);
  it('keeps the last-page footer with office-use content when its separate page overflows', async () => {
    const model = buildAdmissionPrintDocument({
      definition: { name: 'Registration', sections: [section('STUDENT')] },
      values: {},
      mode: 'blank',
      settings: {
        paperSize: 'LETTER',
        template: 'boxed-grid',
        showPhoto: false,
        advanced: {
          paper: {
            orientation: 'landscape',
            margins: { top: 18, left: 12, bottom: 12, right: 12 },
          },
          border: {
            enabled: true,
            style: 'double',
            inset: 9,
            thickness: 'medium',
            corners: 'rounded',
          },
          style: { baseSize: 11, titleSize: 19, fontFamily: 'serif' },
          header: {
            continuation: 'full',
            title: 'Print Audit Registration',
            subtitle: 'Print audit subtitle',
            email: true,
            phone: true,
            board: true,
            medium: true,
            class: true,
            academicYear: true,
          },
          footer: { placement: 'last', schoolName: true, formTitle: true },
          content: {
            showOfficeUse: true,
            officePlacement: 'separate-page',
            signatureDate: true,
            signaturePlacement: 'separate-page',
            documentChecks: true,
            remarks: true,
            verificationDate: true,
            stamp: true,
            translations: { en: { checklist: ['Audit birth certificate'] } },
          },
        },
      },
    });
    const image =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
    const result = await artifact('advanced-office-footer', model, {
      ...branding,
      logoUrl: image,
      bannerUrl: image,
    });

    expect(result.text).toContain('For office use only');
    ['Audit birth certificate', 'Remarks', 'Verification date', 'School stamp'].forEach((label) =>
      expect(result.text.split(label)).toHaveLength(2)
    );
    expect(result.texts.at(-1)).toContain('School stamp');
    expect(result.texts.at(-1)).toContain(`Page ${result.pages.length} of ${result.pages.length}`);
  }, 30000);

  it('prints separate instructions, requested section breaks, checklist, signatures and office pages without empty pages', async () => {
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        sections: [section('STUDENT'), section('SECOND', [question('DOB')], { displayOrder: 1 })],
      },
      values: {},
      mode: 'blank',
      settings: {
        showPhoto: false,
        advanced: {
          header: { continuation: 'none' },
          footer: { placement: 'first' },
          sections: { SECOND: { startNewPage: true } },
          content: {
            showInstructions: true,
            instructionsPlacement: 'separate-page',
            showChecklist: true,
            checklistPlacement: 'separate-page',
            showDeclaration: true,
            signaturePlacement: 'separate-page',
            showOfficeUse: true,
            officePlacement: 'separate-page',
            translations: {
              en: {
                instructions: 'Instruction page only',
                checklist: ['Configured document'],
                declaration: 'Configured declaration text',
              },
            },
          },
        },
      },
    });
    const result = await artifact('advanced-separate-pages', model);
    expect(result.pages).toHaveLength(6);
    [
      'Instruction page only',
      'STUDENT',
      'SECOND',
      'Configured document',
      'Parent signature',
      'For office use only',
    ].forEach((copy, index) => expect(result.texts[index]).toContain(copy));
    expect(result.texts[0]).toContain('Page 1 of 6');
    expect(
      result.texts
        .slice(1)
        .every((text) => !text.includes('Example Institute') && !/Page \d/.test(text))
    ).toBe(true);
  }, 30000);

  it('repeats long table headings only on their table pages and keeps every repeated answer', async () => {
    const model = buildAdmissionPrintDocument({
      definition: {
        name: 'Registration',
        sections: [
          section(
            'FAMILY',
            [
              question('PERSON', { label: 'Person name' }),
              question('RELATION', { label: 'Relationship', displayOrder: 1 }),
            ],
            { isRepeatable: true, minEntries: 1 }
          ),
          section('FINAL', [question('NOTE', { label: 'Final note' })], { displayOrder: 1 }),
        ],
      },
      values: {
        PERSON: JSON.stringify(Array.from({ length: 45 }, (_, index) => `Person ${index + 1}`)),
        RELATION: JSON.stringify(Array.from({ length: 45 }, () => 'Relative')),
        NOTE: '"Final answer"',
      },
      mode: 'filled',
      settings: {
        showPhoto: false,
        showSignature: false,
        advanced: {
          sections: { FAMILY: { repeatTableHeadings: true } },
          border: { enabled: true },
        },
      },
    });
    const result = await artifact('advanced-repeat-table', model);
    expect(result.pages.length).toBeGreaterThan(2);
    const tablePages = result.texts.filter((text) => /Person \d/.test(text));
    expect(tablePages.length).toBeGreaterThan(1);
    expect(
      tablePages.every((text) => text.includes('Person name') && text.includes('Relationship'))
    ).toBe(true);
    expect(result.texts.at(-1)).toContain('Final answer');
    expect(result.texts.at(-1)).not.toContain('Person name');
    expect(result.text.match(/Person \d+(?!\d)/g)).toHaveLength(45);
  }, 30000);

  it.each(['gu', 'hi'] as const)(
    'prints configured %s instructions/declaration and complete non-Latin answers with serif preference',
    async (language) => {
      const name = language === 'gu' ? 'દીપ્તિ શાહ' : 'दीप्ति शाह';
      const instructions =
        language === 'gu' ? 'વિગતો સ્પષ્ટ અક્ષરે લખો.' : 'विवरण स्पष्ट अक्षरों में लिखें।';
      const declaration = language === 'gu' ? 'આપેલ વિગતો સાચી છે.' : 'दी गई जानकारी सही है।';
      const model = buildAdmissionPrintDocument({
        definition: { name: 'Registration', sections: [section('STUDENT')] },
        values: { NAME: JSON.stringify(name) },
        mode: 'filled',
        language,
        settings: {
          showPhoto: false,
          advanced: {
            style: { fontFamily: 'serif' },
            content: {
              showInstructions: true,
              showDeclaration: true,
              translations: { [language]: { instructions, declaration } },
            },
          },
        },
      });
      const result = await artifact(`advanced-language-${language}`, model);
      expect(result.pages).toHaveLength(1);
      expect(model.steps[0].sections[0].entries[0].fields[0].value).toBe(name);
      // Indic PDF extraction can reorder shaped pre-base vowel marks; raster review verifies names.
      expect(result.text).toContain(language === 'gu' ? 'શાહ' : 'सही');
      expect(result.text).toContain(language === 'gu' ? 'અક્ષરે' : 'अक्षरों');
      expect(result.text).toContain(language === 'gu' ? 'સાચી' : 'सही');
      expect(result.text).not.toContain('\ufffd');
    },
    30000
  );

  it('prints each writing instruction as a separate bullet and uses uploaded signature images', async () => {
    const signature =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
    const model = buildAdmissionPrintDocument({
      definition: { name: 'Registration', sections: [section('STUDENT')] },
      values: {},
      mode: 'blank',
      settings: {
        advanced: {
          content: {
            showInstructions: true,
            translations: { en: { instructions: 'Use black ink.\nWrite clearly.' } },
            parentSignatureImage: signature,
            officeSignatureImage: signature,
          },
        },
      },
    });
    const result = await artifact('instruction-list-signature-images', model);
    expect(result.text).toContain('Use black ink.');
    expect(result.text).toContain('Write clearly.');
    expect(result.text.match(/•/g)).toHaveLength(2);
    const pdf = await pdfjs();
    const imageCount = result.pages[0].operators.fnArray.filter((operation) =>
      [pdf.OPS.paintImageXObject, pdf.OPS.paintInlineImageXObject].includes(operation)
    );
    expect(imageCount.length).toBeGreaterThanOrEqual(2);
  }, 30000);
  it.each(
    (['A4', 'A5', 'LETTER', 'LEGAL'] as const).flatMap((paperSize, index) =>
      (['portrait', 'landscape'] as const).map((orientation) => ({
        paperSize,
        orientation,
        template: (['simple', 'boxed-grid', 'structured-classic'] as const)[index % 3],
      }))
    )
  )(
    'prints $paperSize $orientation $template with the selected paper geometry and continuous registration number',
    async ({ paperSize, orientation, template }) => {
      const model = buildAdmissionPrintDocument({
        definition: { name: 'Registration', sections: [section('STUDENT')] },
        values: { NAME: '"Aanya"' },
        mode: 'filled',
        registrationNumber: 'REG-2026-0017',
        settings: {
          template,
          paperSize,
          showPhoto: false,
          advanced: { paper: { orientation }, border: { enabled: true, style: 'double' } },
        },
      });
      const result = await artifact(`advanced-${paperSize}-${orientation}-${template}`, model);
      const sizes = {
        A4: [595.28, 841.89],
        A5: [419.53, 595.28],
        LETTER: [612, 792],
        LEGAL: [612, 1008],
      };
      const size = orientation === 'portrait' ? sizes[paperSize] : [...sizes[paperSize]].reverse();
      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].viewport.width).toBeCloseTo(size[0], 0);
      expect(result.pages[0].viewport.height).toBeCloseTo(size[1], 0);
      expect(result.text).toContain('Registration No.');
      expect(result.text).toContain('REG-2026-0017');
      expect(result.text).toContain('Aanya');
    },
    30000
  );

  it.each(['blank', 'filled'] as const)(
    'applies configured content, field controls, blank rows and custom footer to %s copies',
    async (mode) => {
      const advanced: AdmissionPrintAdvancedSettings = {
        header: {
          phone: true,
          email: true,
          website: true,
          title: 'School registration',
          subtitle: 'Academic session',
          board: true,
          medium: true,
          class: true,
          academicYear: true,
        },
        fields: {
          NAME: {
            showRequired: false,
            showHelp: true,
            answerStyle: 'line',
            labelPosition: 'inline',
            width: 'full',
          },
        },
        sections: { FAMILY: { blankRows: 3, columns: 2 } },
        footer: {
          alignment: 'center',
          registrationReference: true,
          schoolName: true,
          formTitle: true,
        },
        content: {
          showInstructions: true,
          showChecklist: true,
          showDeclaration: true,
          showOfficeUse: true,
          signatureDate: true,
          translations: {
            en: {
              instructions: 'Write clearly in capital letters.',
              checklist: ['Birth certificate', 'Address proof'],
              declaration: 'I confirm the details entered are correct.',
              parentLabel: 'Parent approval',
              officeLabel: 'Office approval',
            },
          },
        },
        copies: { unanswered: 'dash', selectedChoices: 'mark' },
      };
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          sections: [
            section('STUDENT', [
              question('NAME', { helpText: 'Use the legal name' }),
              question('CHOICE', {
                fieldType: 6,
                displayOrder: 1,
                optionsJson: '[{"value":"a","label":"Option A"},{"value":"b","label":"Option B"}]',
              }),
            ]),
            section('FAMILY', [question('RELATIVE')], {
              displayOrder: 1,
              isRepeatable: true,
              minEntries: 1,
            }),
          ],
        },
        values: { NAME: '"Aanya"', CHOICE: '"b"', RELATIVE: '["One","Two"]' },
        mode,
        registrationNumber: 'REG-17',
        academicDetails: {
          board: 'CBSE',
          medium: 'English',
          class: 'Class 1',
          academicYear: '2026-2027',
        },
        settings: { template: 'boxed-grid', showPhoto: false, advanced },
      });
      const result = await artifact(`advanced-content-${mode}`, model);
      [
        'School registration',
        'Academic session',
        'school@example.test',
        'Write clearly in capital letters.',
        'Birth certificate',
        'Address proof',
        'I confirm the details entered are correct.',
        'Use the legal name',
        'Parent approval',
        'Office approval',
        'For office use only',
        'Verification date',
        'School stamp',
      ].forEach((copy) => expect(result.text).toContain(copy));
      expect(result.text).not.toContain('NAME *');
      expect(result.text).toContain('Option A');
      expect(result.text).toContain('Option B');
      expect(result.text.includes('CBSE')).toBe(mode === 'filled');
      expect(
        model.steps.flatMap((step) => step.sections).find((part) => part.code === 'FAMILY')?.entries
      ).toHaveLength(mode === 'blank' ? 3 : 2);
      expect(result.text.match(/RELATIVE \*/g)).toHaveLength(1);
      if (mode === 'filled') {
        expect(result.text).toContain('One');
        expect(result.text).toContain('Two');
      }
      expect(result.text.includes('Aanya')).toBe(mode === 'filled');
    },
    30000
  );

  it.each(['blank', 'filled'] as const)(
    'preserves every %s entry when a full school header leaves no space under a repeated table heading',
    async (mode) => {
      const names = Array.from({ length: 10 }, (_, index) => `QA Relative Answer ${index + 1}.`);
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          sections: [
            section('STUDENT'),
            section(
              'RELATIVES',
              [
                question('PERSON', { helpText: 'guidance '.repeat(67) }),
                question('RELATION', { displayOrder: 1 }),
                question('AGE', { displayOrder: 2 }),
              ],
              { displayOrder: 1, isRepeatable: true, minEntries: 2, entryLabel: 'Relative' }
            ),
          ],
        },
        values: mode === 'filled' ? { PERSON: JSON.stringify(names) } : {},
        mode,
        settings: {
          paperSize: 'A5',
          showPhoto: false,
          showSignature: false,
          advanced: {
            header: { continuation: 'full' },
            fields: { PERSON: { showHelp: true } },
            sections: { RELATIVES: { blankRows: 10, repeatTableHeadings: true } },
          },
        },
      });

      const result = await artifact(`advanced-full-header-with-tall-table-heading-${mode}`, model, {
        schoolName: 'DDVS',
        addressLines: ['Surat, Gujarat 395010', 'India'],
      });

      expect(result.pages.length).toBeGreaterThan(1);
      expect(result.texts.every((page) => page.includes('Surat, Gujarat 395010'))).toBe(true);
      expect(result.text.match(/Relative \d+/g)).toEqual(
        Array.from({ length: 10 }, (_, index) => `Relative ${index + 1}`)
      );
      expect(result.text.match(/PERSON \*/g)).toHaveLength(10);
      expect(names.filter((name) => result.text.includes(name))).toEqual(
        mode === 'filled' ? names : []
      );
    },
    30000
  );

  it.each(['compact', 'full', 'none'] as const)(
    'uses the %s continuation header, per-page border/footer and preserves every long answer',
    async (continuation) => {
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          fieldsPerRow: 1,
          sections: [
            section(
              'LONG',
              Array.from({ length: 25 }, (_, index) =>
                question(`QUESTION_${index}`, { fieldType: 1, displayOrder: index })
              )
            ),
          ],
        },
        values: Object.fromEntries(
          Array.from({ length: 25 }, (_, index) => [
            `QUESTION_${index}`,
            JSON.stringify(`Answer ${index}. ${'Complete answer remains visible. '.repeat(12)}`),
          ])
        ),
        mode: 'filled',
        settings: {
          template: 'structured-classic',
          showPhoto: false,
          advanced: {
            header: { continuation, email: true },
            border: { enabled: true, placement: 'every' },
            footer: { pageNumbers: true },
          },
        },
      });
      const result = await artifact(`advanced-continuation-${continuation}`, model);
      expect(result.pages.length).toBeGreaterThan(2);
      expect(result.text.match(/QUESTION_\d+/g)).toHaveLength(25);
      const body = result.texts
        .map((text) =>
          text.replace(
            /Example Institute|Complete campus address|Surat, Gujarat|school@example.test|Registration No\.|Registration|Date|Page \d+ of \d+/g,
            ''
          )
        )
        .join('')
        .replace(/[-\s]/g, '');
      expect(body.match(/Completeanswerremainsvisible\./g)).toHaveLength(300);
      expect(result.text.match(/school@example\.test/g)).toHaveLength(
        continuation === 'full' ? result.pages.length : 1
      );
      result.texts.forEach((text, index) =>
        expect(text).toContain(`Page ${index + 1} of ${result.pages.length}`)
      );
      if (continuation === 'none')
        expect(result.texts.slice(1).every((text) => !text.includes('Example Institute'))).toBe(
          true
        );
    },
    30000
  );
});
