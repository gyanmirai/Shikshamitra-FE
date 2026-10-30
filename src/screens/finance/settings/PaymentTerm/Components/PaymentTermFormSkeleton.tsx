import FinanceFormSkeleton, {
  FinanceSkeletonRows,
  FinanceSkeletonFields,
  FinanceSkeletonSection,
} from '../../../components/FinanceFormSkeleton';

export default function PaymentTermFormSkeleton({
  installmentCount = 3,
}: {
  installmentCount?: number;
}) {
  return (
    <FinanceFormSkeleton label="Loading payment term">
      <FinanceSkeletonSection>
        <FinanceSkeletonFields
          fields={[
            { columns: 8, md: 6 },
            { columns: 4, md: 3 },
            { columns: 4, md: 3 },
            { columns: 8, height: 60 },
            { columns: 12, md: 4, height: 60, toggle: true },
          ]}
        />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields fields={[{ columns: 6 }, { columns: 6 }]} />
        <FinanceSkeletonRows columns={5} rows={Math.min(6, Math.max(1, installmentCount))} />
      </FinanceSkeletonSection>
    </FinanceFormSkeleton>
  );
}
