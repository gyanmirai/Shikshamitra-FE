//

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import React, { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { navData } from 'src/layouts/config-nav-dashboard';
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

const AssignModule = ({ allPermissions, setAllPermissions }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const data = navData(user?.profile?.email === 'ddvs@gmail.com').flatMap((item) => item.items);

  const stackRef = useRef<any>(null);
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
                  ? varAlpha(theme.vars.palette.primary.mainChannel, 0.1)
                  : 'background.paper',
              color: (theme) =>
                selectSubModule?._action === item._action ? 'primary.main' : 'text.primary',
              transition: 'all 0.3s ease',
              '&:hover': { scale: 1.05 },
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
          <Grid size={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 2 }}>
              <Tree
                data={selectSubModule?.submodule || []}
                allPermissions={allPermissions}
                setAllPermissions={setAllPermissions}
              />
            </Box>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default AssignModule;

const Tree = ({ data, depth = 0, allPermissions, setAllPermissions }: any) =>
  data?.map((item: any) => (
    <TreeSubList
      item={item}
      depth={depth}
      allPermissions={allPermissions}
      setAllPermissions={setAllPermissions}
    />
  ));

const TreeSubList = ({ item, depth, allPermissions, setAllPermissions }: any) => {
  const open = useBoolean();
  return (
    <Stack key={item.id} spacing={1} pl={depth * 4} height="100%" maxWidth="350px" width="100%">
      <Paper elevation={4} sx={{ p: 1 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {item.title}
          </Typography>

          <IconButton
            onClick={open.onToggle}
            sx={{ visibility: item?.children?.length ? 'visible' : 'hidden' }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>
        </Box>
        <Stack direction="row" spacing={0.2}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={
                  allPermissions?.find((p: any) => p.name === item.permissionName)?.isGranted
                }
              />
            }
            label="View"
            onChange={(e: any) => {
              if (e.target?.checked) {
                setAllPermissions((pre: any) => {
                  const isExists = pre.findIndex((p: any) => p.name === item.permissionName);
                  if (isExists === -1) {
                    return [...pre, { name: item.permissionName, isGranted: e.target.checked }];
                  }
                  pre[isExists].isGranted = e.target.checked;
                  pre[isExists].name = item.permissionName;
                  return pre;
                });
              } else {
                setAllPermissions((prev: any) =>
                  prev.filter((p: any) => p.name !== item.permissionName)
                );
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={
                  allPermissions?.find((p: any) => `${p.name}` === `${item.permissionName}.Create`)
                    ?.isGranted
                }
              />
            }
            label="Add"
            onChange={(e: any) => {
              if (e.target?.checked) {
                setAllPermissions((pre: any) => {
                  const isExists = pre.findIndex(
                    (p: any) => `${p.name}` === `${item.permissionName}.Create`
                  );
                  if (isExists === -1) {
                    return [
                      ...pre,
                      { name: `${item.permissionName}.Create`, isGranted: e.target.checked },
                    ];
                  }
                  pre[isExists].isGranted = e.target.checked;
                  pre[isExists].name = `${item.permissionName}.Create`;
                  return pre;
                });
              } else {
                setAllPermissions((prev: any) =>
                  prev.filter((p: any) => `${p.name}` !== `${item.permissionName}.Create`)
                );
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={
                  allPermissions?.find((p: any) => `${p.name}` === `${item.permissionName}.Edit`)
                    ?.isGranted
                }
              />
            }
            label="Edit"
            onChange={(e: any) => {
              if (e.target?.checked) {
                setAllPermissions((pre: any) => {
                  const isExists = pre.findIndex(
                    (p: any) => `${p.name}` === `${item.permissionName}.Edit`
                  );
                  if (isExists === -1) {
                    return [
                      ...pre,
                      { name: `${item.permissionName}.Edit`, isGranted: e.target.checked },
                    ];
                  }
                  pre[isExists].isGranted = e.target.checked;
                  pre[isExists].name = `${item.permissionName}.Edit`;
                  return pre;
                });
              } else {
                setAllPermissions((prev: any) =>
                  prev.filter((p: any) => `${p.name}` !== `${item.permissionName}.Edit`)
                );
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={
                  allPermissions?.find((p: any) => `${p.name}` === `${item.permissionName}.Delete`)
                    ?.isGranted
                }
              />
            }
            label="Delete"
            onChange={(e: any) => {
              if (e.target?.checked) {
                setAllPermissions((pre: any) => {
                  const isExists = pre.findIndex(
                    (p: any) => `${p.name}` === `${item.permissionName}.Delete`
                  );
                  if (isExists === -1) {
                    return [
                      ...pre,
                      { name: `${item.permissionName}.Delete`, isGranted: e.target.checked },
                    ];
                  }
                  pre[isExists].isGranted = e.target.checked;
                  pre[isExists].name = `${item.permissionName}.Delete`;
                  return pre;
                });
              } else {
                setAllPermissions((prev: any) =>
                  prev.filter((p: any) => `${p.name}` !== `${item.permissionName}.Delete`)
                );
              }
            }}
          />
        </Stack>
      </Paper>
      {open.value && item?.children?.length && (
        <Scrollbar
          sx={{ height: '500px', pr: 1, bgcolor: 'background.neutral', py: 1, borderRadius: 1 }}
        >
          <Fade timeout={700} in={open.value} easing={{ exit: '500' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexDirection: 'column' }}>
              <Tree
                data={item.children}
                depth={depth + 1}
                allPermissions={allPermissions}
                setAllPermissions={setAllPermissions}
              />
            </Box>
          </Fade>
        </Scrollbar>
      )}
    </Stack>
  );
};
