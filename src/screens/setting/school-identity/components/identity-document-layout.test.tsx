import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { IdentityDocumentLayout } from './identity-document-layout';

import type { IdentityProfile } from '../types';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('./identity-preview', () => ({
  IdentityPreviewButton: () => <button type="button">Preview document</button>,
}));

vi.mock('./identity-image', () => ({
  IdentityImage: ({ id, label }: { id: string; label: string }) => (
    <span role="img" aria-label={label} data-asset-id={id} />
  ),
}));

const profile: IdentityProfile = {
  concurrencyStamp: 'revision',
  canManage: true,
  canAccessSignature: true,
  choices: { logo: { mode: 1 }, banner: { mode: 1 }, signature: { mode: 1 } },
  effective: Object.fromEntries(
    ['logo', 'banner', 'signature'].map((kind) => [
      kind,
      {
        source: 'School default',
        selection: {
          mode: 1,
          ...(kind === 'signature'
            ? { principalName: 'Test principal', designation: 'Principal' }
            : {}),
        },
        asset: {
          id: kind,
          kind: 0,
          fileName: `${kind}.png`,
          contentType: 'image/png',
          size: 100,
          width: 1200,
          height: 300,
        },
      },
    ])
  ),
};

afterEach(cleanup);
const theme = createTheme(defaultSettings);
const renderLayout = (value: IdentityProfile) =>
  render(
    <ThemeProvider theme={theme}>
      <IdentityDocumentLayout profile={value} context={{}} />
    </ThemeProvider>
  );

describe('school identity document layout', () => {
  it('uses the effective assets and clearly distinguishes the layout from the PDF', () => {
    renderLayout(profile);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('Test principal')).toBeVisible();
    expect(screen.getByText('Sample layout only')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Document Layout Preview information' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview document' })).toBeVisible();
  });

  it('does not mount suppressed assets or reveal suppressed principal details', () => {
    const hidden = structuredClone(profile);
    hidden.effective.banner!.selection.mode = 2;
    hidden.effective.signature!.selection.mode = 2;
    renderLayout(hidden);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByText('Test principal')).not.toBeInTheDocument();
    expect(screen.queryByText('Signature placeholder')).not.toBeInTheDocument();
    expect(screen.queryByText('Letterhead placeholder')).not.toBeInTheDocument();
  });

  it('never mounts the signature image or principal details when access is restricted', () => {
    renderLayout({ ...profile, canAccessSignature: false });
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByText('Test principal')).not.toBeInTheDocument();
    expect(screen.getByText('Signature hidden')).toBeVisible();
  });

  it('shows honest placeholders for missing assets', () => {
    renderLayout({ ...profile, effective: {} });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    ['Logo', 'Letterhead', 'Signature'].forEach((kind) => {
      expect(screen.getByText(`${kind} placeholder`)).toBeVisible();
    });
  });
});
