// @vitest-environment node
import { act } from 'react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { mswServer } from 'src/test/mswServer';
import { mkdir, writeFile } from 'node:fs/promises';
import { it, expect, describe, beforeAll } from 'vitest';

import { createAdmissionFormPdfBlob } from './form-print-pdf';
import { buildAdmissionPrintDocument } from './form-print-model';

const loadPdfJs = (): Promise<typeof import('pdfjs-dist')> =>
  import(
    /* @vite-ignore */ pathToFileURL(
      createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs')
    ).href
  );

const templates = ['simple', 'boxed-grid', 'structured-classic'] as const;

// These artifacts use local fonts and embedded Yoga WASM; MSW must not rewrite data: fetches.
beforeAll(() => {
  mswServer.close();
});

async function createArtifact(...args: Parameters<typeof createAdmissionFormPdfBlob>) {
  let result: Blob | undefined;
  await act(async () => {
    result = await createAdmissionFormPdfBlob(...args);
  });
  if (process.env.ADMISSION_PRINT_ARTIFACT_DIR) {
    await mkdir(process.env.ADMISSION_PRINT_ARTIFACT_DIR, { recursive: true });
    await writeFile(
      path.join(
        process.env.ADMISSION_PRINT_ARTIFACT_DIR,
        `${args[0].settings.template ?? 'simple'}-${args[0].language}-${args[0].settings.layout}-${args[0].mode}-${args[0].settings.showSchoolHeader ? 'header' : 'plain'}-${args[0].steps.flatMap((step) => step.sections.flatMap((section) => section.entries.flatMap((entry) => entry.fields))).length}.pdf`
      ),
      new Uint8Array(await result!.arrayBuffer())
    );
  }
  return result!;
}

