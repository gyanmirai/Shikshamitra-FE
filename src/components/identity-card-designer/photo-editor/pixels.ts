export function mattePixels(matte: Uint8Array | Uint8ClampedArray, channels: number) {
  const output = new Uint8ClampedArray((matte.length / channels) * 4);
  for (let i = 0; i < output.length / 4; i += 1) {
    output.set([255, 255, 255, matte[i * channels]], i * 4);
  }
  return output;
}

