# Quick Reference: Concession Distribution Utility

## 🎯 What It Does

Distributes a concession amount across multiple due fees as **whole numbers** (no decimals), ensuring the sum always equals the total.

## 📦 Imports

```typescript
import {
  distributeConcessionAcrossDueFees,
  calculatePerLineConcession,
  IDueFeeAllocation,
} from 'src/utils/distributeConcession';
```

## 💡 Main Function

### `distributeConcessionAcrossDueFees(dueFeeIds, approvedConcessionAmount)`

**Purpose**: Distribute a concession amount across multiple due fees

**Parameters:**

- `dueFeeIds: string[]` - Array of due fee IDs to allocate to
- `approvedConcessionAmount: number` - Total amount to distribute

**Returns:** `IDueFeeAllocation[]`

```typescript
interface IDueFeeAllocation {
  dueFeeId: string;
  concessionAmount: number;
}
```

### Example Usage:

```typescript
const dueFeeIds = ['fee-001', 'fee-002', 'fee-003', 'fee-004', 'fee-005', 'fee-006'];
const totalAmount = 20000;

const allocations = distributeConcessionAcrossDueFees(dueFeeIds, totalAmount);

// Result:
// [
//   { dueFeeId: 'fee-001', concessionAmount: 3334 },
//   { dueFeeId: 'fee-002', concessionAmount: 3334 },
//   { dueFeeId: 'fee-003', concessionAmount: 3333 },
//   { dueFeeId: 'fee-004', concessionAmount: 3333 },
//   { dueFeeId: 'fee-005', concessionAmount: 3333 },
//   { dueFeeId: 'fee-006', concessionAmount: 3333 }
// ]

// Total: 20000 ✓
```

---

## 📊 Helper Function

### `calculatePerLineConcession(totalConcession, selectedCount)`

**Purpose**: Calculate per-line concession for UI display

**Parameters:**

- `totalConcession: number` - Total concession amount
- `selectedCount: number` - Number of selected lines/months

**Returns:** `number` - Per-line concession amount (integer)

### Example Usage:

```typescript
const perLine = calculatePerLineConcession(10000, 4);
// Result: 2500

const perLine2 = calculatePerLineConcession(20000, 6);
// Result: 3333
```

---

## 🔢 How It Works

```
Input: amount=20000, count=6

Step 1: Calculate base
  base = 20000 ÷ 6 = 3333 (integer division)

Step 2: Calculate remainder
  remainder = 20000 % 6 = 2

Step 3: Distribute
  First 2 items: 3333 + 1 = 3334
  Remaining 4 items: 3333

Output: [3334, 3334, 3333, 3333, 3333, 3333]
Sum: 20000 ✓
```

---

## ✅ Edge Cases Handled

```typescript
// Perfect division
distributeConcessionAcrossDueFees(['a', 'b', 'c', 'd'], 12000);
// → [3000, 3000, 3000, 3000]

// Single fee
distributeConcessionAcrossDueFees(['fee1'], 5000);
// → [5000]

// Amount smaller than count
distributeConcessionAcrossDueFees(['f1', 'f2', 'f3', 'f4', 'f5'], 3);
// → [1, 1, 1, 0, 0]

// Zero amount
distributeConcessionAcrossDueFees(['f1', 'f2', 'f3'], 0);
// → [0, 0, 0]

// Negative amount (treated as 0)
distributeConcessionAcrossDueFees(['f1', 'f2'], -100);
// → [0, 0]

// Empty array
distributeConcessionAcrossDueFees([], 5000);
// → []
```

---

## 🔗 Real-World Usage in Component

```typescript
// In ConcessionFeeHeadApprovalView.tsx

const feeHeadApprovals = selectedFeeHeads.map((fh) => {
  const group = groups.find((g) => g.feeHeadId === fh.feeHeadId)!;

  // Use the utility to distribute the concession
  const allocations = distributeConcessionAcrossDueFees(
    fh.selectedDueFeeIds,
    group.concessionAmount
  );

  return {
    feeHeadId: fh.feeHeadId,
    approvedConcessionAmount: group.concessionAmount,
    dueFeeAllocations: allocations, // ✓ Clean integer allocations
  };
});

// Send to API
await approveConcession({
  studentConcessionTypeRequestId: requestId,
  body: {
    message: values.description,
    feeHeadApprovals,
  },
}).unwrap();
```

---

## 📋 Checklist for Using

- ✓ Import the function from `src/utils/distributeConcession`
- ✓ Pass array of due fee IDs and total amount
- ✓ Receive array of `IDueFeeAllocation` objects
- ✓ Use allocations in your API payload
- ✓ All amounts are integers (no decimals)
- ✓ Sum is guaranteed to equal total
- ✓ No rounding errors

---

## 🐛 Debugging

The utility includes built-in validation in development mode:

```typescript
if (process.env.NODE_ENV === 'development') {
  const totalDistributed = allocations.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
  if (totalDistributed !== approvedConcessionAmount) {
    console.warn('[distributeConcessionAcrossDueFees] Allocation sum does not match!');
  }
}
```

**Check browser console for warnings during development.**

---

## 📚 Related Files

- **Utility**: `src/utils/distributeConcession.ts`
- **Component**: `src/screens/finance/ConcessionAdmin/ConcessionFeeHeadApprovalView.tsx`
- **Tests**: `src/utils/distributeConcession.test.ts`
- **Documentation**: `CONCESSION_DISTRIBUTION_IMPLEMENTATION.md`

---

## 🎓 Key Takeaways

1. **Always use integers**: No decimal values in allocations
2. **Sum guarantee**: Total always equals the input amount
3. **Fair distribution**: Remainder spread evenly
4. **Reusable**: Works anywhere in the app
5. **Type-safe**: Full TypeScript support

---

## ❓ Common Questions

**Q: What if amount < count?**
A: First N fees get 1, rest get 0. Example: 10 across 25 fees = [1,1,1,1,1,1,1,1,1,1,0,0,...]

**Q: Will the sum always match?**
A: Yes! Built-in validation checks this. It's mathematically guaranteed.

**Q: Can I modify the distribution order?**
A: Yes, simply reorder the `dueFeeIds` array before calling the function.

**Q: What about negative amounts?**
A: Treated as 0. All allocations become 0.

**Q: Do I need to validate the result?**
A: No, but you can sum and verify if needed: `allocations.reduce((s, a) => s + a.concessionAmount, 0)`
