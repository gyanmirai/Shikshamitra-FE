import { useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

export const BackPopUpChecked = ({
  initialValues,
  currentValues,
  children,
}: Record<string, any>) => {
  console.log('initialValues', initialValues);
  console.log('currentValues', currentValues);
  const isEqualValue = useMemo(
    () => JSON.stringify(initialValues) === JSON.stringify(currentValues),
    [initialValues, currentValues]
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsChanges(!isEqualValue));
  }, [dispatch, isEqualValue]);
  return children;
};
