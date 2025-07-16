const sortQueryString = (
  sortData: {
    column: string;
    direction: 'asc' | 'desc';
    originalId?: string;
  }[]
) =>
  sortData
    ?.map(
      (sort, index) =>
        `${sort.originalId || sort.column} ${sort.direction === 'asc' ? 'ASC' : 'DESC'}${index === sortData.length - 1 ? '' : ','}`
    )
    .join(',');
export default sortQueryString;
