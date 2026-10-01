# Fee refunds workspace

The Fees → Refunds worklist shows Pending, Approved, Processed, Rejected, and Failed tabs. Search, academic/class/division filters, and pagination are server driven. Each row shows only the actions returned by the API for the signed-in user.

The request form previews the refundable amount, then uses one **Submit refund request** action. The server recalculates on submission. A Failed request can open a linked replacement form with the source allocations filled in; staff must choose and review payment details again.

Approved refunds first show **Record payment**. After recording, they show **Confirm outcome**. An uncertain bank, UPI, cheque, or demand draft result remains Approved and says **Awaiting verification**. Cash uses the same steps with one staff-entered signed handover receipt or document reference; the system generates its unique transaction reference. Confirm paid moves the request to Processed; Mark failed moves it to Failed. A confirmed non-cash return is recorded from the Processed row.

Historical statuses remain readable through existing refund detail and API responses. The old processing route is not used for new requests.

The detail view shows the net refund subledger amount and a balance check against the request, refund lines, and due fees. Confirmation creates a source-linked refund subledger entry; a late return creates a compensating entry. These entries are not General Accounts journal postings.
