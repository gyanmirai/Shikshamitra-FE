const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const output = path.resolve(
    process.argv[2] || path.join(root, '../reports/account-settings-fixes-2026-10-14')
  );
  const runtime = path.join(root, 'tmp/account-settings-qa/indic-pdf-regression.mjs');
  await fs.mkdir(path.dirname(runtime), { recursive: true });
  await fs.mkdir(output, { recursive: true });
  const source = await fs.readFile(
    path.join(root, 'src/components/customizabaleTable/indic-pdf-export.tsx'),
    'utf8'
  );
  await fs.writeFile(
    runtime,
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText
  );
  const { createIndicTablePdfBlob } = await import(pathToFileURL(runtime).href);
  const rows = [
    ['Class 10 शुल्क', 'खर्च / शुल्क', 'पता क्षेत्र शिक्षा\n<b>literal</b>', '***@qa'],
    ['Gujarati ખર્ચ', 'શાળા', 'પહેલો સબક કોને કહેવાય છે ?', '-'],
    ...Array.from({ length: 80 }, (_, index) => [
      `Row ${index + 1} शुल्क`,
      'खर्च',
      'Unicode regression, no transactions.',
      '-',
    ]),
  ];
  const blob = await createIndicTablePdfBlob(
    {
      title: 'Accounts Unicode Regression',
      head: ['Name', 'Tags', 'Description', 'UPI'],
      body: rows,
    },
    path.join(root, 'public/fonts').replaceAll('\\', '/')
  );
  await fs.writeFile(
    path.join(output, 'unicode-regression.pdf'),
    new Uint8Array(await blob.arrayBuffer())
  );
  await fs.writeFile(
    path.join(output, 'unicode-regression-input.json'),
    JSON.stringify(rows, null, 2)
  );
  console.log(`Rendered ${rows.length} mixed-script rows, ${blob.size} PDF bytes.`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
