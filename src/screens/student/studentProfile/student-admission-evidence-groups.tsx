import type { StudentAdmissionEvidence } from 'src/redux/student/admissions/student-admission-evidence-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';
import { DocumentStatusLabel } from 'src/screens/student/admissions/document-verification/document-status';
import { DocumentEvidenceHistory } from 'src/screens/student/admissions/document-verification/document-evidence-history';

export function StudentAdmissionEvidenceGroups({
  evidence,
  studentId,
  allowDownload,
}: {
  evidence: StudentAdmissionEvidence[];
  studentId: string;
  allowDownload: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const groups = new Map<string, StudentAdmissionEvidence[]>();
  evidence.forEach((item) => {
    const key = `${item.applicationId}:${item.stageInstanceId}:${item.requirementCode}`;
    const versions = groups.get(key) ?? [];
    versions.push(item);
    groups.set(key, versions);
  });
  return (
    <Stack spacing={1}>
      {[...groups.entries()].map(([key, items]) => {
        const versions = [...items].sort((left, right) => left.versionNumber - right.versionNumber);
        const latest = versions.at(-1);
        if (!latest) return null;
        return (
          <Accordion
            key={key}
            expanded={expanded === key}
            onChange={(_, open) => setExpanded(open ? key : null)}
          >
            <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
              <Stack spacing={0.5}>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle2">{latest.requirementLabel}</Typography>
                  <DocumentStatusLabel status={latest.status} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {versions.length} evidence {versions.length === 1 ? 'version' : 'versions'}
                  {latest.studentLinkedAt ? ` · Linked ${fDateTime(latest.studentLinkedAt)}` : ''}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {expanded === key && (
                <DocumentEvidenceHistory
                  evidence={versions}
                  allowDownload={allowDownload}
                  studentId={studentId}
                />
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
