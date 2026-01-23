import type { IColumn } from 'src/components/customizabaleTable/types';

const getStickyOffsets = (columns: IColumn[]) => {
  let leftOffset = 0;
  let rightOffset = 0;

  return columns.map((col) => {
    const width = parseInt(String(col.minWidth)?.replace('px', '') ?? '150', 10);

    if (col.sticky && col.stickyPosition === 'left') {
      const offset = leftOffset;
      leftOffset += width;
      return { left: offset, right: undefined };
    }
    if (col.sticky && !col.stickyPosition) {
      const offset = leftOffset;
      leftOffset += width;
      return { left: offset, right: undefined };
    }

    if (col.sticky && col.stickyPosition === 'right') {
      const offset = rightOffset;
      rightOffset += width;
      return { left: undefined, right: offset };
    }

    return { left: undefined, right: undefined };
  });
};

export default getStickyOffsets;
