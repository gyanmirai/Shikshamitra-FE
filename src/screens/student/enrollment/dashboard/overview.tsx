import type { DropResult } from 'react-beautiful-dnd';
import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, useTheme, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableView from 'src/components/customizable-view';
// Assuming this is the correct path

interface ILabel {
  name: string;
  color: LabelColor;
}

interface IStudentEnrollmentCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: ILabel[];
  index: number;
}

interface CardItem {
  id: number;
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href: string;
  labels: ILabel[];
}

export const StudentEnrollmentCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  index,
}: IStudentEnrollmentCardProps) => {
  const theme = useTheme();

  return (
    <Draggable draggableId={`card-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.6 : 1,
          }}
        >
          <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
            <Card
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexGrow: 1,
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                ...(!snapshot.isDragging && {
                  '&:hover': {
                    boxShadow: 'var(--shadows-8)',
                    scale: 1.03,
                  },
                }),
                ...(snapshot.isDragging && {
                  boxShadow: 'var(--shadows-16)',
                }),
              }}
            >
              <Iconify
                icon={icon}
                sx={{
                  height: '32px',
                  width: '32px',
                  color,
                }}
              />

              <Box>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="h3" color={color}>
                  {count}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {labels.map((label, idx) => (
                    <Label key={idx} color={label.color}>
                      {label.name}
                    </Label>
                  ))}
                </Box>
              </Box>
            </Card>
          </Box>
        </div>
      )}
    </Draggable>
  );
};

const Overview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<CardItem[]>([
    {
      id: 0,
      icon: 'wpf:inspection',
      title: 'Enrollment',
      count: 700,
      color: 'success.main',
      bgColor: 'success',
      href: '/student/enrollment/inquiry',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
    },
    {
      id: 1,
      icon: 'medical-icon:i-registration',
      title: 'Registration',
      count: 700,
      color: 'secondary.main',
      bgColor: 'secondary',
      href: '/student/enrollment/registration',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
    },
    {
      id: 2,
      icon: 'fluent-mdl2:open-enrollment',
      title: 'Admission',
      count: 700,
      color: 'warning.main',
      bgColor: 'warning',
      href: '/student/enrollment/admission',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
    },
    {
      id: 3,
      icon: 'healthicons:i-exam-multiple-choice',
      title: 'Entrance Exam Status',
      count: 10,
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/entrance-exam',
      labels: [
        { name: 'Ongoing 2', color: 'success' },
        { name: 'Upcoming 5', color: 'info' },
      ],
    },
    {
      id: 4,
      icon: 'bi:pass-fill',
      title: 'Pass-Fail Ratio',
      count: 17,
      color: 'error.main',
      bgColor: 'error',
      href: '/student/enrollment/entrance-exam/?view=table',
      labels: [
        { name: 'Passed 15', color: 'success' },
        { name: 'Failed 2', color: 'error' },
      ],
    },
    {
      id: 5,
      icon: 'mingcute:performance-fill',
      title: 'Top 3 Performers',
      count: '89 %',
      color: 'success.main',
      bgColor: 'success',
      href: '/student/enrollment/entrance-exam',
      labels: [
        { name: 'Herbert Clark', color: 'success' },
        { name: 'John Doe', color: 'error' },
        { name: 'John Loe', color: 'warning' },
      ],
    },
  ]);

  // Function to handle when the drag ends
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If there's no destination or the item is dropped in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    // Reordering logic
    const newCards = Array.from(cards);
    const [removed] = newCards.splice(source.index, 1);
    newCards.splice(destination.index, 0, removed);

    setCards(newCards);
  };

  const dashBoardSections = cards.reduce((acc: { [key: number]: JSX.Element }, card, index) => {
    acc[card.id] = (
      <Grid2 key={index} xs={12} md={4}>
        <StudentEnrollmentCard
          icon={card.icon}
          title={card.title}
          count={card.count}
          color={card.color}
          bgColor={card.bgColor}
          href={card.href}
          labels={card.labels}
          index={card.id}
        />
      </Grid2>
    );
    return acc;
  }, {});

  return (
    <Box>
      <CustomizableView
        sections={cards}
        setSections={setCards}
        dashBoardSections={dashBoardSections}
      />
    </Box>
  );
};

export default Overview;
