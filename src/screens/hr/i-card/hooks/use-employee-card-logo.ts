import { useState, useEffect } from 'react';
import {
  useLazyGetEmployeeICardAssetQuery,
  useGetEmployeeICardSchoolLogoQuery,
} from 'src/redux/hr/employee-icard-template-api';

export function useEmployeeCardLogo(identity: {
  organization: string;
  logoMode: 0 | 1 | 2;
  logoPreview: string;
  logoBlobName: string | null;
}) {
  const query = useGetEmployeeICardSchoolLogoQuery(
    identity.organization === 'all' ? undefined : identity.organization,
    { skip: identity.logoMode !== 0 }
  );
  const [inherited, setInherited] = useState<{ blob: Blob; url: string } | null>(null);
  const [custom, setCustom] = useState<{ blobName: string; url: string } | null>(null);
  const [loadAsset, customQuery] = useLazyGetEmployeeICardAssetQuery();
  useEffect(() => {
    if (!query.currentData || identity.logoMode !== 0) {
      setInherited(null);
      return undefined;
    }
    const url = URL.createObjectURL(query.currentData);
    setInherited({ blob: query.currentData, url });
    return () => URL.revokeObjectURL(url);
  }, [identity.logoMode, query.currentData]);
  useEffect(() => {
    const blobName = identity.logoBlobName;
    if (identity.logoMode !== 1 || !blobName || identity.logoPreview) return undefined;
    let active = true;
    let url = '';
    loadAsset(blobName, true)
      .unwrap()
      .then((blob: Blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setCustom({ blobName, url });
      })
      .catch(() => {
        if (active) setCustom(null);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [identity.logoMode, identity.logoBlobName, identity.logoPreview, loadAsset]);
  const inheritedUrl = inherited?.blob === query.currentData ? (inherited?.url ?? '') : '';
  const customUrl = custom?.blobName === identity.logoBlobName ? (custom?.url ?? '') : '';
  return {
    url:
      identity.logoMode === 0
        ? inheritedUrl
        : identity.logoMode === 1
          ? identity.logoPreview || customUrl
          : '',
    isError:
      identity.logoMode === 0 ? query.isError : identity.logoMode === 1 && customQuery.isError,
    isLoading:
      identity.logoMode === 0
        ? query.isFetching
        : identity.logoMode === 1 && customQuery.isFetching,
    retry: () =>
      identity.logoMode === 0
        ? query.refetch()
        : identity.logoBlobName && loadAsset(identity.logoBlobName),
  };
}
