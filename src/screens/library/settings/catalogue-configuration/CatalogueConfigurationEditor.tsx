import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { libraryPaths } from 'src/constants/library-menus';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { CatalogueChoicesSection } from './CatalogueChoicesSection';
import { RequiredCatalogueFields } from './RequiredCatalogueFields';
import { useCatalogueConfigurationDraft } from './useCatalogueConfigurationDraft';

export function CatalogueConfigurationEditor({
  data,
  canManage,
  reload,
  onBusyChange,
  initialData,
}: {
  data: CatalogueConfiguration;
  canManage: boolean;
  reload: () => Promise<CatalogueConfiguration>;
  onBusyChange: (busy: boolean) => void;
  initialData: CatalogueConfiguration;
}) {
  const state = useCatalogueConfigurationDraft(initialData);
  const [reloading, setReloading] = useState(false);
  const router = useRouter();
  const { formik, baseline } = state;
  const busy = state.busy || reloading;
  const disabled = busy || !canManage;
  const guard = useUnsavedNavigation(formik.dirty, { push: router.push, blockNavigation: busy });
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const load = async () => {
    if (busy) return;
    setReloading(true);
    try {
      state.reset(await reload());
    } catch {
      state.setError('Could not reload configuration. Your changes are retained.');
    } finally {
      setReloading(false);
    }
  };
  return (
    <>
      <form
        onSubmit={(event) => {
          if (!canManage) event.preventDefault();
          else formik.handleSubmit(event);
        }}
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {baseline.source === 'Defaults'
              ? 'Using existing catalogue defaults.'
              : 'Using this school’s saved catalogue configuration.'}
          </Typography>
          {state.error && <Alert severity="error">{state.error}</Alert>}
          {!canManage && (
            <Alert severity="info">
              You can view this school&apos;s catalogue configuration. Updating it requires the
              dedicated permission and school-wide scope.
            </Alert>
          )}
          {data.revision !== baseline.revision && (
            <Alert severity="info">
              Loaded settings and this draft have different revisions. Reload to review; your
              entered values are retained.
            </Alert>
          )}
          <FormBusyRegion busy={busy} label="Saving catalogue configuration">
            <Stack spacing={2}>
              <RequiredCatalogueFields formik={formik} disabled={disabled} />
              <CatalogueChoicesSection
                formik={formik}
                previous={baseline}
                field="languages"
                disabled={disabled}
              />
              <CatalogueChoicesSection
                formik={formik}
                previous={baseline}
                field="materials"
                disabled={disabled}
              />
            </Stack>
          </FormBusyRegion>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
              onClick={() =>
                guard.requestNavigation(() => {
                  load();
                })
              }
            >
              Reload configuration
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => guard.requestNavigation(() => router.push(libraryPaths.allBooks))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              disabled={disabled || !formik.dirty}
              loading={state.busy}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </form>
      {guard.confirmation}
    </>
  );
}
