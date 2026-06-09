'use client';

import type { Variants } from 'framer-motion';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Card, Grid, Avatar, Divider, Tooltip, Typography, IconButton } from '@mui/material';
import {
  toHrAuditLabel,
  formatHrAuditValue,
  formatHrAuditDateTime,
  formatHrAuditRelativeTime,
} from 'src/utils/hr-audit-format';

import type { FinanceAuditLog } from '../types/financeAudit.types';

interface AuditCardProps {
  log: FinanceAuditLog;
  index?: number;
  variant?: 'default' | 'compact';
  onFilterByStudent?: (studentId: string, label: string) => void;
}

const ACTION_ICON_MAP: Record<string, string> = {
  CREATE: 'mdi:plus-circle-outline',
  UPDATE: 'mdi:pencil-circle-outline',
  DELETE: 'mdi:delete-circle-outline',
  APPROVE: 'mdi:check-circle-outline',
  REJECT: 'mdi:close-circle-outline',
  REFUND: 'mdi:cash-refund',
  PAYMENT: 'mdi:cash-check',
  ADJUSTMENT: 'mdi:tune-variant',
  GENERATE_RECEIPT: 'mdi:receipt-text-check-outline',
  ADD_CHARGE: 'mdi:cash-plus',
  REMOVE_CHARGE: 'mdi:cash-remove',
};

const ACTION_COLOR_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
  APPROVE: 'success',
  REJECT: 'error',
  REFUND: 'info',
  PAYMENT: 'success',
  ADJUSTMENT: 'warning',
  GENERATE_RECEIPT: 'info',
  ADD_CHARGE: 'warning',
  REMOVE_CHARGE: 'error',
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
};

const expandVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 16 },
};

interface MetaItemProps {
  icon: string;
  text: string;
  muted?: boolean;
}

const MetaItem = ({ icon, text, muted }: MetaItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Iconify icon={icon} width={14} sx={{ color: muted ? 'text.disabled' : 'text.secondary' }} />
    <Typography
      variant="caption"
      sx={{ color: muted ? 'text.disabled' : 'text.secondary', fontSize: 12 }}
    >
      {text}
    </Typography>
  </Box>
);

const buildStudentFilterLabel = (log: FinanceAuditLog) => {
  const parts: string[] = [];
  if (log.studentName) parts.push(log.studentName);
  if (log.studentGrNo && log.studentGrNo !== '-') parts.push(`GR ${log.studentGrNo}`);
  if (log.studentRollNo && log.studentRollNo !== '-') parts.push(`Roll ${log.studentRollNo}`);
  return parts.join(' · ');
};

