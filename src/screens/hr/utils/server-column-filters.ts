import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

type Scalar = string | number | boolean | undefined;
export type ServerColumnBinding = {
  column: string;
  query: string;
  /** Only use contains when the reader searches this single field. */
  operator?: 'contains' | 'equals';
  options?: { label: string; value: string | number | boolean }[];
  emptyValue?: Scalar;
};

/** Project scalar endpoint predicates into the shared table without filtering a loaded page.
 * The owner applies the patch to its canonical query, resets pagination and exports that query.
 * A scalar endpoint cannot represent multiple OR values: the latest choice replaces its predecessor.
 */
export function serverColumnFilters(
  columns: IColumn[],
  bindings: ServerColumnBinding[],
  values: Record<string, Scalar>,
  onChange: (patch: Record<string, Scalar>) => void
) {
  const filters: IParams['filters'] = bindings.flatMap((binding) => {
    const value = values[binding.query];
    if (value === undefined || value === '' || value === binding.emptyValue) return [];
    const column = columns.find(({ id }) => id === binding.column);
    const option = binding.options?.find((item) => String(item.value) === String(value));
    return [
      {
        column: binding.column,
        type: binding.operator ?? 'equals',
        value: option?.value ?? value,
        valueType: binding.options ? 'enum' : 'string',
        label: column?.label ?? binding.column,
        displayValue: option?.label ?? String(value),
      },
    ];
  });
  return {
    columns: columns.map((column) => {
      const binding = bindings.find((item) => item.column === column.id);
      return binding
        ? {
            ...column,
            isFilter: true,
            filterType: binding.options ? ('enum' as const) : ('string' as const),
            filterOperators: [binding.operator ?? 'equals'],
            enumOptions: binding.options,
          }
        : { ...column, isFilter: false };
    }),
    filters,
    onServerFilter: (selected: IParams['filters']) => {
      const patch: Record<string, Scalar> = {};
      bindings.forEach((binding) => {
        const filter = selected.filter((item) => item.column === binding.column).at(-1);
        const validOperator = filter?.type === (binding.operator ?? 'equals');
        const option = binding.options?.find(
          (item) => String(item.value) === String(filter?.value)
        );
        patch[binding.query] =
          validOperator && (!binding.options || option)
            ? (option?.value ?? String(filter!.value))
            : binding.emptyValue;
      });
      onChange(patch);
    },
  };
}

export const nameContains = (column = 'name'): ServerColumnBinding => ({
  column,
  query: 'search',
  operator: 'contains',
  emptyValue: '',
});
