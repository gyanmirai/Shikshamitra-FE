import { useState, useEffect } from 'react';
import { useGetHouseLogoQuery } from 'src/redux/student/house-management/house-management-api';

// Stored file URLs require the authenticated API client; external legacy URLs remain valid.
export function useHouseLogo(logoUrl?: string | null) {
  const fileName = logoUrl?.match(/^\/api\/files\/([^/?#]+)$/)?.[1];
  const { currentData } = useGetHouseLogoQuery(fileName ? decodeURIComponent(fileName) : '', {
    skip: !fileName,
  });
  const [preview, setPreview] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    if (!currentData) return undefined;
    const url = URL.createObjectURL(currentData);
    setPreview({ blob: currentData, url });
    return () => URL.revokeObjectURL(url);
  }, [currentData]);
  return fileName
    ? preview?.blob === currentData
      ? preview?.url
      : undefined
    : logoUrl || undefined;
}
