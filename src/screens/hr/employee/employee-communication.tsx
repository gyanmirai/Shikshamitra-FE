import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyContent } from 'src/components/empty-content';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';
import { Box, Card, Chip, Stack, Button, Avatar, Divider, Typography } from '@mui/material';

// ── Animation variants ──────────────────────
const enterCurve = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const slideUpItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: enterCurve } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: enterCurve } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FilterType = 'all' | 'announcements' | 'events' | 'notices' | 'urgent' | 'unread';

interface Attachment {
  type: 'PDF' | 'DOC' | 'IMG';
  name: string;
}

interface CommunicationItem {
  id: string;
  title: string;
  category: string;
  priority: 'URGENT' | 'NORMAL' | 'LOW';
  type: 'GENERAL' | 'EVENT' | 'NOTICE';
  by: string;
  forGroup: string;
  time: string;
  preview: string;
  attachments?: Attachment[];
  isRead: boolean;
  requiresAck?: boolean;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
}

// ─────────────────────────────────────────────
// Communication Card (matches image design)
// ─────────────────────────────────────────────
const CommunicationCard = ({ item }: { item: CommunicationItem }) => {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = useMemo(() => {
    switch (item.type) {
      case 'EVENT':
        return {
          icon: 'solar:calendar-linear',
          color: 'warning.main',
          bgcolor: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.16),
          borderColor: '#f5a623',
        };
      case 'NOTICE':
        return {
          icon: 'solar:document-text-linear',
          color: 'info.main',
          bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.16),
          borderColor: '#2196f3',
        };
      default:
        return {
          icon: 'solar:user-speak-linear',
          color: 'primary.main',
          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.16),
          borderColor: '#7c4dff',
        };
    }
  }, [item.type]);

  const priorityConfig = useMemo(() => {
    if (item.priority === 'URGENT')
      return { color: 'error' as LabelColor, icon: 'solar:danger-bold' };
    if (item.priority === 'NORMAL') return { color: 'default' as LabelColor, icon: undefined };
    return { color: 'success' as LabelColor, icon: undefined };
  }, [item.priority]);

  const attachmentIconMap: Record<string, string> = {
    PDF: 'solar:file-text-bold',
    DOC: 'solar:file-text-bold',
    IMG: 'solar:gallery-bold',
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${typeConfig.borderColor}`,
        backgroundColor: 'background.paper',
        overflow: 'visible',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.customShadows.z12,
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Row 1: Icon + Category/Priority + Time */}
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: typeConfig.bgcolor,
              color: typeConfig.color,
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          >
            <Iconify icon={typeConfig.icon} width={22} />
          </Avatar>

          <Box flex={1}>
            {/* Badges + time row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                {!item.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                    }}
                  />
                )}
                <Label variant="soft" color="default" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  {item.type}
                </Label>
                {item.priority !== 'NORMAL' && (
                  <Label
                    variant="soft"
                    color={priorityConfig.color}
                    startIcon={
                      priorityConfig.icon ? (
                        <Iconify icon={priorityConfig.icon} width={12} />
                      ) : undefined
                    }
                    sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                  >
                    {item.priority}
                  </Label>
                )}
              </Stack>
              <Typography variant="caption" color="text.disabled">
                {item.time}
              </Typography>
            </Stack>

            {/* Title */}
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={0.5}>
              {item.title}
            </Typography>

            {/* Meta: By + For */}
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}
              >
                <Iconify icon="solar:user-bold" width={12} />
                By {item.by}
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}
              >
                <Iconify icon="solar:add-circle-bold" width={12} />
                For: {item.forGroup}
              </Typography>
            </Stack>

            {/* Preview text */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.65,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.preview}
            </Typography>

            {/* Event Details */}
            {item.type === 'EVENT' && item.eventDate && (
              <Stack direction="row" spacing={2} mt={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify
                    icon="solar:calendar-date-bold"
                    width={14}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="caption" fontWeight={600}>
                    {dayjs(item.eventDate).format('DD MMM YYYY')}
                  </Typography>
                </Stack>
                {item.eventTime && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify
                      icon="solar:clock-circle-bold"
                      width={14}
                      sx={{ color: 'warning.main' }}
                    />
                    <Typography variant="caption" fontWeight={600}>
                      {item.eventTime}
                    </Typography>
                  </Stack>
                )}
                {item.venue && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="solar:map-point-bold" width={14} sx={{ color: 'error.main' }} />
                    <Typography variant="caption" fontWeight={600}>
                      {item.venue}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}

            {/* Read more */}
            <Button
              size="small"
              sx={{ mt: 0.75, p: 0, minWidth: 0, fontWeight: 600, fontSize: '0.75rem' }}
              endIcon={
                <Iconify icon={expanded ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} width={14} />
              }
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Button>

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
                {item.attachments.map((att, idx) => (
                  <Chip
                    key={idx}
                    label={att.name}
                    size="small"
                    icon={
                      <Iconify icon={attachmentIconMap[att.type] || 'solar:file-bold'} width={14} />
                    }
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        {/* Actions */}
        {(item.requiresAck || true) && (
          <>
            <Divider sx={{ borderStyle: 'dashed', mt: 2, mb: 1.5 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:arrow-right-bold" width={14} />}
                sx={{ fontWeight: 600, borderRadius: 1, fontSize: '0.75rem' }}
              >
                Details
              </Button>
              {item.requiresAck && (
                <Button
                  size="small"
                  variant="soft"
                  color="error"
                  startIcon={<Iconify icon="solar:check-circle-bold" width={14} />}
                  sx={{ fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }}
                >
                  Acknowledge
                </Button>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Card>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const EmployeeCommunication = ({ employee }: any) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const communications: CommunicationItem[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Mandatory Staff Safety Drill — All Hands Required',
        category: 'General',
        priority: 'URGENT',
        type: 'GENERAL',
        by: 'Principal R. Mehta',
        forGroup: 'All Staff',
        time: 'Today, 9:15 AM',
        preview:
          'All staff members are required to be present on the ground floor by 11:00 AM today for a mandatory fire safety drill. Attendance will be recorded. Please ensure your classrooms are left unlocked and students are handed to the nearest available teacher.',
        attachments: [
          { type: 'PDF', name: 'Safety_Protocol_2024.pdf' },
          { type: 'DOC', name: 'Evacuation_Map.docx' },
        ],
        isRead: false,
        requiresAck: true,
      },
      {
        id: '2',
        title: 'Annual Science Exhibition — Volunteer Coordination',
        category: 'Event',
        priority: 'NORMAL',
        type: 'EVENT',
        by: 'Mrs. S. Parikh',
        forGroup: 'Science Dept.',
        time: 'Yesterday, 4:00 PM',
        preview:
          'The Annual Science Exhibition is scheduled for March 28th. All science faculty are requested to submit their student project lists and coordinate with the lab assistant for equipment setup.',
        isRead: false,
        requiresAck: false,
        eventDate: '2024-03-28',
        eventTime: '10:00 AM',
        venue: 'School Hall B',
      },
      {
        id: '3',
        title: 'Revised Holiday Notice — Holi Celebration Extended',
        category: 'Notice',
        priority: 'NORMAL',
        type: 'NOTICE',
        by: 'Admin Office',
        forGroup: 'All Staff',
        time: '2 days ago',
        preview:
          'The school administration has decided to extend the Holi holiday by one additional day. School will reopen on April 2nd. Please plan accordingly and inform parents.',
        isRead: true,
        requiresAck: false,
      },
    ],
    []
  );

  // Stats
  const unreadCount = communications.filter((c) => !c.isRead).length;
  const pendingAckCount = communications.filter((c) => c.requiresAck).length;
  const todayEventsCount = communications.filter(
    (c) => c.type === 'EVENT' && c.time.toLowerCase().startsWith('today')
  ).length;

  // Filter logic
  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'announcements':
        return communications.filter((c) => c.type === 'GENERAL');
      case 'events':
        return communications.filter((c) => c.type === 'EVENT');
      case 'notices':
        return communications.filter((c) => c.type === 'NOTICE');
      case 'urgent':
        return communications.filter((c) => c.priority === 'URGENT');
      case 'unread':
        return communications.filter((c) => !c.isRead);
      default:
        return communications;
    }
  }, [activeFilter, communications]);

  const FILTER_TABS: {
    value: FilterType;
    label: string;
    dotColor?: string;
  }[] = [
    { value: 'all', label: 'All', dotColor: 'primary.main' },
    { value: 'announcements', label: 'Announcements', dotColor: 'text.secondary' },
    { value: 'events', label: 'Events', dotColor: 'text.secondary' },
  ];

  // Action Required: unread items that need ack
  const actionRequired = filtered.filter((c) => c.requiresAck && !c.isRead);
  const rest = filtered.filter((c) => !actionRequired.find((a) => a.id === c.id));

  return (
    <Box sx={{ pb: 1 }}>
      {/* ── Top 3 Summary Cards ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1,
            mb: 1,
          }}
        >
          <motion.div variants={slideUpItem}>
            <DashboardCard
              title="Unread messages"
              value={unreadCount}
              icon="solar:letter-linear"
              color="primary.main"
              bgColor="primary.lighter"
            />
          </motion.div>
          <motion.div variants={slideUpItem}>
            <DashboardCard
              title="Pending acknowledgements"
              value={pendingAckCount}
              icon="solar:clock-circle-linear"
              color="warning.main"
              bgColor="warning.lighter"
            />
          </motion.div>
          <motion.div variants={slideUpItem}>
            <DashboardCard
              title="Today's events"
              value={todayEventsCount}
              icon="solar:calendar-linear"
              color="info.main"
              bgColor="info.lighter"
            />
          </motion.div>
        </Box>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1,
        }}
      >
        {FILTER_TABS.map((tab) => (
          <Chip
            key={tab.value}
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {tab.dotColor && (
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: tab.dotColor,
                    }}
                  />
                )}
                <span>{tab.label}</span>
              </Stack>
            }
            onClick={() => setActiveFilter(tab.value)}
            variant={activeFilter === tab.value ? 'filled' : 'outlined'}
            color={
              activeFilter === tab.value
                ? tab.value === 'urgent'
                  ? 'error'
                  : 'primary'
                : 'default'
            }
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          />
        ))}
      </Box>

      {/* ── Action Required Section ── */}
      {actionRequired.length > 0 && (
        <Box mb={1}>
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{
              textTransform: 'uppercase',
              color: 'text.secondary',
              display: 'block',
              mb: 1.5,
            }}
          >
            Action Required
          </Typography>
          <AnimatePresence mode="popLayout">
            {actionRequired.map((item, i) => (
              <motion.div
                key={item.id}
                variants={cardVariant}
                initial="hidden"
                animate="show"
                exit="exit"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <CommunicationCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* ── All Other Communications ── */}
      {rest.length > 0 && (
        <Box>
          {actionRequired.length > 0 && (
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{
                textTransform: 'uppercase',
                color: 'text.secondary',
                display: 'block',
                mb: 1.5,
              }}
            >
              All Communications
            </Typography>
          )}
          <AnimatePresence mode="popLayout">
            {rest.map((item, i) => (
              <motion.div
                key={item.id}
                variants={cardVariant}
                initial="hidden"
                animate="show"
                exit="exit"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <CommunicationCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: enterCurve }}
        >
          <Box sx={{ mt: 6 }}>
            <EmptyContent
              title="No communications found"
              imgUrl="/assets/icons/empty/ic_content.svg"
              description="Try a different filter or check back later."
            />
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default EmployeeCommunication;
