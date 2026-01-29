'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MyResourceRequestTable from './component/my-resource-request-table';

const MyResourceRequestScreen = () => {
  const links = [{ name: 'Resource Management' }, { name: 'My Query' }];

  return (
    <>
      <CustomBreadcrumbs heading="My Resource Query" links={links} />

      <MyResourceRequestTable onClick={() => {}} />
    </>
  );
};

export default MyResourceRequestScreen;
