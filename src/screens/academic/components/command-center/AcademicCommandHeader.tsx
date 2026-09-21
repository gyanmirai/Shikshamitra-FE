'use client';

import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { AcademicCommandAction } from './types';

type AcademicCommandHeaderProps = {
  title: string;
  description: string;
  isBusy: boolean;
  actions: AcademicCommandAction[];
  onRefresh: () => void;
};

export function AcademicCommandHeader({
  title,
  description,
  isBusy,
  actions,
  onRefresh,
}: AcademicCommandHeaderProps) {
  return (
    <CustomBreadcrumbs
      heading={title}
      description={description}
      links={[{ name: 'Academics', href: '/academic/dashboard' }, { name: 'Dashboard' }]}
      action={
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={onRefresh}
            disabled={isBusy}
            startIcon={<Iconify icon="solar:refresh-linear" />}
            sx={{ minHeight: 40 }}
          >
            {isBusy ? 'Refreshing' : 'Refresh'}
          </Button>
          {actions.map((action) => (
            <Button
              key={action.label}
              component={action.href ? Link : 'button'}
              href={action.href}
              size="small"
              variant={action.variant || 'outlined'}
              startIcon={<Iconify icon={action.icon} />}
              sx={{ minHeight: 40 }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      }
    />
  );
}
