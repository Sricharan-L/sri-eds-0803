/*
 * Accordion (FAQ) block
 * Based on https://www.aem.live/developer/block-collection/accordion
 * Content model: one row per item, [question | answer].
 * Uses native <details>/<summary>: collapsed by default, keyboard operable,
 * and announced as expandable by assistive technology.
 */

/**
 * Removes empty elements (e.g. <h3>&nbsp;</h3>) left over by authors/import.
 * @param {Element} el Container to clean
 */
function removeEmptyElements(el) {
  el.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((child) => {
    const empty = !child.textContent.trim()
      && !child.querySelector('img, picture, video, iframe');
    if (empty) child.remove();
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, ...rest] = [...row.children];
    if (!label) {
      row.remove();
      return;
    }

    // question
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const labelText = document.createElement('span');
    labelText.className = 'accordion-faq-item-title';
    // unwrap a single paragraph/heading so the summary holds inline content only
    const only = label.children.length === 1 ? label.firstElementChild : null;
    const source = only && /^(P|H[1-6])$/.test(only.tagName) ? only : label;
    labelText.append(...source.childNodes);
    summary.append(labelText);

    // answer (all remaining cells are treated as answer content)
    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));
    removeEmptyElements(body);

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
