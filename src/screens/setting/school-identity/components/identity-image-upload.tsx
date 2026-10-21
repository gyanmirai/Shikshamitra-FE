import type { ComponentProps } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRef, useState, useEffect } from 'react';
import { ImageUpload } from 'src/components/upload/image-upload';
import { useLazyGetSchoolIdentityAssetQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { IdentityFrameDialog } from './identity-frame-dialog';
import { loadIdentityImage, validateIdentityDimensions } from '../identity-image-frame';

import type { IdentityKind, IdentityContext } from '../types';
import type { PendingIdentityImage } from './identity-frame-dialog';

export function IdentityImageUpload({
  kind,
  context,
  assetId,
  onPreparing,
  ...props
}: ComponentProps<typeof ImageUpload> & {
  kind: IdentityKind;
  context: IdentityContext;
  assetId?: string | null;
  onPreparing?: (busy: boolean) => void;
}) {
  const [pending, setPending] = useState<PendingIdentityImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  const [fetchAsset] = useLazyGetSchoolIdentityAssetQuery();
  useEffect(
    () => () => {
      request.current += 1;
    },
    []
  );
  useEffect(() => {
    onPreparing?.(loading || Boolean(pending));
    return () => onPreparing?.(false);
  }, [loading, pending, onPreparing]);
  useEffect(
    () => () => {
      if (pending) URL.revokeObjectURL(pending.url);
    },
    [pending]
  );
  const prepare = async (getFile: () => Promise<File>) => {
    request.current += 1;
    const sequence = request.current;
    setLoading(true);
    setError('');
    let url = '';
    try {
      const file = await getFile();
      url = URL.createObjectURL(file);
      const image = await loadIdentityImage(url);
      validateIdentityDimensions(kind, image.naturalWidth, image.naturalHeight);
      if (sequence === request.current) {
        setPending({ file, image, url });
        url = '';
      }
    } catch (failure) {
      if (sequence === request.current)
        setError(
          failure instanceof Error ? failure.message : 'The image could not be loaded. Try again.'
        );
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (sequence === request.current) setLoading(false);
    }
  };
  return (
    <Stack spacing={1}>
      <ImageUpload
        {...props}
        disabled={props.disabled || loading}
        error={error || props.error}
        onUpload={(file) => prepare(() => Promise.resolve(file))}
      />
      {assetId && (
        <Button
          sx={{ alignSelf: 'flex-start' }}
          disabled={props.disabled || loading}
          onClick={() =>
            prepare(async () => {
              const blob = await fetchAsset({ id: assetId, ...context }).unwrap();
              return new File([blob], props.fileName || `${kind}.png`, { type: blob.type });
            })
          }
        >
          Adjust image in frame
        </Button>
      )}
      {loading && <span role="status">Reading image…</span>}
      {pending && (
        <IdentityFrameDialog
          key={pending.url}
          kind={kind}
          pending={pending}
          onClose={() => setPending(null)}
          onApply={(file) => {
            setPending(null);
            props.onUpload(file);
          }}
        />
      )}
    </Stack>
  );
}
