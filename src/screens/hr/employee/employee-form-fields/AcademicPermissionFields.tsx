import React, { useRef, useState, useEffect } from 'react';
import { BoardScreenStep } from 'src/screens/security/accessControl';

import type { FieldsType } from './types';

const emptySelection = {
  boards: [] as string[],
  mediums: [] as string[],
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
};

function RenderAcademicPermissionFields(props: any) {
  const { formik } = props;

  const [checkedItem, setCheckedItemLocal] = useState(
    formik?.values?.academicPermission || emptySelection
  );
  const [selectedData, setSelectedDataLocal] = useState(
    formik?.values?.academicPermissionSelectedData || emptySelection
  );

  // Track whether the current checkedItem was set by user interaction (not from API sync)
  // to avoid overwriting user edits when formik re-renders
  const userEditedRef = useRef(false);

  // Sync local checkedItem when FormSlider populates formik from the API (step 7 load)
  useEffect(() => {
    if (!userEditedRef.current) {
      const val = formik?.values?.academicPermission;
      if (val) {
        setCheckedItemLocal(val);
      }
    }
  }, [formik?.values?.academicPermission]);

  useEffect(() => {
    if (!userEditedRef.current) {
      const val = formik?.values?.academicPermissionSelectedData;
      if (val) {
        setSelectedDataLocal(val);
      }
    }
  }, [formik?.values?.academicPermissionSelectedData]);

  const setCheckedItem = (value: any) => {
    userEditedRef.current = true;
    setCheckedItemLocal(value);
    formik.setFieldValue('academicPermission', value);
  };

  const setSelectedData = (value: any) => {
    setSelectedDataLocal(value);
    formik.setFieldValue('academicPermissionSelectedData', value);
  };

  return (
    <BoardScreenStep
      checkedItem={checkedItem}
      setCheckedItem={setCheckedItem}
      selectedData={selectedData}
      setSelectedData={setSelectedData}
    />
  );
}

export const AcademicPermissionFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Academic Permission',
    name: 'academicPermission',
    gridProps: { size: { xs: 12, md: 12 }, sx: { height: '100%', width: '100%' } },
    renderComp(props: any) {
      return <RenderAcademicPermissionFields {...props} />;
    },
  },
];
