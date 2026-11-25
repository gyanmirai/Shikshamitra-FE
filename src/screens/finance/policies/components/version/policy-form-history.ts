import {
  normalizeFieldKey,
  deserializeVersionValue,
  policyVersionValuesEqual,
} from './finance-policy-version-formatters';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

const GENERAL_FIELDS = new Set(['policyname', 'description', 'status', 'isdefault']);

const POLICY_FIELDS = new Map([
  ['concession', new Set(['valuesource', 'calculationmethod', 'applyon'])],
  [
    'refund',
    new Set([
      'feeheadscope',
      'includepaidcharges',
      'includepaidlatefee',
      'allowedpayoutmethods',
      'expensecategoryid',
    ]),
  ],
  ['collection', new Set(['allocationbasis', 'receiptgrouping', 'enablelatefee'])],
  ['proration', new Set(['rules'])],
]);

function normalizedEntries(snapshot: Record<string, unknown>) {
  return new Map(
    Object.entries(snapshot).map(([field, value]) => [
      normalizeFieldKey(field),
      { field, value: deserializeVersionValue(value) },
    ])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function prorationEvent(
  enabled: unknown,
  rule: unknown,
  cutoff: unknown,
  action: unknown,
  withdrawal = false
) {
  if (enabled === false) return 'Off';
  switch (String(rule ?? '').toLowerCase()) {
    case '1':
    case 'daily':
    case 'dailyproration':
      return 'Daily proration · Calendar days';
    case '2':
    case 'monthlycutoff':
    case 'monthlyproration': {
      const behavior = ['1', 'halfcharge', 'halfmonthrule'].includes(String(action).toLowerCase())
        ? 'Half month charge'
        : withdrawal
          ? 'Waive exit month'
          : 'Charge from next month';
      return [
        'Monthly proration',
        action == null ? null : behavior,
        cutoff == null ? null : `Monthly cut-off day ${cutoff}`,
      ]
        .filter(Boolean)
        .join(' · ');
    }
    case '3':
    case 'fullmonthcharge':
      return 'Monthly proration · Full month charge';
    case '0':
    case 'fullcharge':
    case 'noproration':
      return 'No proration';
    default:
      return enabled === true ? 'On' : undefined;
  }
}

function prorationRule(rule: Record<string, unknown>) {
  const fields = normalizedEntries(rule);
  const read = (key: string) => fields.get(key)?.value;
  return {
    feeHeadId: read('feeheadid'),
    feeHeadName: read('feeheadname'),
    admission: prorationEvent(
      read('applyonadmission'),
      read('ruletype'),
      read('cutoffday'),
      read('aftercutoffaction')
    ),
    earlyWithdrawal: prorationEvent(
      read('applyonearlywithdrawal'),
      read('earlywithdrawalruletype'),
      read('earlywithdrawalcutoffday'),
      read('earlywithdrawalbeforecutoffaction'),
      true
    ),
  };
}

function escalationSlab(slab: Record<string, unknown>) {
  const fields = normalizedEntries(slab);
  return {
    fromDay: fields.get('startday')?.value,
    toDay: fields.get('endday')?.value,
    type: fields.get('calculationtype')?.value,
    value: fields.get('value')?.value,
  };
}

function applicableFields(policyType: string, values: ReturnType<typeof normalizedEntries>) {
  const read = (field: string) => values.get(field)?.value;
  const matches = (field: string, ...options: string[]) => {
    const value = String(read(field) ?? '')
      .trim()
      .toLowerCase();
    return value === '' || options.includes(value);
  };

  if (policyType === 'concession') {
    const percentage = matches('calculationmethod', '0', 'percentage');
    const amount = matches('calculationmethod', '1', 'fixedamount');
    const fixed = matches('valuesource', '0', 'policyfixed');
    const entered = matches('valuesource', '1', 'requestenteredwithinlimits');
    return new Map([
      ['percentagevalue', percentage && fixed],
      ['maximumpercentage', percentage && entered],
      ['fixedamount', amount && fixed],
      ['maximumfixedamount', amount && entered],
      ['autocreaterefund', matches('applyon', '3', 'allfees')],
    ]);
  }

  if (policyType === 'refund') {
    const methods = read('allowedpayoutmethods');
    const bankRequired =
      !Array.isArray(methods) ||
      methods.some((method) => !['0', 'cash'].includes(String(method).toLowerCase()));
    return new Map([
      ['applicablefeeheadids', matches('feeheadscope', '1', 'selectedfeeheads')],
      ['defaultpayingbankaccountid', bankRequired],
    ]);
  }

  if (policyType === 'collection' && read('enablelatefee') !== false) {
    return new Map([
      ['graceperioddays', true],
      ['latefeetype', true],
      ['flatamount', matches('latefeetype', 'flat')],
      ['amountperday', matches('latefeetype', 'perday')],
      ['amountperweek', matches('latefeetype', 'perweek')],
      ['amountpermonth', matches('latefeetype', 'permonth')],
      ['escalationrules', matches('latefeetype', 'slab')],
      ['latefeeincomecategoryid', true],
    ]);
  }

  return undefined;
}

const formFieldKey = (key: string, policyType: string) =>
  policyType === 'proration' && key === 'feeheadrules' ? 'rules' : key;

function formValues(snapshot: Record<string, unknown>, policyType: string, fields: Set<string>) {
  const values = normalizedEntries(snapshot);
  const applicable = applicableFields(policyType, values);
  const visible = new Map<string, { field: string; value: unknown }>();

  for (const [rawKey, entry] of values) {
    const key = formFieldKey(rawKey, policyType);
    if (!GENERAL_FIELDS.has(key) && !fields.has(key) && !applicable?.get(key)) continue;

    let { value } = entry;
    if (Array.isArray(value)) {
      if (key === 'rules') value = value.filter(isRecord).map(prorationRule);
      else if (key === 'escalationrules') value = value.filter(isRecord).map(escalationSlab);
    }
    if (
      value == null ||
      (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && !value.length)
    )
      continue;

    visible.set(key, { field: key === 'rules' ? 'Rules' : entry.field, value });
  }

  return visible;
}

export function getPolicyFormHistory(version: PolicyVersion, policyType?: string) {
  const fields = policyType ? POLICY_FIELDS.get(policyType) : undefined;
  if (!policyType || !fields) return undefined;

  const before = formValues(
    version.snapshotBefore ??
      Object.fromEntries(version.changedFields.map(({ field, oldValue }) => [field, oldValue])),
    policyType,
    fields
  );
  const after = formValues(
    version.snapshotAfter ??
      Object.fromEntries(version.changedFields.map(({ field, newValue }) => [field, newValue])),
    policyType,
    fields
  );
  const comparisonKeys =
    version.snapshotBefore && version.snapshotAfter
      ? new Set([...before.keys(), ...after.keys()])
      : new Set(
          version.changedFields.map(({ field }) =>
            formFieldKey(normalizeFieldKey(field), policyType)
          )
        );

  const changedFields = [...comparisonKeys].flatMap((key) => {
    const previous = before.get(key);
    const current = after.get(key);
    const field = current?.field ?? previous?.field;
    const oldValue = previous?.value;
    const newValue = current?.value;
    return field && !policyVersionValuesEqual(field, oldValue, newValue)
      ? [{ field, oldValue, newValue }]
      : [];
  });

  return {
    changedFields,
    snapshotFields: version.snapshotAfter
      ? [...after.values()].map(({ field, value }) => [field, value] as const)
      : [],
  };
}
