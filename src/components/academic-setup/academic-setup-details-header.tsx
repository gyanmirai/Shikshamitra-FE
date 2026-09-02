import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Link, Chip, Stack, Breadcrumbs, Typography } from '@mui/material';

import type {
  AcademicYearRecord,
  AcademicSetupNode,
  AcademicSetupNodeType,
} from './academic-setup-model';

import { AcademicNodeActions } from './node-actions';
import { getAcademicSetupBreadcrumbs } from './academic-setup-breadcrumbs';
import { NODE_TYPE_META } from './academic-setup-model';

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
  const crumbs = getAcademicSetupBreadcrumbs(node, currentYear);
  const childCount = node.children?.length ?? 0;
  const childLabel = meta.childLabel.toLowerCase();
  const isDivision = node.type === 'Division';
  const capacity = isDivision && 'strength' in node.data ? node.data.strength : null;
  const rangeStart = node.type === 'Academic Year' ? currentYear.startDate : undefined;
  const rangeEnd = node.type === 'Academic Year' ? currentYear.endDate : undefined;

  return (
    <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Breadcrumbs
        separator={<Iconify icon="eva:arrow-ios-forward-fill" width={14} aria-hidden />}
        sx={{ mb: 1.5 }}
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const crumbLabel = NODE_TYPE_META[crumb.type].label;

          return isLast ? (
            <Typography
              key={`${crumb.type}-${crumb.id}`}
              variant="caption"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {crumb.name}
            </Typography>
          ) : (
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

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Iconify icon={meta.icon} width={26} aria-hidden />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Chip label={meta.label} size="small" variant="outlined" sx={{ mb: 0.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {node.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isDivision
                ? `${capacity ?? '—'} student capacity`
                : `${childCount} ${childCount === 1 ? childLabel.replace(/s$/, '') : childLabel}`}
              {rangeStart && rangeEnd
                ? ` · ${dayjs(rangeStart).format('DD MMM YYYY')} – ${dayjs(rangeEnd).format('DD MMM YYYY')}`
                : ''}
            </Typography>
          </Box>
        </Stack>

        <AcademicNodeActions node={node} />
      </Box>
    </Box>
  );
};
