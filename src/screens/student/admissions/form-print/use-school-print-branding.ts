import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  useGetSchoolBrandingQuery,
  useGetSchoolBrandingImageQuery,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

function useImageData(blob?: Blob | null) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState<Blob | null>(null);
  useEffect(() => {
    if (!blob) return undefined;
    const reader = new FileReader();
    reader.onload = () => setImage({ blob, url: String(reader.result) });
    reader.onerror = () => setFailed(blob);
    reader.readAsDataURL(blob);
    return () => {
      reader.onload = null;
      reader.onerror = null;
      if (reader.readyState === 1) reader.abort();
    };
  }, [blob]);
  return {
    url: blob && image?.blob === blob ? image.url : undefined,
    failed: Boolean(blob && failed === blob),
  };
}

/** Tenant-owned read-only branding; no School Identity management permission is required. */
export function useSchoolPrintBranding(enabled: boolean, includeImages = true) {
  const tenantId = useSelector((state: RootState) => state.auth.sessionContext?.tenantId);
  const skip = !enabled || !tenantId;
  const metadata = useGetSchoolBrandingQuery({ tenantId: tenantId ?? '' }, { skip });
  const hasLogo = !skip && includeImages && Boolean(metadata.currentData?.logo);
  const hasBanner = !skip && includeImages && Boolean(metadata.currentData?.banner);
  const logo = useGetSchoolBrandingImageQuery(
    { kind: 'logo', tenantId: tenantId ?? '' },
    { skip: !hasLogo }
  );
  const banner = useGetSchoolBrandingImageQuery(
    { kind: 'banner', tenantId: tenantId ?? '' },
    { skip: !hasBanner }
  );
  const logoImage = useImageData(hasLogo ? logo.currentData : null);
  const bannerImage = useImageData(hasBanner ? banner.currentData : null);
  const pendingImage =
    (hasLogo && Boolean(logo.currentData) && !logoImage.url && !logoImage.failed) ||
    (hasBanner && Boolean(banner.currentData) && !bannerImage.url && !bannerImage.failed);
  return {
    branding: {
      schoolName: skip ? undefined : metadata.currentData?.schoolName,
      addressLines: skip ? undefined : metadata.currentData?.addressLines,
      schoolPhone: skip ? undefined : metadata.currentData?.schoolPhone,
      schoolEmail: skip ? undefined : metadata.currentData?.schoolEmail,
      schoolWebsite: skip ? undefined : metadata.currentData?.schoolWebsite,
      logoUrl: skip ? undefined : logoImage.url,
      bannerUrl: skip ? undefined : bannerImage.url,
    },
    loading:
      !skip &&
      (metadata.isFetching ||
        (hasLogo && logo.isFetching) ||
        (hasBanner && banner.isFetching) ||
        pendingImage),
    error:
      !skip &&
      (metadata.isError ||
        (hasLogo && logo.isError) ||
        (hasBanner && banner.isError) ||
        logoImage.failed ||
        bannerImage.failed),
    retry: () => {
      metadata.refetch();
      if (hasLogo) logo.refetch();
      if (hasBanner) banner.refetch();
    },
  };
}
