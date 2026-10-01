import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundGeneralSection from './refund/RefundGeneralSection';
import ProrationGeneralSection from './proration/ProrationGeneralSection';
import CollectionGeneralSection from './collection/CollectionGeneralSection';
import ConcessionGeneralSection from './concession/ConcessionGeneralSection';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: any) => children,
}));

const sections = [
  ['Collection', CollectionGeneralSection],
  ['Concession', ConcessionGeneralSection],
  ['Refund', RefundGeneralSection],
  ['Proration', ProrationGeneralSection],
] as const;

const form = (isDefault: boolean) => ({
  values: {
    policyName: 'Test policy',
    status: 'Active',
    isDefault,
    description: '',
    policyCode: '',
  },
  initialValues: { isDefault },
  errors: {},
  touched: {},
  handleChange: vi.fn(),
  handleBlur: vi.fn(),
  setFieldValue: vi.fn(),
});

describe.each(sections)('%s policy default lifecycle', (_family, Section) => {
  it('locks the existing default and disables returning it to Draft', () => {
    const formik = form(true);
    render(<Section formik={formik as any} />);
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('switch')).toBeDisabled();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: /Draft/ })).toHaveAttribute('aria-disabled', 'true');
    expect(formik.setFieldValue).not.toHaveBeenCalled();
  });

  it('allows another Active policy to replace the default', () => {
    const formik = form(false);
    render(<Section formik={formik as any} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(formik.setFieldValue).toHaveBeenCalledExactlyOnceWith('isDefault', true);
  });
});
