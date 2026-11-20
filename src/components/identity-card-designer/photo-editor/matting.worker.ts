import { env, RawImage, AutoModel, AutoProcessor } from '@huggingface/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm!.numThreads = 1;
const revision = 'fa2fa546052fba4c08921230a26cc69a333fca12';

const worker = globalThis as unknown as {
  onmessage: ((event: MessageEvent<{ pixels: Uint8Array; width: number; height: number }>) => void) | null;
  postMessage: (message: unknown) => void;
};

worker.onmessage = async ({ data }) => {
  let model: Awaited<ReturnType<typeof AutoModel.from_pretrained>> | undefined;
  try {
    const progress_callback = (event: unknown) => {
      const progress = event as { status: string; file?: string; progress?: number };
      worker.postMessage({ type: 'progress', ...progress });
    };
    worker.postMessage({ type: 'progress', status: 'Loading portrait model' });
    model = await AutoModel.from_pretrained('Xenova/modnet', { dtype: 'fp32', device: 'wasm', revision, progress_callback });
    const processor = await AutoProcessor.from_pretrained('Xenova/modnet', { revision, progress_callback });
    worker.postMessage({ type: 'progress', status: 'Removing background on this device' });
    const image = new RawImage(data.pixels, data.width, data.height, 4);
    const { pixel_values } = await processor(image);
    const { output } = await model({ input: pixel_values });
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(data.width, data.height);
    worker.postMessage({ type: 'result', pixels: mask.data, channels: mask.channels, width: mask.width, height: mask.height });
  } catch (error) {
    worker.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Portrait model failed.' });
  } finally {
    await model?.dispose();
  }
};
