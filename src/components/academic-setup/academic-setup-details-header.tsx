import { Iconify } from 'src/components/iconify';
import { Box, Link, Breadcrumbs } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

import { AcademicNodeActions } from './node-actions';
import { NODE_TYPE_META } from './academic-setup-model';
import { ACADEMIC_LEVEL_HELP } from './academic-setup-guidance';
import { getAcademicSetupBreadcrumbs } from './academic-setup-breadcrumbs';

import type {
  AcademicSetupNode,
  AcademicYearRecord,
  AcademicSetupNodeType,
} from './academic-setup-model';

type AcademicSetupDetailsHeaderProps = {
  node: AcademicSetupNode;
  currentYear: AcademicYearRecord;
  onSelectCrumb: (id: string, type: AcademicSetupNodeType, name: string) => void;
};

export const AcademicSetupDetailsHeader = ({
  node,
  currentYear,
  onSelectCrumb,
}: AcademicSetupDetailsHeaderProps) => {
  const meta = NODE_TYPE_META[node.type];
  const crumbs = getAcademicSetupBreadcrumbs(node, currentYear).slice(0, -1);
  const isDivision = node.type === 'Division';
  const capacity = isDivision && 'strength' in node.data ? node.data.strength : null;

  return (
    <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
      {crumbs.length > 0 && (
        <Breadcrumbs
          aria-label="Selected hierarchy path"
          separator={<Iconify icon="eva:arrow-ios-forward-fill" width={16} aria-hidden />}
          sx={{ mb: 1 }}
        >
          {crumbs.map((crumb) => {
            const crumbLabel = NODE_TYPE_META[crumb.type].label;

            return (
              <Link
                key={`${crumb.type}-${crumb.id}`}
                component="button"
                type="button"
                variant="caption"
                aria-label={`Open ${crumbLabel} ${crumb.name}`}
                onClick={() => onSelectCrumb(crumb.id, crumb.type, crumb.name)}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {crumb.name}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <FormSectionHeader
        icon={node.type === 'Academic Year' ? NODE_TYPE_META['Education Board'].icon : meta.icon}
        iconSize={16}
        title={node.type === 'Academic Year' ? meta.childLabel : node.name}
        titleTypographyProps={{
          variant: 'subtitle1',
          fontWeight: 700,
          sx: { overflowWrap: 'anywhere' },
        }}
        description={isDivision ? `${capacity ?? '—'} student capacity` : undefined}
        descriptionTooltip={ACADEMIC_LEVEL_HELP[node.type]}
        action={<AcademicNodeActions node={node} />}
        actionFullWidthOnMobile={node.type !== 'Academic Year'}
      />
    </Box>
  );
};
