# Receipt lifecycle browser fixture

Runs the production Collection form, receipt list/preview and reconciliation screens with isolated synthetic API state. It never writes to the real backend. The original collection fixture supplies its allocation validation; this adapter supplies the receipt lifecycle responses. Actual domain, authorization, persistence, rollback and PDF behavior are verified separately through `ReceiptLifecycleApi_Tests` in the backend.

Run Vite with `--config e2e/fixtures/receipt-lifecycle/vite.config.mts`. The fixture uses port 5187. Exercise cash and UPI collection, provisional receipts, reconciliation approval/rejection, retained original documents, refreshed receipt list, and Cash visibility. PDF templates are generated and visually checked through the backend tests, not simulated by this fixture.

The `/pdf/Provisional-Receipt-Example.pdf` and `/pdf/Official-Receipt-Example.pdf` middleware serves the real HTTP-test exports from the wrapper workspace `output/pdf/receipt-lifecycle-e2e`. Generate them by setting `RECEIPT_E2E_PDF_DIRECTORY` when running `ReceiptLifecycleApi_Tests`. These are synthetic API examples, so their student, amount and receipt numbers differ from the independent browser scenario. The browser adapter supplies canonical download headers for its own synthetic receipt numbers. Verify actual document content and original/official links in the API export pair.

Receipt previews reuse the production shared canvas PDF viewer, which works without a native browser PDF plugin and includes page navigation, zoom, retry and accessible page text. The fixture exercises that same viewer and its worker. For static verification, build with Vite and run Vite preview against the generated output on port 5187.
