/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-stacked. Base: hero.
 * Source: https://wknd.site/us/en/faqs.html
 * Generated: 2026-10-14
 *
 * Instance anchor: `.title.cmp-title--underline` (contains h1.cmp-title__text).
 * The hero image lives in the following sibling `.image` grid column
 * (img.cmp-image__image). That sibling is pulled into the block and removed
 * from the DOM so the image is not duplicated as default content.
 *
 * Output (1 column):
 *   row 1: [image]
 *   row 2: [heading]
 */
export default function parse(element, { document }) {
  // Heading: validated h1.cmp-title__text; fallbacks for other heading levels
  const heading = element.querySelector('h1.cmp-title__text')
    || element.querySelector('.cmp-title__text')
    || element.querySelector('h1, h2, h3');

  // Locate the sibling image column (next element sibling with class "image"),
  // skipping over any non-image siblings only if they are empty.
  let imageWrapper = null;
  let sib = element.nextElementSibling;
  while (sib) {
    if (sib.classList.contains('image') || sib.querySelector(':scope > .cmp-image')) {
      imageWrapper = sib;
      break;
    }
    if (sib.textContent.trim() || sib.querySelector('img')) break;
    sib = sib.nextElementSibling;
  }

  // Fallback: image inside the element itself
  const imageScope = imageWrapper || element;
  const image = imageScope.querySelector('img.cmp-image__image')
    || imageScope.querySelector('.cmp-image img')
    || (imageWrapper ? imageWrapper.querySelector('img') : null);

  if (!heading && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);
  if (heading) cells.push([heading]);

  // Remove the sibling image column so it is not duplicated
  if (imageWrapper) imageWrapper.remove();

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-stacked', cells });
  element.replaceWith(block);
}
