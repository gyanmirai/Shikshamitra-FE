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

const viewHrefs = {
  configure: '/student/admissions/settings/workflows/workflow-1?panel=usage',
  map: '/student/admissions/settings/workflows/workflow-1?panel=usage&view=map',
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
          viewHrefs={viewHrefs}
          {...handlers}
        />
      </ThemeProvider>
    </Provider>
  );
}

describe('WorkflowBuilderCanvas navigation', () => {
  it('renders durable views as links with an associated tab panel', () => {
    const { rerender } = render(<Canvas view="configure" />);

    const configure = screen.getByRole('tab', { name: 'Configure' });
    const map = screen.getByRole('tab', { name: 'Journey map' });
    expect(configure.tagName).toBe('A');
    expect(configure).toHaveAttribute('href', viewHrefs.configure);
    expect(map).toHaveAttribute('href', viewHrefs.map);
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'workflow-builder-configure-tab'
    );
    expect(
      within(screen.getByRole('region', { name: 'Stages' })).getByRole('button', {
        name: 'Add first stage',
      })
    ).toBeEnabled();
    expect(screen.queryByRole('region', { name: 'Transitions' })).not.toBeInTheDocument();
    expect(screen.getByText(/choose what happens next from each stage/i)).toBeInTheDocument();

    rerender(<Canvas view="map" />);

    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'workflow-builder-map-tab'
    );
  });
});
