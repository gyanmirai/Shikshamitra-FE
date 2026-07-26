import { it, expect, describe } from 'vitest';

import { getExportableColumns, extractTextFromReactNode } from './utils';

describe('customizable table rendered-value export', () => {
  it('keeps candidate name and email separated when exporting a stacked cell', () => {
    const renderedCandidate = {
      props: {
        children: [
          { props: { children: 'Riya Shah' } },
          { props: { children: 'riya@example.com' } },
        ],
      },
    };

    expect(extractTextFromReactNode(renderedCandidate)).toBe('Riya Shah riya@example.com');
  });

  it('exports a chip label instead of its numeric source value', () => {
    expect(extractTextFromReactNode({ props: { label: 'Ready for onboarding' } })).toBe(
      'Ready for onboarding'
    );
  });

  it('omits hidden, action, and explicitly non-exportable columns', () => {
    const columns = [
      { id: 'name', label: 'Name' },
      { id: 'upload', label: 'Upload', excludeFromExport: true },
      { id: 'actions', label: 'Actions' },
      { id: 'internal', label: 'Internal' },
    ];

    expect(
      getExportableColumns(columns, {
        name: true,
        upload: true,
        actions: true,
        internal: false,
      }).map((column) => column.id)
    ).toEqual(['name']);
  });
});
