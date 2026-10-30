import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ApplicationInquiryContext } from './application-inquiry-context';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('../admission-runtime-field', () => ({
  default: ({
    field,
    value,
    disabled,
  }: {
    field: { label: string };
    value: string;
    disabled: boolean;
  }) => <input aria-label={field.label} value={value} disabled={disabled} readOnly />,
}));

describe('Application source Inquiry context', () => {
  it('shows source-owned details read-only using frozen values rather than editable Registration answers', () => {
    render(
      <ApplicationInquiryContext
        sections={[
          {
            id: 'source',
            code: 'SOURCE',
            name: 'Inquiry Details',
            displayOrder: 0,
            fields: [
              {
                id: 'source-type',
                sectionId: 'source',
                code: 'SOURCE_TYPE',
                label: 'Inquiry type',
                bindingType: 0,
                bindingKey: 'Inquiry.TypeId',
                fieldType: 0,
                displayOrder: 0,
                required: false,
                readOnly: true,
              },
            ],
          },
        ]}
        values={[{ fieldCode: 'SOURCE_TYPE', valueJson: '"School visit"' }]}
        language="en"
      />
    );
    expect(screen.getByLabelText('Inquiry type')).toHaveValue('School visit');
    expect(screen.getByLabelText('Inquiry type')).toBeDisabled();
  });
  it('does not reveal a source field whose source visibility rule is false', () => {
    render(
      <ApplicationInquiryContext
        sections={[
          {
            id: 'source',
            code: 'SOURCE',
            name: 'Inquiry Details',
            displayOrder: 0,
            fields: [
              {
                id: 'hidden',
                sectionId: 'source',
                code: 'HIDDEN',
                label: 'Hidden source answer',
                bindingType: 1,
                bindingKey: 'HIDDEN',
                fieldType: 0,
                displayOrder: 0,
                required: false,
                readOnly: true,
                visibilityRuleJson: '{"field":"SHOW","operator":"Equals","value":"yes"}',
              },
            ],
          },
        ]}
        values={[
          { fieldCode: 'SHOW', valueJson: '"no"' },
          { fieldCode: 'HIDDEN', valueJson: '"Private"' },
        ]}
        language="en"
      />
    );
    expect(screen.queryByLabelText('Hidden source answer')).not.toBeInTheDocument();
  });
});
