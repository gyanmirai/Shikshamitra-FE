//

import React, { useRef, useState } from 'react';

import {
  Box,
  Grid,
  Fade,
  Paper,
  Stack,
  Checkbox,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { navData } from 'src/layouts/config-nav-dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const AssignModule = () => {
  const data = navData.flatMap((item) => item.items);
  const stackRef = useRef<any>();
  const [selectSubModule, setSelectSubModule] = useState<any>(null);

  return (
    <Box p={2} height="100%">
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        ref={stackRef}
        p={1}
      >
        {data.map((item) => (
          <Paper
            elevation={8}
            onClick={() => setSelectSubModule(item)}
            sx={{
              p: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              backgroundColor: (theme) =>
                selectSubModule?._action === item._action
                  ? varAlpha(theme.palette.primary.mainChannel, 0.1)
                  : 'background.paper',
              color: (theme) =>
                selectSubModule?._action === item._action ? 'primary.main' : 'text.primary',
              transition: 'all 0.3s ease',
              '&:hover': {
                scale: 1.05,
              },
            }}
          >
            {item.icon}
            <Typography variant="caption" fontWeight={600}>
              {item.title}
            </Typography>
          </Paper>
        ))}
      </Stack>
      <Scrollbar
        sx={{
          height: `calc(100% - ${stackRef?.current?.offsetHeight || 0}px - 60px)`,
          py: 2,
          mt: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
              <Tree data={selectSubModule?.submodule || []} />
            </Box>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default AssignModule;

const Tree = ({ data, depth = 0 }: any) =>
  data?.map((item: any) => <TreeSubList1 item={item} depth={depth} />);

const TreeSubList1 = ({ item, depth }: any) => {
  const open = useBoolean();
  return (
    <Stack key={item.id} spacing={1} pl={depth * 4} width="350px">
      <Paper
        elevation={4}
        sx={{
          p: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {item.title}
          </Typography>
          {item?.children?.length && (
            <IconButton onClick={open.onToggle}>
              <Iconify icon="eva:arrow-ios-downward-fill" />
            </IconButton>
          )}
        </Box>
        <Stack direction="row" spacing={0.2}>
          <FormControlLabel control={<Checkbox size="small" />} label="View" />
          <FormControlLabel control={<Checkbox size="small" />} label="Add" />
          <FormControlLabel control={<Checkbox size="small" />} label="Edit" />
          <FormControlLabel control={<Checkbox size="small" />} label="Delete" />
        </Stack>
      </Paper>
      {open.value && item?.children?.length && (
        <Fade timeout={700} in={open.value} easing={{ exit: '500' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexDirection: 'column' }}>
            <TreeSubList item={item} depth={depth} />
          </Box>
        </Fade>
      )}
    </Stack>
  );
};

const TreeSubList = ({ item, depth }: any) =>
  item?.children?.length > 0 ? <Tree data={item.children} depth={depth + 1} /> : null;
