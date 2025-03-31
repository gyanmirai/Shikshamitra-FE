'use client';

import type { BoxProps } from '@mui/material/Box';
import type { NavSectionProps } from 'src/components/nav-section';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useHotkeys } from 'react-hotkeys-hook';

import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog, { dialogClasses } from '@mui/material/Dialog';

import { useRouter } from 'src/routes/hooks';
import { isExternalLink } from 'src/routes/utils';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

import { ResultItem } from './result-item';
import { groupItems, applyFilter, getAllItems } from './utils';

// ----------------------------------------------------------------------

export type SearchbarProps = BoxProps & {
  data?: NavSectionProps['data'];
};

// const useBindShortcutKey = (items: NavSectionProps['data']) => {
//   const router = useRouter();
//   const navData = useMemo(() => {
//     const ans: { path: string; shortcutKeyName: string }[] = [];
//     const recursionFn = (data: NavItemBaseProps[]) => {
//       data.forEach((item) => {
//         if (item.path) {
//           ans.push({ path: item.path, shortcutKeyName: item.shortcutKeyName as string });
//         }
//         if (item.children) {
//           recursionFn(item.children);
//         }
//       });
//     };
//     recursionFn(items?.[0]?.items);
//     return ans;
//   }, [items]);

//   for (let i = 0; i < navData.length; i += 1) {
//     const item = navData[i];
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     useHotkeys(item.shortcutKeyName, (e) => {
//       e.preventDefault();
//       e.stopImmediatePropagation();
//       e.stopPropagation();
//       nProgress.start();
//       router.push(item.path);
//     });
//   }

//   return null;
// };

export function Searchbar({ data: navItems = [], sx, ...other }: SearchbarProps) {
  const theme = useTheme();

  const router = useRouter();

  const search = useBoolean();

  const [searchQuery, setSearchQuery] = useState('');
  // useBindShortcutKey(navItems);

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  useHotkeys('ctrl+shift+k', (e) => {
    e.preventDefault();
    search.onToggle();
    setSearchQuery('');
  });

  const handleClick = useCallback(
    (path: string) => {
      if (isExternalLink(path)) {
        window.open(path);
      } else {
        router.push(path);
      }
      handleClose();
    },
    [handleClose, router]
  );

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const dataFiltered = applyFilter({
    inputData: getAllItems({ data: navItems }),
    query: searchQuery,
  });

  const notFound = searchQuery && !dataFiltered.length;

  const renderItems = () => {
    const dataGroups = groupItems(dataFiltered);

    return Object.keys(dataGroups)
      .sort((a, b) => -b.localeCompare(a))
      .map((group, index) => (
        <Box component="ul" key={`${group}-${index}`}>
          {dataGroups[group].map((item) => {
            const { title, path, shortcutKeyName } = item;

            const partsTitle = parse(title, match(title, searchQuery));

            const partsPath = parse(path, match(path, searchQuery));

            return (
              <Box
                component="li"
                key={`${title}${path}`}
                sx={{ display: 'flex' }}
                onClick={handleClose}
              >
                <Box component={Link} href={path} sx={{ flexGrow: 1 }}>
                  <ResultItem
                    path={partsPath}
                    title={partsTitle}
                    groupLabel={searchQuery && group}
                    shortcutKeyName={shortcutKeyName}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      ));
  };

  const renderButton = (
    <Box
      display="flex"
      alignItems="center"
      onClick={search.onTrue}
      sx={{
        pr: { sm: 1 },
        borderRadius: { sm: 1.5 },
        cursor: { sm: 'pointer' },
        bgcolor: { sm: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
        ...sx,
      }}
      {...other}
    >
      <IconButton disableRipple>
        {/* https://icon-sets.iconify.design/eva/search-fill/ */}
        <SvgIcon sx={{ width: 20, height: 20 }}>
          <path
            fill="currentColor"
            d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
          />
        </SvgIcon>
      </IconButton>

      <Label
        sx={{
          fontSize: 12,
          color: 'grey.800',
          bgcolor: 'common.white',
          boxShadow: theme.customShadows.z1,
          display: { xs: 'none', sm: 'inline-flex' },
        }}
      >
        Search Module (ctrl + shift + K)
      </Label>
    </Box>
  );

  return (
    <>
      {renderButton}

      <Dialog
        fullWidth
        disableRestoreFocus
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{ enter: theme.transitions.duration.shortest, exit: 0 }}
        PaperProps={{ sx: { mt: 15, overflow: 'unset' } }}
        sx={{ [`& .${dialogClasses.container}`]: { alignItems: 'flex-start' } }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.vars.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{ sx: { typography: 'h6' } }}
          />
        </Box>

        {notFound ? (
          <SearchNotFound query={searchQuery} sx={{ py: 15 }} />
        ) : (
          <Scrollbar sx={{ px: 3, pb: 3, pt: 2, height: 400 }}>{renderItems()}</Scrollbar>
        )}
      </Dialog>
    </>
  );
}