const AuditCard = ({ log, index = 0, variant = 'default', onFilterByStudent }: AuditCardProps) => {
  const isCompact = variant === 'compact';
  const [expanded, setExpanded] = useState(false);

  const actionIcon = ACTION_ICON_MAP[log.action] ?? 'mdi:information-outline';
  const actionColor = ACTION_COLOR_MAP[log.action] ?? 'default';

  const beforeData = log.beforeData ?? {};
  const afterData = log.afterData ?? {};

  const changeEntries = Object.keys({ ...beforeData, ...afterData })
    .filter((key) => beforeData[key] !== afterData[key])
    .slice(0, 4)
    .map((key) => ({
      key,
      label: toHrAuditLabel(key),
      before: formatHrAuditValue(beforeData[key]),
      after: formatHrAuditValue(afterData[key]),
    }));

  const deviceInfo = formatHrAuditValue(
    log.device || log.afterData?.device || log.beforeData?.device
  );

  const studentGrNo =
    log.studentGrNo ||
    log.afterData?.grNo ||
    log.afterData?.studentGrNo ||
    log.beforeData?.grNo ||
    '-';

  const studentRollNo =
    log.studentRollNo ||
    log.afterData?.rollNo ||
    log.afterData?.studentRollNo ||
    log.beforeData?.rollNo ||
    '-';

  const studentFilterLabel = buildStudentFilterLabel(log);

  const handleStudentClick = () => {
    if (!log.studentId || !onFilterByStudent) return;
    onFilterByStudent(log.studentId, studentFilterLabel || log.studentName || 'Student');
  };

  const detailItems = [
    { label: 'IP Address', value: formatHrAuditValue(log.ipAddress) },
    { label: 'Device', value: deviceInfo },
    { label: 'GR No.', value: formatHrAuditValue(studentGrNo) },
    { label: 'Roll No.', value: formatHrAuditValue(studentRollNo) },
    {
      label: 'Paid At',
      value: formatHrAuditValue(log.createdAt),
    },
  ];

  return (
    <Box
      component={motion.div}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          transform: 'translateY(-1px)',
        },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          p: isCompact ? { xs: 1, sm: 1.25 } : { xs: 1.5, sm: 2 },
          pl: isCompact ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
        }}
      >
        {/* Top row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              height: 24,
              borderRadius: '6px',
              bgcolor: 'background.neutral',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Iconify icon="mdi:folder-outline" width={14} sx={{ color: 'text.secondary' }} />
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {log.subModule}
            </Typography>
          </Box>
          <Label
            color={actionColor}
            variant="soft"
            startIcon={<Iconify icon={actionIcon} width={13} />}
            sx={{ fontWeight: 700, fontSize: 11, height: 24 }}
          >
            {log.action.replace(/_/g, ' ')}
          </Label>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={formatHrAuditDateTime(log.createdAt)} arrow placement="top">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: 'background.neutral',
                px: 1,
                py: 0.4,
                borderRadius: 2,
                cursor: 'default',
              }}
            >
              <Iconify icon="mdi:clock-outline" width={13} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                {formatHrAuditRelativeTime(log.createdAt)}
              </Typography>
            </Box>
          </Tooltip>
          {!!changeEntries.length && (
            <Tooltip title={expanded ? 'Hide changes' : 'View changes'} arrow>
              <IconButton
                size="small"
                onClick={() => setExpanded((p) => !p)}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: expanded ? 'primary.lighter' : 'background.neutral',
                  color: expanded ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' },
                }}
              >
                <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.primary"
          sx={{ lineHeight: 1.6, mb: isCompact ? 1 : 1.5, fontSize: isCompact ? 12.5 : 13.5 }}
        >
          {log.description}
        </Typography>
        {log.remarks && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {log.remarks}
          </Typography>
        )}

        {/* Meta row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {log.studentName && (
            <Box
              component={log.studentId && onFilterByStudent ? 'button' : 'div'}
              type={log.studentId && onFilterByStudent ? 'button' : undefined}
              onClick={log.studentId && onFilterByStudent ? handleStudentClick : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                border: 'none',
                bgcolor: 'transparent',
                p: 0,
                cursor: log.studentId && onFilterByStudent ? 'pointer' : 'default',
                '&:hover':
                  log.studentId && onFilterByStudent
                    ? { '& .student-meta': { color: 'primary.main', textDecoration: 'underline' } }
                    : undefined,
              }}
            >
              <Iconify
                icon="mdi:account-school-outline"
                width={14}
                sx={{ color: 'text.secondary' }}
              />
              <Typography
                className="student-meta"
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: 12 }}
              >
                {log.studentName}
                {studentGrNo !== '-' && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                    {' '}
                    · GR {studentGrNo}
                  </Typography>
                )}
                {studentRollNo !== '-' && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>
                    {' '}
                    · Roll {studentRollNo}
                  </Typography>
                )}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Avatar
              sx={{ width: 20, height: 20, fontSize: 10, fontWeight: 700, bgcolor: 'primary.main' }}
              src={log.performedByAvatar}
            >
              {log.performedBy?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
              {log.performedBy}
              {log.performedByRole && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'text.disabled', fontSize: 11 }}
                >
                  {' '}
                  · {log.performedByRole}
                </Typography>
              )}
            </Typography>
          </Box>
          {log.ipAddress && <MetaItem icon="mdi:monitor-shimmer" text={log.ipAddress} muted />}
        </Box>

        {/* Change chips */}
        {!!changeEntries.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5 }}>
            {changeEntries.map((entry) => (
              <Box
                key={entry.key}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1,
                  py: 0.55,
                  maxWidth: '100%',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}
                >
                  {entry.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: 'error.main',
                    textDecoration: 'line-through',
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {entry.before}
                </Typography>
                <Iconify
                  icon="mdi:arrow-right-thin"
                  width={12}
                  sx={{ color: 'text.disabled', flexShrink: 0 }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: 'success.main',
                    fontWeight: 700,
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {entry.after}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Expandable details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <Box
              component={motion.div}
              key="expand"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={expandVariants}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <Divider sx={{ mb: 2 }} />

              <Card variant="outlined" sx={{ borderRadius: 1.5, bgcolor: 'background.default' }}>
                <Grid container spacing={0}>
                  {detailItems.map((item, i) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6, md: 2 }}>
                      <Box sx={{ px: 1.5, py: 1.2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 11,
                            color: 'text.disabled',
                            textTransform: 'uppercase',
                            letterSpacing: 0.7,
                            display: 'block',
                            mb: 0.25,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          {item.value}
                        </Typography>
                      </Box>
                      {i !== detailItems.length - 1 && <Divider />}
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AuditCard;
