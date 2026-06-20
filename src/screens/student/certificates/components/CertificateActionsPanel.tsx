import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Tooltip, Typography, CardContent, CardActionArea } from '@mui/material';

import type { SelectedStudent } from './StudentSearchPanel';

export type CertType = 'bonafide' | 'character' | 'leaving' | 'firstTrial';

interface CertCardConfig {
  type: CertType;
  label: string;
  description: string;
  icon: string;
  numberPrefix: string;
}

const CERT_CARDS: CertCardConfig[] = [
  {
    type: 'bonafide',
    label: 'Bonafide',
    description: 'Verifies current enrollment & academic status',
    icon: 'tdesign:certificate',
    numberPrefix: 'BON',
  },
  {
    type: 'character',
    label: 'Character',
    description: 'Attests to conduct & behaviour at institution',
    icon: 'la:certificate',
    numberPrefix: 'CHA',
  },
  {
    type: 'leaving',
    label: 'Leaving',
    description: 'Issued on leaving institution with enrollment proof',
    icon: 'streamline-cyber:wedding-certificate',
    numberPrefix: 'LC',
  },
  {
    type: 'firstTrial',
    label: 'First Trial',
    description: 'Documents first-attempt examination eligibility',
    icon: 'ph:certificate-light',
    numberPrefix: 'FT',
  },
];

interface CertificateActionsPanelProps {
  selectedStudent: SelectedStudent | null;
  onGenerate: (certType: CertType) => void;
}

const CertificateActionsPanel: React.FC<CertificateActionsPanelProps> = ({
  selectedStudent,
  onGenerate,
}) => {
  const disabled = !selectedStudent;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          Generate New Certificate
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {disabled
            ? 'Select a student first to enable certificate generation'
            : `Generating for ${selectedStudent.name}`}
        </Typography>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {CERT_CARDS.map((cert) => (
            <Tooltip
              key={cert.type}
              title={disabled ? 'Select a student from the left panel first' : cert.description}
              placement="left"
              arrow
            >
              <Box>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    transition: 'all 0.2s ease',
                    opacity: disabled ? 0.5 : 1,
                    ...(disabled
                      ? {}
                      : {
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.12)}`,
                            transform: 'translateY(-1px)',
                          },
                        }),
                  }}
                >
                  <CardActionArea
                    disabled={disabled}
                    onClick={() => onGenerate(cert.type)}
                    sx={{ p: 0 }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
                          }}
                        >
                          <Iconify icon={cert.icon} width={22} sx={{ color: 'primary.main' }} />
                        </Box>

                        {/* Text */}
                        <Box flex={1} minWidth={0}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {cert.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {cert.description}
                          </Typography>
                        </Box>

                        {/* Arrow */}
                        {!disabled && (
                          <Iconify
                            icon="mdi:chevron-right"
                            width={18}
                            sx={{ color: 'text.disabled', flexShrink: 0 }}
                          />
                        )}
                      </Box>

                      {/* Auto number preview */}
                      {!disabled && (
                        <Box
                          sx={{
                            mt: 1,
                            px: 1,
                            py: 0.4,
                            borderRadius: 0.75,
                            bgcolor: 'background.neutral',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Iconify
                            icon="mdi:tag-outline"
                            width={11}
                            sx={{ color: 'text.secondary' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 10 }}
                          >
                            {cert.numberPrefix}-2026-
                            {String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {/* Quick tips */}
      {!disabled && (
        <Box
          sx={{
            p: 1.5,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => alpha(t.palette.info.main, 0.04),
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
          >
            <Iconify
              icon="mdi:lightbulb-outline"
              width={14}
              sx={{ color: 'info.main', mt: 0.1, flexShrink: 0 }}
            />
            All student details are pre-filled automatically. Only certificate-specific fields need
            to be entered.
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default CertificateActionsPanel;
