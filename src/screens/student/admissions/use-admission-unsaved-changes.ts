'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

export function useAdmissionUnsavedChanges(open: boolean, dirty: boolean) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsChanges(open && dirty));
    return () => {
      dispatch(setIsChanges(false));
    };
  }, [dispatch, dirty, open]);
}
