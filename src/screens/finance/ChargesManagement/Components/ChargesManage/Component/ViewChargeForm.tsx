import { Box, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import RequestorInfoCard from './RequestorInfoCard';
import ChargeFirstDetailsCard from './ChargeFirstDetailCard';

import type { IChargeData } from './type';

interface Props {
  charge: IChargeData | null;
  isActionShow: boolean;
}

const ChargeDetailsCard: React.FC<Props> = ({ charge, isActionShow = false }) => (
  <Box sx={{ height: '100%' }}>
    <Scrollbar sx={{ height: '500px' }}>
      <ChargeFirstDetailsCard charge={charge} />
      <RequestorInfoCard charge={charge} />
      {isActionShow && (
        <Box sx={{ p: 2 }}>
          <TextField fullWidth multiline rows={3} label="Remarks/Comment" size="small" />
        </Box>
      )}
    </Scrollbar>

    {isActionShow && (
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => {}}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Reject
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={() => {}}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Approve
        </Button>
      </DialogActions>
    )}
  </Box>
);

export default ChargeDetailsCard;
