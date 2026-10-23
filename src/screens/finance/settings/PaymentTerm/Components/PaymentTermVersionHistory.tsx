'use client';

import type { ReactNode } from 'react';
import type {
  PaymentTermVersionResponse,
  PaymentTermVersionHistoryItem,
} from 'src/redux/finance/paymentTerm';

import { useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Alert, Stack, Button } from '@mui/material';
import CustomAccordion from 'src/components/custom-accordian';
import VersionSidebar from 'src/screens/finance/policies/components/version/VersionSidebar';
import VersionDiffTable from 'src/screens/finance/policies/components/version/VersionDiffTable';

import { paymentTermVersionPresentation } from './paymentTermVersionPresentation';

interface Props {
  versions: PaymentTermVersionResponse[];
  audits?: PaymentTermVersionHistoryItem[];
  selectedVersionId: string;
  onSelect: (id: string) => void;
  auditError: boolean;
  onRetry: () => void;
  children: ReactNode;
}

export default function PaymentTermVersionHistory({
  versions,
  audits,
  selectedVersionId,
  onSelect,
  auditError,
  onRetry,
  children,
}: Props) {
  const [showSnapshot, setShowSnapshot] = useState(false);
  const items = useMemo(() => paymentTermVersionPresentation(versions, audits), [versions, audits]);
  const selected = items.find((item) => item.eventId === selectedVersionId);
  const previousMissing =
    selected &&
    selected.versionNumber > 1 &&
    !versions.some((item) => item.versionNumber === selected.versionNumber - 1);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        p: 2,
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 240 },
          height: { xs: 208, md: '100%' },
          flexShrink: 0,
          minHeight: 0,
        }}
      >
        <VersionSidebar
          versions={items}
          selectedVersionId={selectedVersionId}
          onSelectVersion={(id) => {
            setShowSnapshot(false);
            onSelect(id);
          }}
        />
      </Box>
      <Scrollbar sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <Stack spacing={2} sx={{ pr: { xs: 0.5, sm: 1 }, pb: 1, minWidth: 0 }}>
          {auditError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              Version snapshots are available, but creator and action details could not be loaded.
            </Alert>
          )}
          {previousMissing && (
            <Alert severity="info">
              The previous version is unavailable. Before values are unavailable; After shows the
              selected snapshot.
            </Alert>
          )}
          {selected && <VersionDiffTable selectedVersion={selected} />}
          <CustomAccordion
            title="Saved version details"
            expanded={showSnapshot}
            onChange={() => setShowSnapshot((value) => !value)}
            content={showSnapshot ? <Stack spacing={2}>{children}</Stack> : null}
          />
        </Stack>
      </Scrollbar>
    </Box>
  );
}
