import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { IdentityAssetSummary } from './identity-asset-summary';

import type { EffectiveIdentityAsset } from '../types';

vi.mock('./identity-image', () => ({
  IdentityImage: () => <span role="img" aria-label="Authorized asset" />,
}));
const theme = createTheme(defaultSettings);
const item: EffectiveIdentityAsset = {
  source: 'School default',
  selection: { mode: 1, principalName: 'Private principal', designation: 'Principal' },
  asset: {
    id: 'signature',
    kind: 2,
    fileName: 'private-signature.png',
    width: 800,
    height: 300,
    size: 12000,
    contentType: 'image/png',
  },
};
const show = (value?: EffectiveIdentityAsset, restricted = false) =>
  render(
    <ThemeProvider theme={theme}>
      <IdentityAssetSummary
        kind="signature"
        label="Principal’s signature"
        context={{}}
        item={value}
        restricted={restricted}
      />
    </ThemeProvider>
  );
afterEach(cleanup);
describe('identity asset overview visibility', () => {
  it('keeps configured asset metadata together with its image and source', () => {
    show(item);
    expect(screen.getByRole('img')).toBeVisible();
    expect(screen.getByText('private-signature.png')).toBeVisible();
    expect(screen.getByText('School default')).toBeVisible();
    expect(screen.getByText('Private principal')).toBeVisible();
  });
  it('does not render a suppressed image or signing details even when stale metadata remains', () => {
    show({ ...item, selection: { ...item.selection, mode: 2 } });
    expect(screen.getByText('Do not display')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText('private-signature.png')).not.toBeInTheDocument();
    expect(screen.queryByText('Private principal')).not.toBeInTheDocument();
  });
  it('treats missing assets as unconfigured and uses an explicit restricted state', () => {
    const view = show();
    expect(screen.getByText('No image configured')).toBeVisible();
    expect(screen.queryByText('Signature access is restricted')).not.toBeInTheDocument();
    view.unmount();
    show(item, true);
    expect(screen.getByText('Signature access is restricted')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText('private-signature.png')).not.toBeInTheDocument();
    expect(screen.queryByText('Private principal')).not.toBeInTheDocument();
  });
});
