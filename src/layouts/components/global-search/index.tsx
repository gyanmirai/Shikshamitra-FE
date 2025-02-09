import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

import { Search } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Button,
  SvgIcon,
  Popover,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { usePopover } from 'src/components/custom-popover';
import CustomizableTable from 'src/components/customizabaleTable';

const GlobalSearch = () => {
  const theme = useTheme();
  const popover = usePopover();
  const router = useRouter();
  const ref = useRef<any>();
  const isMac =
    typeof window !== 'undefined' &&
    /Macintosh|MacIntel|MacPPC|Mac68K/.test(window.navigator.userAgent);

  useHotkeys(isMac ? 'meta+k' : 'ctrl+k', (e) => {
    e.preventDefault();
    if (ref.current) {
      ref?.current?.click?.();
    }
  });
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        onClick={popover.onOpen}
        ref={ref}
        sx={{
          pr: { sm: 1 },
          borderRadius: { sm: 1.5 },
          cursor: { sm: 'pointer' },
          bgcolor: { sm: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
          maxWidth: { sm: 250 },
          width: { sm: '100%' },
          mr: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton disableRipple>
            {/* https://icon-sets.iconify.design/eva/search-fill/ */}
            <SvgIcon sx={{ width: 20, height: 20 }}>
              <path
                fill="currentColor"
                d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
              />
            </SvgIcon>
          </IconButton>
          <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 500 }}>
            Search Student
          </Typography>
        </Box>
        <Label
          sx={{
            fontSize: 12,
            color: 'grey.800',
            bgcolor: 'common.white',
            boxShadow: theme.customShadows.z1,
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        >
          {isMac ? '⌘K' : 'Ctrl+k'}
        </Label>
      </Box>
      <Popover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 6,
            sx: {
              p: 1.5,
              mt: 0.5,
              width: { xs: 1, sm: 450 },
              border: `1px solid ${theme.vars.palette.grey[300]}`,
            },
          },
        }}
      >
        <Grid container spacing={1}>
          {/* <Grid item xs={12} md={6}>
            <CustomSelect
              options={[]}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              label="Class"
              placeholder="Select Class"
              onChange={() => {}}
              value=""
              variant="filled"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              options={[]}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              label="Division"
              placeholder="Select Division"
              onChange={() => {}}
              value=""
              variant="filled"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              loading={false}
              noOptionsText={
                <Typography component="span" variant="body2">
                  No Student Found
                </Typography>
              }
              fullWidth
              // value={props.formik.values.sponsorStudent}
              // onChange={(e, value: any) => {
              //   props.formik.setFieldValue('sponsorStudent', value);
              // }}
              options={[]}
              getOptionLabel={(option: any) => option?.firstName || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Student"
                  placeholder="Search by student/employee name..."
                  fullWidth
                  variant="filled"
                />
              )}
              renderOption={(prop: any, option: any) => (
                <li {...prop} key={option.id}>
                  {option.firstName}
                </li>
              )}
              slotProps={{}}
            />
          </Grid> */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="First Name"
              placeholder="Enter First Name"
              variant="filled"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Middle Name"
              placeholder="Enter Middle Name"
              variant="filled"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Last Name"
              placeholder="Enter Last Name"
              variant="filled"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Contact Number"
              placeholder="Enter Contact Number"
              variant="filled"
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                color="error"
                sx={{ flexGrow: 1 }}
                onClick={popover.onClose}
              >
                Cancel
              </Button>
              <Button
                startIcon={<Search />}
                variant="outlined"
                color="success"
                sx={{ flexGrow: 1 }}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>

        <CustomizableTable
          tableId="global-search-table"
          data={[]}
          columns={[
            { label: 'Name', id: 'name' },
            { label: 'Class', id: 'class' },
            { label: 'GrNo', id: 'grNo' },
            { label: 'Batch', id: 'batch' },
            { label: 'Organization', id: 'organization' },
            { label: 'Status', id: 'status' },
          ]}
        />
      </Popover>
      {/* <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: { placement: 'top-left' },
          paper: { elevation: 6, sx: { maxWidth: 350, width: '100%' } },
        }}
      >
        sdasd
      </CustomPopover> */}
    </>
  );
};

export default GlobalSearch;
