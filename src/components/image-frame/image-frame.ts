export type FrameSize = { width: number; height: number };
export type ImagePlacement = { fit: 'contain' | 'cover'; zoom: number; x: number; y: number };
export type PendingFrameImage = { file: File; image: HTMLImageElement; url: string };

export const DEFAULT_PLACEMENT: ImagePlacement = { fit: 'contain', zoom: 1, x: 50, y: 50 };

export function frameRectangle(image: FrameSize, frame: FrameSize, placement: ImagePlacement) {
  const scales = [frame.width / image.width, frame.height / image.height];
  const scale =
    (placement.fit === 'contain' ? Math.min(...scales) : Math.max(...scales)) * placement.zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    width,
    height,
    x: ((frame.width - width) * placement.x) / 100 || 0,
    y: ((frame.height - height) * placement.y) / 100 || 0,
  };
}

export function loadFrameImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('This image could not be read. Choose a valid PNG or JPG.'));
    image.src = url;
  });
}

export async function renderImageFrame(
  file: File,
  image: HTMLImageElement,
  frame: FrameSize,
  placement: ImagePlacement,
  maxBytes: number
) {
  const rect = frameRectangle(
    { width: image.naturalWidth, height: image.naturalHeight },
    frame,
    placement
  );
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Image framing is unavailable in this browser. Try again in another browser.');
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error('The image could not be prepared. Try again.')),
      'image/png'
    );
  });
  if (blob.size > maxBytes)
    throw new Error('The framed image exceeds the upload limit. Choose a smaller image.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-framed.png`, { type: 'image/png' });
}
