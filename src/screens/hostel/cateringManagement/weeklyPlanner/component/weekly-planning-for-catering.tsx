'use client';

import React, { useState } from 'react';

import { Box, Paper, TextField, Typography, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/hostel/cateringManagement/weekly-menu-data.json';

import CustomDialog from 'src/components/customDialog';

import AddWeeklyMenuDialog from './add-weekly-menu-dialog';

import type { IMealFormValues } from '../weekly-planner-interface';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['BreakFast', 'Lunch', 'Snacks', 'Dinner'] as const;
const CELL_WIDTH = '12.5%';
const CELL_HEIGHT = '220px';

const COLORS = {
  cell: {
    background: '#f9f9f9',
    border: '#ccc',
    hover: 'rgba(0, 0, 0, 0.04)',
  },
  menu: ['#FBE9E7', '#E3F2FD', '#E8F5E9', '#F3E5F5', '#FFF3E0', '#FCE4EC'],
};

const DAY_MAPPING: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const MEAL_TYPE_MAPPING: Record<string, string> = {
  breakfast: 'BreakFast',
  lunch: 'Lunch',
  snacks: 'Snacks',
  dinner: 'Dinner',
};

const getMenuColor = (meal: string, dayIndex: number): string => {
  const index = (meal.length + dayIndex) % COLORS.menu.length;
  return COLORS.menu[index];
};

const WeeklyPlanningForCatering = () => {
  const dialogToAddMenu = useBoolean();
  const [selectedMeal, setSelectedMeal] = useState<IMealFormValues | null>(null);
  const readOnlyDialog = useBoolean();
  const [readOnlyData, setReadOnlyData] = useState<IMealFormValues | null>(null);
  const [hostel, setHostel] = useState('');

  const openReadOnlyDialog = (mealData: IMealFormValues) => {
    setReadOnlyData(mealData);
    readOnlyDialog.onTrue();
  };

  const hasDayPassed = (day: string): boolean => {
    const todayIndex = new Date().getDay();
    const dayIndex = DAYS.indexOf(day);

    const adjustedTodayIndex = (todayIndex + 6) % 7;
    return dayIndex < adjustedTodayIndex;
  };

  const handleAddMenu = (day: string, dish: string, meal: string) => {
    setSelectedMeal({
      mealType: meal,
      mealDescription: dish,
      mealDay: day,
    });
    dialogToAddMenu.onTrue();
  };

  const buildMenuData = (menuItems: any) =>
    menuItems.reduce((acc: any, item: any) => {
      const day = DAY_MAPPING[item.mealDay.trim()];
      const meal = MEAL_TYPE_MAPPING[item.mealType.toLowerCase().trim()] || item.mealType;

      if (!acc[day]) acc[day] = {};
      acc[day][meal] = item.mealDescription;

      return acc;
    }, {});

  const menuData = buildMenuData(data);

  const renderHeaderCell = (day: string) => (
    <Box
      key={day}
      width={CELL_WIDTH}
      borderLeft={`1px solid ${COLORS.cell.border}`}
      p={1}
      textAlign="center"
      bgcolor={COLORS.cell.background}
    >
      <Typography variant="subtitle1">{day}</Typography>
    </Box>
  );

  const renderMealCell = (day: string, meal: string, colIdx: number) => {
    const dish = menuData[day]?.[meal];
    const bgColor = getMenuColor(meal, colIdx);
    const isPast = hasDayPassed(day);

    const handleClick = () => {
      if (isPast) {
        // Open read-only or alternate form
        openReadOnlyDialog({
          mealType: meal,
          mealDescription: dish,
          mealDay: day,
        });
      } else {
        handleAddMenu(day, dish, meal);
      }
    };

    return (
      <Box
        key={`${day}-${meal}`}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        borderRight={`1px solid ${COLORS.cell.border}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={1}
        onClick={() => handleClick()}
        sx={{
          cursor: 'pointer',
          '&:hover': { bgcolor: COLORS.cell.hover },
        }}
      >
        {dish ? (
          <Paper
            elevation={1}
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: bgColor,
              borderLeft: '4px solid #555',
              p: 1,
              overflow: 'auto',
              fontSize: '0.85rem',
              whiteSpace: 'pre-line',
            }}
          >
            {dish}
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            + Add Menu
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={1}>
        <Autocomplete
          options={[
            { id: 'H1', name: 'Hostel A' },
            { id: 'H2', name: 'Hostel B' },
            { id: 'H3', name: 'Hostel C' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setHostel(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel"
              name="hostel"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
      </Box>
      <Box pb={5}>
        <Box
          display="flex"
          flexDirection="column"
          border={`1px solid ${COLORS.cell.border}`}
          width="100%"
        >
          <Box display="flex">
            <Box width={CELL_WIDTH} bgcolor={COLORS.cell.background} />
            {DAYS.map(renderHeaderCell)}
          </Box>

          {MEAL_TYPES.map((meal) => (
            <Box key={meal} display="flex" borderTop={`1px solid ${COLORS.cell.border}`}>
              <Box
                width={CELL_WIDTH}
                borderRight={`1px solid ${COLORS.cell.border}`}
                p={1}
                bgcolor={COLORS.cell.background}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="subtitle2">{meal}</Typography>
              </Box>

              {DAYS.map((day, colIdx) => renderMealCell(day, meal, colIdx))}
            </Box>
          ))}
        </Box>

        {dialogToAddMenu.value && (
          <CustomDialog
            title={
              selectedMeal?.mealDescription
                ? `Edit Weekly Menu For ${selectedMeal.mealDay} ${selectedMeal.mealType}`
                : 'Add Weekly Menu'
            }
            maxWidth="md"
            open={dialogToAddMenu.value}
            handleClose={dialogToAddMenu.onFalse}
          >
            <AddWeeklyMenuDialog
              isEdit={Boolean(selectedMeal?.mealDescription)}
              data={selectedMeal}
              onClose={dialogToAddMenu.onFalse}
            />
          </CustomDialog>
        )}
      </Box>
    </Box>
  );
};

export default WeeklyPlanningForCatering;
