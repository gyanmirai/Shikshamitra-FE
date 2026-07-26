export interface EarningComponentDependencyOption {
  id: string;
  componentName?: string;
  group?: string;
  selectedEarningComponentId?: string | null;
  customComponentId?: string | null;
}

export const EARNING_COMPONENT_DEPENDENCY_ERROR_CODES = new Set([
  'HR:Payroll:030035',
  'HR:Payroll:030036',
  'HR:Payroll:030037',
]);

const getSelectedComponentId = (component: EarningComponentDependencyOption) =>
  component.selectedEarningComponentId || component.customComponentId || null;

const hasInvalidDependencyChain = (
  candidate: EarningComponentDependencyOption,
  componentsById: ReadonlyMap<string, EarningComponentDependencyOption>,
  editingComponentId?: string
) => {
  const visited = new Set<string>();
  let current: EarningComponentDependencyOption | undefined = candidate;

  while (current) {
    if (current.id === editingComponentId || visited.has(current.id)) {
      return true;
    }

    visited.add(current.id);
    const selectedComponentId = getSelectedComponentId(current);

    if (!selectedComponentId) {
      return false;
    }

    current = componentsById.get(selectedComponentId);
    if (!current) {
      return true;
    }
  }

  return false;
};

export const getEligibleEarningDependencyOptions = <T extends EarningComponentDependencyOption>(
  components: readonly T[],
  editingComponentId?: string
) => {
  const componentsById = new Map(components.map((component) => [component.id, component]));

  return components.filter(
    (component) => !hasInvalidDependencyChain(component, componentsById, editingComponentId)
  );
};

export const isEarningComponentDependencyError = (errorCode?: string) =>
  Boolean(errorCode && EARNING_COMPONENT_DEPENDENCY_ERROR_CODES.has(errorCode));
