'use client';

import Link from 'next/link';
import { Alert, Button } from '@mui/material';

import type { DefaultPolicySetupState } from '../hr-policy-workspace-utils';

export function PolicySetupAlert({
  state,
  policy,
  href,
  canOpen,
  onOpen,
}: {
  state?: DefaultPolicySetupState;
  policy: 'leave' | 'attendance' | 'payroll';
  href?: string;
  canOpen?: boolean;
  onOpen?: () => void;
}) {
  if (state !== 'missing' && state !== 'multiple') return null;
  const label = `${policy[0].toUpperCase()}${policy.slice(1)} Policies`;
  return (
    <Alert
      severity="warning"
      sx={{ mb: 1 }}
      action={
        canOpen && (href || onOpen) ? (
          onOpen ? (
            <Button color="inherit" size="small" onClick={onOpen}>
              Open {label}
            </Button>
          ) : (
            <Button component={Link} href={href!} color="inherit" size="small">
              Open {label}
            </Button>
          )
        ) : undefined
      }
    >
      {state === 'multiple'
        ? `Multiple default ${policy} policies`
        : `Default ${policy} policy missing`}
      <details>
        <summary>Details</summary>
        Exactly one active default {policy} policy is needed to resolve unassigned staff and prefill
        assignments.
      </details>
    </Alert>
  );
}
