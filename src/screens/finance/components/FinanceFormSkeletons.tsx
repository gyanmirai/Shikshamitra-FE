import FinanceFormSkeleton, {
  FinanceSkeletonRows,
  FinanceSkeletonFields,
  FinanceSkeletonSection,
} from './FinanceFormSkeleton';

export function FeeCategoryFormSkeleton({ headCount = 1 }: { headCount?: number }) {
  return (
    <FinanceFormSkeleton label="Loading fee category editor">
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{}, { height: 60 }]} />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        {Array.from({ length: Math.max(1, headCount) }, (_, index) => (
          <FinanceSkeletonSection key={index}>
            <FinanceSkeletonFields
              fields={[{ columns: 6 }, { columns: 6 }, { toggle: true }, { height: 60 }]}
            />
          </FinanceSkeletonSection>
        ))}
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}

export function ChargeFormSkeleton() {
  return (
    <FinanceFormSkeleton label="Loading charge form">
      <FinanceSkeletonSection>
        <FinanceSkeletonFields
          fields={[{ columns: 6 }, { columns: 6 }, { columns: 6 }, { columns: 6 }, { height: 72 }]}
        />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{ columns: 6 }, { columns: 6 }]} />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{ columns: 4 }, { columns: 4 }, { columns: 4 }]} />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{}, { columns: 6 }, { columns: 6 }]} />
        <FinanceSkeletonRows columns={4} />
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}

export function AccountEntryFormSkeleton() {
  return (
    <FinanceFormSkeleton label="Loading entry categories and bank accounts">
      <FinanceSkeletonSection>
        <FinanceSkeletonFields
          fields={[{ columns: 6 }, { columns: 6 }, { columns: 6 }, { columns: 6 }]}
        />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields
          fields={[{ columns: 6 }, { columns: 6 }, { columns: 6 }, { columns: 6 }]}
        />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{ height: 80 }]} />
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}

export function FeeStructureFormSkeleton() {
  return (
    <FinanceFormSkeleton label="Loading fee structure form">
      <FinanceSkeletonFields fields={[{ columns: 4 }, { columns: 4 }, { columns: 4 }]} />
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{}]} />
        <FinanceSkeletonRows columns={4} />
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}

export function AssignmentFormSkeleton() {
  return (
    <FinanceFormSkeleton label="Loading fee assignment">
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{}]} />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonRows columns={3} />
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}
