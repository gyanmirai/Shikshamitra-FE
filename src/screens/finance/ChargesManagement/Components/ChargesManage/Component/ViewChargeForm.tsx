import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargeByIdQuery } from 'src/redux/finance/ChargeManagement/chargeApi';

import RequestorInfoCard from './ViewChargeComponent/RequestorInfoCard';
import ChargeViewSkeleton from './ViewChargeComponent/ChargeViewSkeleton';
import ChargeViewDetailsCard from './ViewChargeComponent/ChargeDetailsCard';
import ChargeInformationAccordion from './ViewChargeComponent/BasicChargeAccordianCard';

import type { IChargeData } from './type';

interface Props {
  charge: IChargeData | null;
  isActionShow: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const ChargeDetailsCard: React.FC<Props> = ({
  charge,
  isActionShow = false,
  onApprove,
  onReject,
}) => {
  const { data: selectedCharge, isLoading: isChargeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: charge?.chargeId,
  });

  if (isChargeLoading) {
    return <ChargeViewSkeleton />;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Scrollbar sx={{ height: '100%', p: 2 }}>
        <Grid container spacing={2}>
          {/* Left section (size 10) */}
          <Grid size={{ xs: 12 }}>
            <ChargeInformationAccordion charge={selectedCharge?.data} />
          </Grid>

          {/* Right section (size 2) */}

          {/* Full-width section (size 12) */}
          <Grid size={{ xs: 12, md: 7 }}>
            <ChargeViewDetailsCard charge={selectedCharge?.data} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <RequestorInfoCard charge={selectedCharge?.data} />
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="soft"
          color="error"
          onClick={onReject}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Reject
        </Button>

        <Button
          variant="soft"
          color="success"
          onClick={onApprove}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.tick} />}
        >
          Approve
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ChargeDetailsCard;
