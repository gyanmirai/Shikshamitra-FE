// @vitest-environment node
import { act } from 'react';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { mswServer } from 'src/test/mswServer';
import { it, expect, beforeAll } from 'vitest';

import { createAdmissionFormPdfBlob } from './form-print-pdf';
import { buildAdmissionPrintDocument } from './form-print-model';

import type { AdmissionPrintDocument } from './form-print-model';

const loadPdfJs = (): Promise<typeof import('pdfjs-dist')> =>
  import(
    /* @vite-ignore */ pathToFileURL(
      createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs')
    ).href
  );
const pdfJsPackage = createRequire(import.meta.url).resolve('pdfjs-dist/package.json');

beforeAll(() => mswServer.close());

const question = (code: string, label: string, displayOrder = 0) => ({
  id: code,
  code,
  label,
  fieldType: 0,
  bindingType: 1,
  required: false,
  readOnly: false,
  displayOrder,
});

const cases = (['simple', 'boxed-grid', 'structured-classic'] as const).flatMap((template) =>
  (['compact', 'spacious'] as const).flatMap((layout) =>
    (['blank', 'filled'] as const).map((mode) => ({ template, layout, mode }))
  )
);

function boundaryDocument(
  { template, layout, mode }: (typeof cases)[number],
  fillerRows: number,
  advanced = false
) {
  const filler = Array.from({ length: fillerRows * 2 }, (_, index) =>
    question(`FILLER_${index}`, `Earlier question ${index + 1}`, index)
  );
  const personal = [
    question(
      'FIRST',
      Array.from({ length: 8 }, (_, index) => `Primary detail ${index + 1}`).join('\n')
    ),
    question('IDENTITY', 'Identity reference', 1),
    question('GENDER', 'Gender', 2),
    question('BIRTH', 'Date of birth', 3),
    ...Array.from({ length: 32 }, (_, index) =>
      question(`DETAIL_${index}`, `Additional detail ${index + 1}`, index + 4)
    ),
  ];
  const model = buildAdmissionPrintDocument({
    definition: {
      name: 'Registration form',
      fieldsPerRow: 2,
      sections: [
        {
          id: 'earlier',
          code: 'EARLIER',
          name: 'Previous information',
          displayOrder: 0,
          stepCode: 'EARLIER_STEP',
          stepName: 'Previous step',
          fields: filler,
        },
        {
          id: 'personal',
          code: 'PERSONAL',
          name: 'Personal information',
          displayOrder: 1,
          stepCode: 'PERSONAL_STEP',
          stepName: 'Personal step',
          fields: personal,
        },
      ],
    },
    values: {
      FIRST: 'Written answer',
      IDENTITY: 'Identity answer',
      GENDER: 'Male',
      BIRTH: '14 May 2012',
    },
    mode,
    settings: { template, layout, showSignature: false, ...(advanced ? { advanced: {} } : {}) },
  });
  const { fields } = model.steps[1].sections[0].entries[0];
  fields[2].kind = 'choice';
  fields[2].options = ['Male', 'Female'].map((label) => ({ label, value: label }));
  fields[3].writingFormat = 'date';
  return model;
}

async function readPages(model: AdmissionPrintDocument, addressLines: string[] = []) {
  let blob: Blob | undefined;
  await act(async () => {
    blob = await createAdmissionFormPdfBlob(
      model,
      { schoolName: 'Example School', addressLines },
      path.resolve('public/fonts')
    );
  });
  const pdfjs = await loadPdfJs();
  const loading = pdfjs.getDocument({
    data: new Uint8Array(await blob!.arrayBuffer()),
    standardFontDataUrl: pathToFileURL(
      `${path.join(path.dirname(pdfJsPackage), 'standard_fonts')}${path.sep}`
    ).href,
  });
  try {
    const document = await loading.promise;
    return await Promise.all(
      Array.from({ length: document.numPages }, async (_, index) => {
        const page = await document.getPage(index + 1);
        const content = await page.getTextContent();
        return content.items.filter((item) => 'str' in item).filter((item) => item.str.trim());
      })
    );
  } finally {
    await loading.destroy();
  }
}

