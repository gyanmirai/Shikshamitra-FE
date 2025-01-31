import type React from 'react';

import NormalRouteLayout from 'src/components/normal-route-layout';

const NormalLayout: React.FC<any> = ({ children }) => (
  <NormalRouteLayout>{children}</NormalRouteLayout>
);
export default NormalLayout;
