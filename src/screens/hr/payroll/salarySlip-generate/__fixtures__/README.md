# Stored PDF logical text fixture

`tagged-gujarati.pdf` is a synthetic, two-page regression document, not an issued employee payslip.
It was generated with QuestPDF 2026.9.1 and an embedded Noto Sans Gujarati font.
The authored Gujarati strings are recorded in standard tagged text spans.
PDF.js 5.6.205 exposes those span values through the stored document structure tree.
Ordinary glyph extraction still contains NUL mappings and reordered vowels, which the regression reproduces before testing logical extraction.
The fixture tests reader behavior only and does not certify the product generator, PDF/UA conformance, wage-slip legality or browser acceptance.

The document SHA256 is `825C561C6DC8951DCF284BC398A80F3D6B91EF62845A410B9F38DB01901D87A7`.
The font source is [Google Fonts Noto Sans Gujarati](https://github.com/google/fonts/tree/main/ofl/notosansgujarati).
The font SHA256 is `9901D8552F1DD5D2C50DBD4CAA6F6E174E74E8264F06594AB259AE6E7B1AC428`.
The font uses the SIL Open Font License 1.1.
Its license permits document embedding without applying the font license to the resulting document.
