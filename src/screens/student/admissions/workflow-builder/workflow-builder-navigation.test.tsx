import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { WorkflowBuilderCanvas } from './components/workflow-builder-canvas';

const handlers = {
  onAddStage: vi.fn(),
  onEditStage: vi.fn(),
  onDuplicateStage: vi.fn(),
  onDeleteStage: vi.fn(),
  onDragEnd: vi.fn(),
  onAddTransition: vi.fn(),
  onEditTransition: vi.fn(),
  onDeleteTransition: vi.fn(),
};

const store = configureStore({ reducer: { confirmPopup } });

function Canvas({ view }: { view: 'configure' | 'map' }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <WorkflowBuilderCanvas
          view={view}
          stages={[]}
          transitions={[]}
          readOnly={false}
          loadingStageTypes={false}
          issueCountByStage={{}}
          {...handlers}
        />
      </ThemeProvider>
    </Provider>
  );
}

describe('WorkflowBuilderCanvas navigation', () => {
  it('renders the selected view in its associated tab panel', () => {
    const { rerender } = render(<Canvas view="configure" />);

    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'workflow-builder-configure-tab'
    );
    expect(
      within(screen.getByRole('region', { name: 'Journey' })).getByRole('button', {
        name: 'Add first stage',
      })
    ).toBeEnabled();

    rerender(<Canvas view="map" />);

    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'workflow-builder-map-tab'
    );
  });
});
