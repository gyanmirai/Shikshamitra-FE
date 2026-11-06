import { Stack, Typography } from '@mui/material';
import { IdentityCardPreview } from 'src/components/identity-card-designer';

import { useEmployeeCardLogo } from '../hooks/use-employee-card-logo';
import { getEmployeeCardPhotoUrl, getEmployeeCardPreviewValues } from '../employee-card-values';

import type { BuilderState } from '../employee-builder-state';
import type { EmployeeICardRow } from '../i-card-staff-columns';

export function EmployeeCardPreview({
  state,
  employee,
  academicYearName,
}: {
  state: BuilderState;
  employee?: EmployeeICardRow;
  academicYearName?: string;
}) {
  const logo = useEmployeeCardLogo(state);
  const values = getEmployeeCardPreviewValues(state, employee, academicYearName);
  const layout =
    state.logoMode === 2
      ? {
          ...state.layout,
          front: { elements: state.layout.front.elements.filter((item) => item.type !== 'logo') },
          back: state.layout.back && {
            elements: state.layout.back.elements.filter((item) => item.type !== 'logo'),
          },
        }
      : state.layout;
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0, width: 1 }}>
      {!employee && (
        <Typography variant="caption" color="text.secondary">
          Sample layout. Select staff to review their card data.
        </Typography>
      )}
      {(['front', ...(state.backSideEnabled ? ['back'] : [])] as Array<'front' | 'back'>).map(
        (side) => (
          <Stack key={side} spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {side === 'front' ? 'Front' : 'Back'}
            </Typography>
            <IdentityCardPreview
              layout={layout}
              side={side}
              values={values}
              logoUrl={logo.url}
              photoUrl={getEmployeeCardPhotoUrl(employee)}
              logoHidden={state.logoMode === 2}
              qrCodeEnabled={state.qrCodeEnabled}
              barcodeEnabled={state.barcodeEnabled}
            />
          </Stack>
        )
      )}
    </Stack>
  );
}
