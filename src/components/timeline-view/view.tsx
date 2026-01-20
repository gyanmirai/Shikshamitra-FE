'use client';

import Paper from '@mui/material/Paper';
import Timeline from '@mui/lab/Timeline';
import { varAlpha } from 'src/theme/styles';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import { ComponentBlock } from '../component-block';
import { ScrollToViewTemplate } from '../component-template';

// ----------------------------------------------------------------------

export type TimelineType = {
  title?: string;
  key: number;
  des: string;
  time: string;
  progress?: number;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'error' | 'inherit' | 'grey' | 'secondary';
  icon?: React.ReactElement;
  variant?: '';
  teacher?: string;
};

const TIMELINES: TimelineType[] = [
  {
    key: 1,
    title: 'Default',
    des: 'Morbi mattis ullamcorper',
    time: '09:30 am',
    icon: <Iconify icon="eva:folder-add-fill" width={24} />,
  },
  {
    key: 2,
    title: 'Primary',
    des: 'Morbi mattis ullamcorper',
    time: '10:00 am',
    color: 'primary',
    icon: <Iconify icon="eva:image-2-fill" width={24} />,
  },
  {
    key: 3,
    title: 'Secondary',
    des: 'Morbi mattis ullamcorper',
    time: '10:00 am',
    color: 'secondary',
    icon: <Iconify icon="eva:pantone-fill" width={24} />,
  },
  {
    key: 4,
    title: 'Info',
    des: 'Morbi mattis ullamcorper',
    time: '10:30 am',
    color: 'info',
    icon: <Iconify icon="eva:tv-fill" width={24} />,
  },
  {
    key: 5,
    title: 'Success',
    des: 'Morbi mattis ullamcorper',
    time: '11:00 am',
    color: 'success',
    icon: <Iconify icon="eva:activity-fill" width={24} />,
  },
  {
    key: 6,
    title: 'Warning',
    des: 'Morbi mattis ullamcorper',
    time: '11:30 am',
    color: 'warning',
    icon: <Iconify icon="eva:cube-fill" width={24} />,
  },
  {
    key: 7,
    title: 'Error',
    des: 'Morbi mattis ullamcorper',
    time: '12:00 am',
    color: 'error',
    icon: <Iconify icon="eva:film-fill" width={24} />,
  },
];

// ----------------------------------------------------------------------

export function TimelineView({ data }: { data: TimelineType[] }) {
  const lastItem = data[data.length - 1].key;

  const reduceTimeLine = data.slice(data.length - 3);

  const DEMO = [
    {
      name: 'Left',
      component: (
        <ComponentBlock>
          <Timeline
            position="left"
            sx={{
              [`& .MuiTimelineItem-root`]: {
                '&:before': { display: 'none' },
              },
            }}
          >
            {reduceTimeLine.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineSeparator>
                  <TimelineDot />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{item.title}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Right',
      component: (
        <ComponentBlock>
          <Timeline
            position="right"
            sx={{
              [`& .MuiTimelineItem-root`]: {
                '&:before': { display: 'none' },
              },
            }}
          >
            {reduceTimeLine.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineSeparator>
                  <TimelineDot />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{item.title}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Alternating',
      component: (
        <ComponentBlock>
          <Timeline position="alternate">
            {reduceTimeLine.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineSeparator>
                  <TimelineDot />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{item.title}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Filled',
      component: (
        <ComponentBlock>
          <Timeline position="alternate">
            {TIMELINES.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineSeparator>
                  <TimelineDot color={item.color} />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{item.title}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Outlined',
      component: (
        <ComponentBlock>
          <Timeline position="alternate">
            {TIMELINES.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineSeparator>
                  <TimelineDot variant="outlined" color={item.color} />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{item.title}</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Opposite content',
      component: (
        <ComponentBlock>
          <Timeline position="alternate">
            {TIMELINES.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineOppositeContent>
                  <Typography sx={{ color: 'text.secondary' }}>{item.time}</Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={item.color} />
                  {lastItem === item.key ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography> {item.title}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
    {
      name: 'Customized',
      component: (
        <ComponentBlock>
          <Timeline position="alternate">
            {TIMELINES.map((item) => (
              <TimelineItem key={item.key}>
                <TimelineOppositeContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.time}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot
                    color={item.color}
                    sx={{
                      boxShadow: 'none',
                    }}
                  >
                    {item.icon}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>

                <TimelineContent>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                      border: (theme) =>
                        `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                      transition: (theme) =>
                        theme.transitions.create(['background-color'], {
                          duration: theme.transitions.duration.shorter,
                        }),
                      '&:hover': {
                        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.des}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ComponentBlock>
      ),
    },
  ];

  return <ScrollToViewTemplate data={DEMO} />;
}

export function CustomizedTimeline({ data }: { data: TimelineType[] | undefined }) {
  const lastItem = data && data.length > 0 ? data[data.length - 1].key : undefined;

  return (
    <Timeline
      position="right"
      sx={{
        px: 0,
        [`& .MuiTimelineItem-root`]: {
          '&:before': { display: 'none' }, // Remove default left padding/space for right position if needed
        },
      }}
    >
      {data?.map((item) => (
        <TimelineItem key={item.key}>
          <TimelineOppositeContent
            sx={{
              flex: 0,
              minWidth: 80,
              textAlign: 'left',
              px: 0,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
              {item.time}
            </Typography>
          </TimelineOppositeContent>

          <TimelineSeparator>
            <TimelineDot
              color={item.color}
              variant="filled"
              sx={{
                boxShadow: 'none',
                m: 1.5,
              }}
            />
            {lastItem === item.key ? null : (
              <TimelineConnector
                sx={{
                  bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                }}
              />
            )}
          </TimelineSeparator>

          <TimelineContent sx={{ pb: 3, px: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                display: { xs: 'block', sm: 'none' },
                mb: 0.5,
              }}
            >
              {item.time}
            </Typography>

            <Paper
              sx={{
                p: 2,
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                border: (theme) =>
                  `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'transform'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                '&:hover': {
                  bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {item.progress}% Completed
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {item.des}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:before': {
                    content: '""',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'text.disabled',
                  },
                }}
              >
                Teacher: {item.teacher}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