describe('Registration printable PDF artifacts', () => {
  it.each(['blank', 'filled'] as const)(
    'keeps handwriting rows readable in a four-column %s boxed form while preserving filled columns',
    async (mode) => {
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration form',
          fieldsPerRow: 4,
          sections: [
            {
              id: 'main',
              code: 'main',
              name: 'Student details',
              displayOrder: 0,
              fields: [
                'First name',
                'Parent contact',
                'Email',
                'Gender',
                'Campus',
                'Board',
                'Medium',
                'Class',
              ].map((label, index) => ({
                id: `f${index}`,
                code: `F${index}`,
                label,
                fieldType: index === 1 ? 4 : 0,
                bindingType: index === 0 ? 0 : 1,
                bindingKey: index === 0 ? 'Applicant.FirstName' : undefined,
                required: false,
                readOnly: false,
                displayOrder: index,
              })),
            },
          ],
        },
        values: {},
        mode,
        settings: { template: 'boxed-grid' },
      });
      const blob = await createArtifact(model, {}, path.resolve('public/fonts'));
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      try {
        const document = await loading.promise;
        expect(document.numPages).toBe(1);
        const items = (await (await document.getPage(1)).getTextContent()).items;
        const first = items.find((item) => 'str' in item && item.str === 'First name');
        const email = items.find((item) => 'str' in item && item.str === 'Email');
        const campus = items.find((item) => 'str' in item && item.str === 'Campus');
        const last = items.find((item) => 'str' in item && item.str === 'Class');
        if (
          !first ||
          !email ||
          !campus ||
          !last ||
          !('transform' in first) ||
          !('transform' in email) ||
          !('transform' in campus) ||
          !('transform' in last)
        )
          throw new Error('Configured labels must be printed');
        expect(email.transform[5] < first.transform[5]).toBe(mode === 'blank');
        expect(campus.transform[5]).toBe(last.transform[5]);
        expect(email.transform[4]).toBeCloseTo(
          mode === 'blank'
            ? first.transform[4]
            : campus.transform[4] + ((last.transform[4] - campus.transform[4]) * 2) / 3,
          3
        );
      } finally {
        await loading.destroy();
      }
    },
    30000
  );
  it.each(['boxed-grid', 'structured-classic'] as const)(
    'keeps a two-page %s school form together without an extra signature-only page',
    async (template) => {
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration form',
          fieldsPerRow: 2,
          sections: Array.from({ length: 7 }, (_, group) => ({
            id: `s${group}`,
            code: `s${group}`,
            name: `Configured group ${group + 1}`,
            displayOrder: group,
            fields: Array.from({ length: 3 }, (_field, item) => ({
              id: `f${group}_${item}`,
              code: `F${group}_${item}`,
              label: `Configured question ${group + 1}.${item + 1}`,
              fieldType: 0,
              bindingType: 1,
              required: false,
              readOnly: false,
              displayOrder: item,
            })),
          })),
        },
        values: {},
        mode: 'blank',
        settings: { template },
      });
      const blob = await createArtifact(
        model,
        { schoolName: 'Example Institute' },
        path.resolve('public/fonts')
      );
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      try {
        const document = await loading.promise;
        expect(document.numPages).toBe(2);
        const pageTexts = await Promise.all(
          [1, 2].map(async (number) =>
            (await (await document.getPage(number)).getTextContent()).items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ')
          )
        );
        expect(pageTexts[0]).toContain('Page 1 of 2');
        expect(pageTexts[1]).toContain('Page 2 of 2');
        expect(pageTexts[1]).toContain('Configured question 7.3');
        pageTexts.forEach((text) => {
          if (text.includes('Configured question 5.3'))
            expect(text).toContain('Configured question 5.1');
        });
        expect(pageTexts[1]).toContain('Parent signature');
        expect(pageTexts.join(' ').match(/Configured question \d\.\d/g)).toHaveLength(21);
      } finally {
        await loading.destroy();
      }
    },
    30000
  );
  it.each(templates)(
    'keeps every configured address line, long school branding and body separated in %s',
    async (template) => {
      const image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration form',
          sections: [
            {
              id: 'main',
              code: 'main',
              name: 'Student details',
              displayOrder: 0,
              fields: [
                {
                  id: 'first',
                  code: 'FIRST',
                  label: 'First name',
                  fieldType: 0,
                  bindingType: 0,
                  bindingKey: 'Applicant.FirstName',
                  required: true,
                  readOnly: false,
                  displayOrder: 0,
                },
              ],
            },
          ],
        },
        values: {},
        mode: 'blank',
        settings: { template },
      });
      const blob = await createArtifact(
        model,
        {
          schoolName: 'Example International Senior Secondary School and Learning Institute',
          addressLines: [
            'First floor, Educational Campus, near the Science Centre',
            'Long Street Address with Building and Wing Details',
            'Landmark seventeen',
            'Surat, Gujarat, 395006',
            'India',
          ],
          logoUrl: image,
          bannerUrl: image,
        },
        path.resolve('public/fonts')
      );
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      try {
        const document = await loading.promise;
        expect(document.numPages).toBe(1);
        const items = (await (await document.getPage(1)).getTextContent()).items;
        const text = items.map((item) => ('str' in item ? item.str : '')).join(' ');
        [
          'Landmark seventeen',
          'Surat, Gujarat, 395006',
          'India',
          'First name',
          'Page 1 of 1',
        ].forEach((copy) => expect(text).toContain(copy));
        const positions = items.filter(
          (item) =>
            'str' in item && ['India', 'Registration No.', 'Student details'].includes(item.str)
        );
        expect(positions).toHaveLength(template === 'simple' ? 2 : 3);
        expect(
          positions.every((item, index) => {
            const previous = positions[index - 1];
            return (
              index === 0 ||
              ('transform' in item &&
                'transform' in previous &&
                item.transform[5] < previous.transform[5])
            );
          })
        ).toBe(true);
      } finally {
        await loading.destroy();
      }
    },
    30000
  );
  it.each(
    (['boxed-grid', 'structured-classic'] as const).flatMap((template) =>
      (['blank', 'filled'] as const).map((mode) => ({ template, mode }))
    )
  )(
    'prints $template $mode copies with a normal registration-number line and all configured fields',
    async ({ template, mode }) => {
      const pdfjs = await loadPdfJs();
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration form',
          fieldsPerRow: 2,
          sections: [
            {
              id: 'main',
              code: 'main',
              name: 'Student details',
              displayOrder: 0,
              fields: [
                {
                  id: 'first',
                  code: 'FIRST',
                  label: 'First name',
                  bindingType: 0,
                  bindingKey: 'Applicant.FirstName',
                  fieldType: 0,
                  required: true,
                  readOnly: false,
                  displayOrder: 0,
                },
                {
                  id: 'last',
                  code: 'LAST',
                  label: 'Last name',
                  bindingType: 0,
                  bindingKey: 'Applicant.LastName',
                  fieldType: 0,
                  required: false,
                  readOnly: false,
                  displayOrder: 1,
                },
                {
                  id: 'dob',
                  code: 'DOB',
                  label: 'Date of birth',
                  fieldType: 5,
                  bindingType: 0,
                  bindingKey: 'Applicant.DateOfBirth',
                  required: true,
                  readOnly: false,
                  displayOrder: 2,
                },
                {
                  id: 'gender',
                  code: 'GENDER',
                  label: 'Gender',
                  fieldType: 6,
                  bindingType: 0,
                  bindingKey: 'Applicant.Gender',
                  optionsJson:
                    '[{"value":"Other","label":"Other"},{"value":"Female","label":"Female"}]',
                  required: true,
                  readOnly: false,
                  displayOrder: 3,
                },
              ],
            },
            {
              id: 'family',
              code: 'family',
              name: 'Parent and contact details',
              displayOrder: 1,
              fields: [
                {
                  id: 'phone',
                  code: 'PHONE',
                  label: 'Parent contact number',
                  fieldType: 4,
                  bindingType: 1,
                  required: true,
                  readOnly: false,
                  displayOrder: 0,
                },
                {
                  id: 'email',
                  code: 'EMAIL',
                  label: 'Parent email',
                  fieldType: 3,
                  bindingType: 1,
                  required: true,
                  readOnly: false,
                  displayOrder: 1,
                },
                {
                  id: 'address',
                  code: 'ADDRESS',
                  label: 'Residential address',
                  fieldType: 1,
                  bindingType: 1,
                  required: true,
                  readOnly: false,
                  displayOrder: 2,
                },
              ],
            },
          ],
        },
        values: {
          FIRST: '"Aanya"',
          LAST: '"Shah"',
          DOB: '"2016-05-12"',
          GENDER: '"Other"',
          PHONE: '"9876543210"',
          EMAIL: '"parent@example.test"',
          ADDRESS: '"A complete saved residential address"',
        },
        registrationNumber: 'REG-2026-00017',
        mode,
        settings: { template },
      });
      const blob = await createArtifact(
        model,
        { schoolName: 'Example Institute', addressLines: ['Surat, Gujarat'] },
        path.resolve('public/fonts')
      );
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      try {
        const document = await loading.promise;
        expect(document.numPages).toBe(1);
        const page = await document.getPage(1);
        const content = await page.getTextContent();
        const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        expect(text).toContain('Registration No.');
        expect(text).toContain('Date');
        expect(text).toContain('Student details');
        expect(text).toContain('Residential address');
        expect(text.includes('REG-2026-00017')).toBe(mode === 'filled');
        expect(text.includes('Aanya')).toBe(mode === 'filled');
        expect(text.includes('parent@example.test')).toBe(mode === 'filled');
        expect(text).toContain('Page 1 of 1');
        const footer = content.items.find((item) => 'str' in item && item.str.includes('Page 1'));
        expect(footer && 'transform' in footer ? footer.transform[5] : -1).toBeGreaterThan(10);
      } finally {
        await loading.destroy();
      }
    },
    30000
  );
  it.each(
    templates.flatMap((template) =>
      (['blank', 'filled'] as const).map((mode) => ({ template, mode }))
    )
  )(
    'retains every configured and repeated photo in $template $mode artifacts',
    async ({ template, mode }) => {
      const red =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWO8I6LxnwEJMDGgASYGNMDEgAYAifgCH8XBj9IAAAAASUVORK5CYII=';
      const blue =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGklEQVR4AWMUcbvznwEJMDGgASYGNMDEgAYAkDgCPdM8czMAAAAASUVORK5CYII=';
      const photo = (code: string, label: string, displayOrder: number) => ({
        id: code,
        code,
        label,
        fieldType: 10,
        bindingType: 1,
        required: false,
        readOnly: false,
        displayOrder,
        validationJson: '{"format":"photo"}',
      });
      const definition = {
        name: 'Photo registration',
        sections: [
          {
            id: 'main',
            code: 'main',
            name: 'Applicant photographs',
            displayOrder: 0,
            fields: [
              photo('APPLICANT', 'Applicant photograph', 0),
              photo('PARENT', 'Parent photograph', 1),
            ],
          },
          {
            id: 'family',
            code: 'family',
            name: 'Family photographs',
            displayOrder: 1,
            isRepeatable: true,
            minEntries: 2,
            entryLabel: 'Child',
            fields: [photo('CHILD', 'Child photograph', 0)],
          },
        ],
      };
      const model = buildAdmissionPrintDocument({
        definition,
        values: {
          APPLICANT: JSON.stringify(red),
          PARENT: JSON.stringify(blue),
          CHILD: JSON.stringify([red, blue]),
        },
        mode,
        settings: { template },
      });
      const repeated = model.steps
        .flatMap((step) => step.sections)
        .find((section) => section.repeatable)!;
      expect(repeated.entries.map((entry) => entry.fields[0].imageUrl)).toEqual(
        mode === 'filled' ? [red, blue] : [undefined, undefined]
      );
      const blob = await createArtifact(model, undefined, path.resolve('public/fonts'));
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      try {
        const document = await loading.promise;
        const pages = await Promise.all(
          Array.from({ length: document.numPages }, (_, index) => document.getPage(index + 1))
        );
        const texts = await Promise.all(
          pages.map(async (page) =>
            (await page.getTextContent()).items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ')
          )
        );
        const text = texts.join(' ');
        expect(text.match(/Applicant photograph(?!s)/g)).toHaveLength(1);
        expect(text.match(/Parent photograph/g)).toHaveLength(1);
        expect(text.match(/Child photograph/g)).toHaveLength(2);
        expect(text).toContain('Child 1');
        expect(text).toContain('Child 2');
        expect(text).not.toContain('base64');
        if (mode === 'blank') expect(text.match(/Photograph/g)).toHaveLength(4);
        const operations = await Promise.all(pages.map((page) => page.getOperatorList()));
        const images = operations.flatMap((page) =>
          page.fnArray.filter((operation) =>
            [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintInlineImageXObject].includes(operation)
          )
        );
        expect(images).toHaveLength(mode === 'filled' ? 4 : 0);
        if (mode === 'filled') {
          const imageIds = operations.flatMap((page) =>
            page.argsArray
              .filter((_, index) => page.fnArray[index] === pdfjs.OPS.paintImageXObject)
              .map((args) => args[0])
          );
          expect(new Set(imageIds).size).toBe(2);
        }
      } finally {
        await loading.destroy();
      }
    },
    30000
  );

  it.each(
    templates.flatMap((template) =>
      (['compact', 'spacious'] as const).flatMap((layout) =>
        (['blank', 'filled'] as const).map((mode) => ({ template, layout, mode }))
      )
    )
  )(
    'paginates long $template $layout $mode A4 content with school headers, final answers and numbering',
    async ({ template, layout, mode }) => {
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          sections: [
            {
              id: 'main',
              code: 'main',
              name: 'Student details',
              displayOrder: 0,
              fields: Array.from({ length: 65 }, (_, index) => ({
                id: `f${index}`,
                sectionId: 'main',
                code: `F${index}`,
                label: `Question ${index + 1}`,
                fieldType: 1,
                bindingType: 1,
                required: false,
                readOnly: false,
                displayOrder: index,
              })),
            },
          ],
        },
        values: Object.fromEntries(
          Array.from({ length: 65 }, (_, index) => [
            `F${index}`,
            JSON.stringify(
              index === 64
                ? 'Final answer remains visible'
                : `Answer ${index + 1}: ${'Long registration answer with no clipping. '.repeat(index === 12 ? 80 : 3)}`
            ),
          ])
        ),
        mode,
        settings: { template, layout },
      });
      const blob = await createArtifact(
        model,
        { schoolName: 'Example School', addressLines: ['Surat, Gujarat'] },
        path.resolve('public/fonts')
      );
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: bytes });
      const document = await loading.promise;
      try {
        expect(document.numPages).toBeGreaterThan(2);
        const pages = await Promise.all(
          Array.from({ length: document.numPages }, (_, index) => document.getPage(index + 1))
        );
        const answerTexts: string[] = [];
        const texts = await Promise.all(
          pages.map(async (page, pageIndex) => {
            expect(page.getViewport({ scale: 1 }).width).toBeCloseTo(595.28, 0);
            expect(page.getViewport({ scale: 1 }).height).toBeCloseTo(841.89, 0);
            const content = await page.getTextContent();
            answerTexts[pageIndex] = content.items
              .filter(
                (item) =>
                  'str' in item &&
                  ![
                    'Example School',
                    'Surat, Gujarat',
                    'Registration',
                    'Registration No.',
                    'Date',
                    'Photograph',
                  ].includes(item.str) &&
                  !/^Page \d+ of/.test(item.str)
              )
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ');
            const footer = content.items.find(
              (item) => 'str' in item && /^Page \d+ of/.test(item.str)
            );
            expect(footer && 'transform' in footer ? footer.transform[5] : -1).toBeGreaterThan(10);
            // Continued answers must stay above the fixed footer rather than merely exist in PDF text.
            content.items
              .filter((item) => 'str' in item && item.str.trim() && !/^Page \d+ of/.test(item.str))
              .forEach((item) => {
                if ('transform' in item) expect(item.transform[5]).toBeGreaterThan(40);
              });
            return content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
          })
        );
        expect(texts.every((text) => text.includes('Example School'))).toBe(true);
        texts.forEach((text, index) =>
          expect(text).toContain(`Page ${index + 1} of ${document.numPages}`)
        );
        if (mode === 'filled')
          texts.forEach((text) => {
            Array.from(text.matchAll(/Question (\d+)(?![0-9])/g)).forEach((match) => {
              expect(text.slice(match.index!)).toContain(
                match[1] === '65' ? 'Final answer remains visible' : `Answer ${match[1]}:`
              );
            });
          });
        expect(texts.join(' ').includes('Final answer remains visible')).toBe(mode === 'filled');
        if (mode === 'filled')
          expect(
            answerTexts
              .join(' ')
              .replace(/[-\s]/g, '')
              .match(/withnoclipping\./g)
          ).toHaveLength(269);
        expect(texts.join(' ')).toContain('Parent signature');
        for (let index = 1; index <= 65; index += 1) {
          expect(texts.join(' ').match(new RegExp(`Question ${index}(?![0-9])`, 'g'))).toHaveLength(
            1
          );
        }
        expect(texts.join(' ')).not.toContain(String.fromCharCode(0));
        expect(texts.join(' ')).not.toContain('\ufffd');
      } finally {
        await loading.destroy();
      }
    },
    30000
  );

  it.each(
    templates.flatMap((template) => ['gu', 'hi'].map((language) => ({ template, language })))
  )(
    'embeds fonts and produces a real $template $language PDF from multilingual form labels',
    async ({ template, language }) => {
      const label = language === 'gu' ? 'વિદ્યાર્થીનું નામ' : 'विद्यार्थी का नाम';
      const model = buildAdmissionPrintDocument({
        definition: {
          name: 'Registration',
          sections: [
            {
              id: 'main',
              code: 'main',
              name: label,
              displayOrder: 0,
              fields: [
                {
                  id: 'name',
                  sectionId: 'main',
                  code: 'name',
                  label,
                  fieldType: 0,
                  bindingType: 1,
                  readOnly: false,
                  required: true,
                  displayOrder: 0,
                },
              ],
            },
          ],
        },
        values: { name: JSON.stringify(language === 'gu' ? 'દીપ્તિ શાહ' : 'दीप्ति शाह') },
        language,
        mode: 'filled',
        settings: { template },
      });
      const blob = await createArtifact(model, undefined, path.resolve('public/fonts'));
      expect(blob.size).toBeGreaterThan(3000);
      const pdfjs = await loadPdfJs();
      const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      const document = await loading.promise;
      try {
        expect(document.numPages).toBe(1);
        const text = (await (await document.getPage(1)).getTextContent()).items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        expect(text).toContain('Registration');
        expect(text).toContain(language === 'gu' ? 'શાહ' : 'शाह');
        expect(text).toContain(language === 'gu' ? 'પાનું' : 'पृष्ठ');
        expect(text).not.toContain('\ufffd');
      } finally {
        await loading.destroy();
      }
    },
    30000
  );

  it.each(
    templates.flatMap((template) =>
      (['blank', 'filled'] as const).map((mode) => ({ template, mode }))
    )
  )(
    'honors header, photo and signature settings in real $template $mode artifacts',
    async ({ template, mode }) => {
      const image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
      const definition = {
        name: 'Registration',
        sections: [
          {
            id: 'main',
            code: 'main',
            name: 'Student details',
            displayOrder: 0,
            fields: [
              {
                id: 'name',
                code: 'NAME',
                label: 'Applicant name',
                fieldType: 0,
                bindingType: 1,
                required: false,
                readOnly: false,
                displayOrder: 0,
              },
              {
                id: 'photo',
                code: 'PHOTO',
                label: 'Applicant photograph',
                fieldType: 10,
                validationJson: '{"format":"photo"}',
                bindingType: 1,
                required: false,
                readOnly: false,
                displayOrder: 1,
              },
            ],
          },
        ],
      };
      const values = { NAME: '"Private saved answer"', PHOTO: JSON.stringify(image) };
      const pdfjs = await loadPdfJs();
      await [true, false].reduce(async (previous, enabled) => {
        await previous;
        const model = buildAdmissionPrintDocument({
          definition,
          values,
          mode,
          settings: {
            template,
            showSchoolHeader: enabled,
            showPhoto: enabled,
            showSignature: enabled,
          },
        });
        const blob = await createArtifact(
          model,
          { schoolName: 'Branding School', logoUrl: image, bannerUrl: image },
          path.resolve('public/fonts')
        );
        const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
        try {
          const document = await loading.promise;
          const page = await document.getPage(1);
          const text = (await page.getTextContent()).items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
          expect(text.includes('Branding School')).toBe(enabled);
          expect(text.includes('Parent signature')).toBe(enabled);
          expect(text.includes('Private saved answer')).toBe(mode === 'filled');
          const operations = await page.getOperatorList();
          const images = operations.fnArray.filter((operation) =>
            [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintInlineImageXObject].includes(operation)
          );
          expect(images.length).toBe(enabled ? (mode === 'filled' ? 3 : 2) : 0);
        } finally {
          await loading.destroy();
        }
      }, Promise.resolve());
    },
    30000
  );
});
