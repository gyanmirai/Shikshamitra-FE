import { Box } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

import type { StudentTabsComponentType } from '.';

const Communication = (props: StudentTabsComponentType) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 'calc(100vh - 280px)',
    }}
  >
    <EmptyContent
      title="No Announcements"
      description="No announcements found for this student."
      imgUrl="/assets/icons/empty/ic_content.svg"
    />
  </Box>
);

export default Communication;
