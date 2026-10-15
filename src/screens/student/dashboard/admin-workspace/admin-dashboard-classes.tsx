import type { StudentDashboardFilterOptions } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Stack, Typography, IconButton, Link as MuiLink } from '@mui/material';

import { AdminDashboardPanel, DashboardWorkspaceLink } from './admin-dashboard-panel';

import type { StudentSectionQuery } from '../hooks/use-student-dashboard-sections';

export function AdminDashboardClasses({
  query,
  directoryHref,
  options,
}: {
  query: StudentSectionQuery;
  directoryHref?: string;
  options?: StudentDashboardFilterOptions;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const data = !query.isError ? query.currentData : undefined;
  const availableClasses = data?.classStrength ?? [];
  const classes = availableClasses.slice(0, 6);
  const total = data?.classStrengthTotalCount ?? availableClasses.length;
  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <AdminDashboardPanel
      title="Class & division overview"
      description="Active permanent records by class and division. Expand a class to see its divisions. Classes without division breakdowns show one total."
      query={query}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Class / Division
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Students
          </Typography>
        </Stack>
        <Box>
          {classes.map((row, index) => {
            const id = row.standardId ?? 'unassigned';
            const divisions = row.divisions ?? [];
            const open = expanded.has(id);
            const region = `dashboard-class-divisions-${index}`;
            const standard = options?.standards.find((item) => item.id === row.standardId);
            const medium = options?.mediums.find((item) => item.id === standard?.parentId);
            const board = options?.boards.find((item) => item.id === medium?.parentId);
            const scopeLabel = [board?.name, medium?.name].filter(Boolean).join(' · ');
            return (
              <Box key={id} sx={{ borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minHeight: 44 }}>
                  {divisions.length ? (
                    <IconButton
                      aria-label={`${open ? 'Collapse' : 'Expand'} ${row.label}`}
                      aria-expanded={open}
                      aria-controls={region}
                      onClick={() => toggle(id)}
                    >
                      <Iconify icon={open ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={18} />
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 40, flexShrink: 0 }} />
                  )}
                  <Stack sx={{ flex: 1, minWidth: 0 }}>
                    {row.href ? (
                      <MuiLink
                        component={Link}
                        href={row.href}
                        prefetch={false}
                        color="text.primary"
                        variant="body2"
                        fontWeight={600}
                        sx={{ flex: 1 }}
                      >
                        {row.label}
                      </MuiLink>
                    ) : (
                      <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                        {row.label}
                      </Typography>
                    )}
                    {scopeLabel && (
                      <Typography variant="caption" color="text.secondary">
                        {scopeLabel}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="subtitle2">{fNumber(row.students)}</Typography>
                </Stack>
                {open && (
                  <Stack
                    id={region}
                    spacing={1}
                    sx={{ ml: 5, pl: 1.5, borderLeft: 1, borderColor: 'divider', pb: 1 }}
                  >
                    {divisions.map((division) => (
                      <Stack
                        key={division.divisionId ?? 'unassigned'}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        sx={{ minHeight: 36 }}
                      >
                        {division.href ? (
                          <MuiLink
                            component={Link}
                            href={division.href}
                            prefetch={false}
                            variant="body2"
                            color="text.secondary"
                          >
                            {division.label}
                          </MuiLink>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {division.label}
                          </Typography>
                        )}
                        <Typography variant="body2">{fNumber(division.students)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Box>
        {!classes.length && (
          <Typography variant="body2" color="text.secondary">
            No active class placements match this scope.
          </Typography>
        )}
        {total > classes.length && (
          <Typography variant="caption" color="text.secondary">
            Showing {fNumber(classes.length)} of {fNumber(total)} classes. Open the directory for
            the full list.
          </Typography>
        )}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
          <DashboardWorkspaceLink href={directoryHref}>View students</DashboardWorkspaceLink>
        </Stack>
      </Stack>
    </AdminDashboardPanel>
  );
}
