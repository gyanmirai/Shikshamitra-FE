import type { Theme, Components } from '@mui/material/styles';

import { handleSelectKeyDown } from 'src/utils/dropdown-select-keyboard';

import { menuItem } from '../../styles';

// ----------------------------------------------------------------------

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ ...menuItem(theme) }) },
};

// ----------------------------------------------------------------------

const MuiMenu: Components<Theme>['MuiMenu'] = {
  defaultProps: { onKeyDownCapture: handleSelectKeyDown },
};

export const menu = { MuiMenu, MuiMenuItem };
