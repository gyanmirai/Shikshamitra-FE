export async function fetchBookDetails(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('The optional book lookup is unavailable.');
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  const text = (selector: string) => doc.querySelector(selector)?.textContent?.trim() || '';
  const title = text('h1');
  if (!title) throw new Error('The optional lookup did not return book details.');
  return {
    title,
    author: text("a[itemprop='author']"),
    publisher: text('[itemprop="publisher"]'),
    pages: text('[itemprop="numberOfPages"]'),
    isbn10: text('dd[itemprop="isbn"]'),
  };
}