it.each(
  cases.flatMap((testCase) =>
    (testCase.layout === 'compact' ? [12, 13, 14, 15] : [9, 10, 11, 12]).map((fillerRows) => ({
      ...testCase,
      fillerRows,
    }))
  )
)(
  'keeps headings and rows together in $template $layout $mode PDFs after $fillerRows rows',
  async ({ fillerRows, ...testCase }) => {
    const pages = await readPages(boundaryDocument(testCase, fillerRows));
    const pageOf = (text: string) =>
      pages.findIndex((items) => items.some((item) => item.str === text));
    const headingPage = pageOf('Personal step');
    expect(headingPage).toBeGreaterThanOrEqual(0);
    ['Personal information', 'Primary detail 1', 'Primary detail 8', 'Identity reference'].forEach(
      (text) => expect(pageOf(text)).toBe(headingPage)
    );
    const identityPage = pageOf('Gender');
    expect(identityPage).toBeGreaterThanOrEqual(0);
    expect(pageOf('Date of birth')).toBe(identityPage);
    expect(pageOf('Male')).toBe(identityPage);
    if (testCase.mode === 'filled') expect(pageOf('14 May 2012')).toBe(identityPage);
    expect(pageOf('Additional detail 32')).toBeGreaterThan(headingPage);
    pages.flat().forEach((item) => {
      if (!/^Page \d+ of/.test(item.str)) expect(item.transform[5]).toBeGreaterThan(40);
    });
  },
  30000
);

it.each([8, 9, 10, 11])(
  'keeps a non-repeating table heading with its first entry after %i rows',
  async (fillerRows) => {
    const model = boundaryDocument(
      { template: 'boxed-grid', layout: 'compact', mode: 'filled' },
      fillerRows,
      true
    );
    const section = model.steps[1].sections[0];
    const [name, relation] = section.entries[0].fields.slice(1, 3);
    section.repeatable = true;
    section.entries = Array.from({ length: 26 }, (_, index) => ({
      key: `person-${index}`,
      fields: [
        { ...name, label: 'Relative name', value: `Relative ${index + 1}` },
        {
          ...relation,
          kind: 'text',
          label: 'Relationship notes',
          value: index === 0 ? 'Relationship detail. '.repeat(35) : `Note ${index + 1}`,
        },
      ],
    }));
    model.settings.advanced = { sections: { PERSONAL: { repeatTableHeadings: false } } };
    const pages = await readPages(model);
    const pageOf = (text: string) =>
      pages.findIndex((items) => items.some((item) => item.str === text));
    const headingPage = pageOf('Personal step');
    expect(headingPage).toBeGreaterThanOrEqual(0);
    ['Personal information', 'Relative name', 'Relative 1'].forEach((text) =>
      expect(pageOf(text)).toBe(headingPage)
    );
    expect(pageOf('Relative 26')).toBeGreaterThanOrEqual(1);
  },
  30000
);

it.each(['boxed-grid', 'structured-classic'] as const)(
  'keeps a tall first row and its heading together in configurable %s PDFs',
  async (template) => {
    const model = boundaryDocument({ template, layout: 'compact', mode: 'filled' }, 10, true);
    const { fields } = model.steps[1].sections[0].entries[0];
    fields[0].label = [
      'Primary detail 1',
      'Registration details for this field. '.repeat(28),
      'Primary detail 8',
    ].join('\n');
    model.settings.advanced = { fields: { FIRST: { width: 'full' } } };
    const pages = await readPages(model);
    const pageOf = (text: string) =>
      pages.findIndex((items) => items.some((item) => item.str === text));
    const headingPage = pageOf('Personal step');
    expect(headingPage).toBeGreaterThanOrEqual(0);
    ['Personal information', 'Primary detail 1', 'Primary detail 8', 'Written answer'].forEach(
      (text) => expect(pageOf(text)).toBe(headingPage)
    );
  },
  30000
);

it.each([
  { repeats: 80, spansPages: false },
  { repeats: 200, spansPages: true },
])(
  'splits a long filled answer only when it exceeds a fresh page ($repeats repeats)',
  async ({ repeats, spansPages }) => {
    const model = boundaryDocument(
      { template: 'boxed-grid', layout: 'spacious', mode: 'filled' },
      9
    );
    const [step] = model.steps;
    const [section] = step.sections;
    const [entry] = section.entries;
    const [field] = entry.fields;
    step.title = section.title;
    model.steps = [step];
    entry.fields = Array.from({ length: 20 }, (_, index) => ({
      ...field,
      kind: 'multiline',
      key: `response-${index}`,
      label: `Question ${index + 1}`,
      value:
        index === 12
          ? `Start response. ${'Long registration answer with no clipping. '.repeat(repeats)}End response.`
          : `Answer ${index + 1}: ${'Long registration answer with no clipping. '.repeat(3)}`,
    }));
    const pages = await readPages(model, ['Surat, Gujarat']);
    const pageOf = (text: string) =>
      pages.findIndex((items) => items.some((item) => item.str.includes(text)));
    const startPage = pageOf('Start response.');
    const endPage = pageOf('End response.');
    expect(startPage).toBeGreaterThanOrEqual(0);
    expect(endPage).toBeGreaterThanOrEqual(startPage);
    expect(endPage > startPage).toBe(spansPages);
  },
  30000
);
