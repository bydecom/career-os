// ---------------------------------------------------------------------------
// Shared tokenizer for BM25 indexing and query normalization.
//
// Deliberately simple (lowercase, strip punctuation, split on whitespace).
// The Knowledge IR is technical prose (English + Vietnamese mixed), so no
// stemming/stopword removal — stemming would collapse meaningful acronyms
// (e.g. "AWS" vs "AW"), and stopwords carry little weight in short queries
// anyway since BM25's length normalization already discounts common terms.
// ---------------------------------------------------------------------------

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[[\]{}()`'"“”.,;:!?<>|/\\_*#~^=+]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}
