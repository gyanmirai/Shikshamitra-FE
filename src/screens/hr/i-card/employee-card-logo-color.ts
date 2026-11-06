export const extractDominantColor = (file: File) =>
  new Promise<string | null>((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(null);
      return;
    }

    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      context?.drawImage(image, 0, 0, size, size);
      const data = context?.getImageData(0, 0, size, size).data;
      URL.revokeObjectURL(url);

      if (!data) {
        resolve(null);
        return;
      }

      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const isVisible = alpha >= 128;
        const isNotWhite = r <= 235 || g <= 235 || b <= 235;
        if (isVisible && isNotWhite) {
          red += r;
          green += g;
          blue += b;
          count += 1;
        }
      }

      if (!count) {
        resolve(null);
        return;
      }

      const toHex = (value: number) =>
        Math.round(value / count)
          .toString(16)
          .padStart(2, '0');
      resolve(`#${toHex(red)}${toHex(green)}${toHex(blue)}`);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
