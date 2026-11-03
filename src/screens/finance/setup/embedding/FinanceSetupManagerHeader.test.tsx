import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { FinanceSetupManagerHeader } from './FinanceSetupManagerHeader';
import { FinanceSetupEmbeddingProvider } from './FinanceSetupEmbeddingProvider';

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: string; action: React.ReactNode }) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));

it('retains the standalone Finance header and its native action outside the guide', () => {
  const add = vi.fn();
  render(
    <FinanceSetupManagerHeader
      heading="Income Category"
      links={[]}
      action={
        <button type="button" onClick={add}>
          Add income category
        </button>
      }
    />
  );
  expect(screen.getByRole('heading', { name: 'Income Category' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Add income category' }));
  expect(add).toHaveBeenCalledOnce();
});
it('keeps native add actions without repeating the screen title inside the guide', () => {
  const add = vi.fn();
  render(
    <FinanceSetupEmbeddingProvider onEditorOpenChange={vi.fn()}>
      <FinanceSetupManagerHeader
        heading="Income Category"
        links={[]}
        action={
          <button type="button" onClick={add}>
            Add income category
          </button>
        }
      />
    </FinanceSetupEmbeddingProvider>
  );
  expect(screen.queryByRole('heading', { name: 'Income Category' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add income category' }));
  expect(add).toHaveBeenCalledOnce();
});
it('reports open editors and releases the guide lock when the editor closes or unmounts', () => {
  const report = vi.fn();
  const view = render(
    <FinanceSetupEmbeddingProvider onEditorOpenChange={report}>
      <FinanceSetupManagerHeader heading="Collection Policy" links={[]} editorOpen />
    </FinanceSetupEmbeddingProvider>
  );
  expect(report).toHaveBeenLastCalledWith(true);
  view.rerender(
    <FinanceSetupEmbeddingProvider onEditorOpenChange={report}>
      <FinanceSetupManagerHeader heading="Collection Policy" links={[]} />
    </FinanceSetupEmbeddingProvider>
  );
  expect(report).toHaveBeenLastCalledWith(false);
  view.unmount();
  expect(report).toHaveBeenLastCalledWith(false);
});

it('places the native action in the tabs toolbar and preserves its handler, disabled state and cleanup', () => {
  render(<div role="toolbar" aria-label="Setting actions" />);
  const actionContainer = screen.getByRole('toolbar', { name: 'Setting actions' });
  const add = vi.fn();
  const report = vi.fn();
  const content = (disabled: boolean) => (
    <FinanceSetupEmbeddingProvider onEditorOpenChange={report} actionContainer={actionContainer}>
      <FinanceSetupManagerHeader
        heading="Income Category"
        links={[]}
        action={
          <button type="button" disabled={disabled} onClick={add}>
            Add income category
          </button>
        }
      />
    </FinanceSetupEmbeddingProvider>
  );
  const view = render(content(false));
  const button = screen.getByRole('button', { name: 'Add income category' });
  expect(actionContainer).toContainElement(button);
  expect(view.container).not.toContainElement(button);
  fireEvent.click(button);
  expect(add).toHaveBeenCalledOnce();
  view.rerender(content(true));
  expect(screen.getByRole('button', { name: 'Add income category' })).toBeDisabled();
  view.unmount();
  expect(actionContainer).toBeEmptyDOMElement();
});
