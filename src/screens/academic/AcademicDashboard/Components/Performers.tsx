import type { RootState } from 'src/redux/store';
import type { BoxProps, CardProps } from '@mui/material';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { orderBy } from 'src/utils/helper';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Avatar, CardHeader } from '@mui/material';

type PerformerItem = {
  id: string;
  name: string;
  avatarUrl: string;
  totalMarks: number;
  className?: string;
  divisionName?: string;
  dueDate?: string;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: PerformerItem[];
  type: 'top' | 'bottom';
};

export const PerformersList = ({ title, subheader, list, type, ...other }: Props) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const selectedClass = allClass.find((org: Standards) => org?.id === classes);

    setAllDivision(selectedClass?.divisions || []);
    setDivision(selectedClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const selectedClassName = allClass.find((org: Standards) => org?.id === classes)?.name || '';
  const selectedDivisionName =
    allDivision.find((org: Division) => org?.id === division)?.name || '';

  return (
    <Card {...other} sx={{}}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ p: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
            />

            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '150px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
        }
      />

      <Box
        sx={{
          px: 2,
          pb: 2,
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {list.length === 0 ? (
          <EmptyContent
            filled
            title="No performance records yet"
            description="Published result data will appear here."
            sx={{ minHeight: 220 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        ) : null}
        {orderBy(list, ['totalMarks'], [type === 'top' ? 'desc' : 'asc']).map((item, index) => (
          <Item
            key={item.id}
            item={item}
            index={index}
            type={type}
            selectedClassName={selectedClassName}
            selectedDivisionName={selectedDivisionName}
          />
        ))}
      </Box>
    </Card>
  );
};

type ItemProps = BoxProps & {
  index: number;
  item: PerformerItem;
  type: 'top' | 'bottom';
  selectedClassName: string;
  selectedDivisionName: string;
};

function Item({
  item,
  index,
  type,
  sx,
  selectedClassName,
  selectedDivisionName,
  ...other
}: ItemProps) {
  const fallbackLabel = [selectedClassName, selectedDivisionName].filter(Boolean).join(' ');
  const classLabel = [item.className || fallbackLabel, item.divisionName].filter(Boolean).join(' ');
  const dueDateLabel = item.dueDate || (type === 'top' ? 'Tomorrow' : `Rank ${index + 1}`);

  return (
    <Box
      sx={{
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        px: 1.75,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        bgcolor: 'background.neutral',
        ...sx,
      }}
      {...other}
    >
      <Avatar alt={item.name} src={item.avatarUrl} sx={{ width: 42, height: 42 }}>
        {item.name.charAt(0).toUpperCase()}
      </Avatar>

      <Box flexGrow={1}>
        <Box sx={{ typography: 'subtitle2', lineHeight: 1.25 }}>{item.name}</Box>
      </Box>
    </Box>
  );
}
