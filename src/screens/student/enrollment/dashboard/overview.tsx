import type { JSX } from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Card, Typography } from '@mui/material';
import CustomizableView from 'src/components/customizable-view';

import type { ICardItem, IStudentEnrollmentCardProps } from '../entrollment-interface';
// Assuming this is the correct path

export const StudentEnrollmentCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  index,
}: IStudentEnrollmentCardProps) => (
  <Box
    component={Link}
    href={href}
    sx={{ textDecoration: 'none', height: '100%', display: 'block' }}
  >
    <Card
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z1 || 1, // Fallback
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: (theme) =>
          theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z8 || 4,
          borderColor: 'transparent',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600, // Kept semi-bold for readability but smaller relative scope
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.75rem',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          {/* Count */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {count}
          </Typography>

          {/* Footer Labels - Dashed Border */}
          {labels.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                pt: 1.5,
                borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                mt: 'auto',
              }}
            >
              {labels.map((label, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 16,
                      bgcolor: (theme) => {
                        const colorKey = label.color === 'default' ? 'primary' : label.color;
                        return (
                          theme.palette[
                            colorKey as
                              | 'primary'
                              | 'secondary'
                              | 'info'
                              | 'success'
                              | 'warning'
                              | 'error'
                          ]?.main || label.color
                        );
                      },
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {label.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1.5,
            color: (theme) =>
              color
                ? theme.palette[color.split('.')[0] as 'primary']?.main || color
                : 'text.primary',
            bgcolor: (theme) =>
              alpha(
                theme.palette[color.split('.')[0] as 'primary']?.main ||
                  theme.palette.background.paper,
                0.08
              ),
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={32} />
        </Box>
      </Box>
    </Card>
  </Box>
);

const Overview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'wpf:inspection',
      title: 'Total Inquiries',
      count: fNumber(1120),
      color: 'primary.main',
      bgColor: 'primary',
      href: '/student/enrollment/pipeline',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '1',
      icon: 'medical-icon:i-registration',
      title: 'Total Registration',
      count: fNumber(78),
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/registrations',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '2',
      icon: 'fluent-mdl2:open-enrollment',
      title: 'Total Admission',
      count: fNumber(45),
      color: 'secondary.main',
      bgColor: 'secondary',
      href: '/student/enrollment/offers-seats',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    // {
    //   id: '3',
    //   icon: 'healthicons:i-exam-multiple-choice',
    //   title: 'Entrance Exam Status',
    //   count: fNumber(10),
    //   color: 'info.main',
    //   bgColor: 'info',
    //   href: '/student/enrollment/entrance-exam',
    //   labels: [
    //     { name: `Ongoing ${fNumber(2)}`, color: 'success' },
    //     { name: `Upcoming ${fNumber(5)}`, color: 'info' },
    //   ],
    //   width: 4,
    // },
    // {
  ]);
  const dashBoardSections = cards.reduce((acc: { [key: string]: JSX.Element }, card, index) => {
    acc[card.id] = (
      <StudentEnrollmentCard
        icon={card.icon}
        title={card.title}
        count={card.count}
        color={card.color}
        bgColor={card.bgColor}
        href={card.href}
        labels={card.labels}
      />
    );
    return acc;
  }, {});

  return (
    <CustomizableView
      sections={cards}
      setSections={setCards}
      dashBoardSections={dashBoardSections}
    />
  );
};

export default Overview;
