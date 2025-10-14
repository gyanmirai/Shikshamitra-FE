// @ts-nocheck

export async function fetchBookDetails(url: string) {
  const response = await fetch(url);
  const htmlString = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Extract book details
  const title = doc.querySelector('h1')?.innerText.trim() || '';

  const author = doc.querySelector("a[itemprop='author']")?.innerText.trim() || '';
  const description = doc.querySelector('div.work-description')?.innerText.trim() || '';

  const publishDate = doc.querySelector('[itemprop="datePublished"]')?.innerText.trim();
  const publisher = doc.querySelector('[itemprop="publisher"]')?.innerText.trim();

  const pages = doc.querySelector('[itemprop="numberOfPages"]')?.innerText.trim();
  const language = doc.querySelector('[itemprop="inLanguage"]')?.innerText.trim();
  const isbn10 = doc.querySelector('dd[itemprop="isbn"]')?.innerText.trim();

  //   const isbn13 =
  //     doc
  //       .querySelector("div#details div:contains('ISBN 13')")
  //       ?.nextElementSibling?.innerText.trim() || '';
  const coverImage = doc.querySelector('img.cover')?.src || '';
  console.log('coverImage---', coverImage);
  // Collect subjects
  const subjects =
    Array.from(doc.querySelectorAll('a.subject'))?.map((s) => s.innerText.trim()) || [];

  // Create JSON
  const bookJson = {
    title,
    author,
    description,
    language,
    publishDate,
    publisher,
    pages,
    isbn10,
    // isbn13,
    coverImage,
    subjects,
  };
  return bookJson;
}
