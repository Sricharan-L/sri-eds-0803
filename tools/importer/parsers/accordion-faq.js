/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd.site/us/en/faqs.html
 * Generated: 2026-10-14
 *
 * Instance: `.accordion.panelcontainer .cmp-accordion`
 * Items: `.cmp-accordion__item` (7 on source page, iterationSafe per digest)
 *   question: `.cmp-accordion__title` (inside button.cmp-accordion__button)
 *   answer:   `.cmp-accordion__panel .cmp-text` (panel is hidden via
 *             cmp-accordion__panel--hidden but content is in the DOM)
 *
 * Output (2 columns): one row per item -> [question | answer]
 * Empty headings/paragraphs (e.g. <h3>&nbsp;</h3>) are dropped; inline
 * formatting such as <b> is preserved.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .cmp-accordion__item')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-accordion__item')];

  const cells = [];

  items.forEach((item) => {
    // Question
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button')
      || item.querySelector('.cmp-accordion__header');
    const questionText = titleEl ? titleEl.textContent.trim() : '';

    // Answer
    const panel = item.querySelector('.cmp-accordion__panel');
    let answerRoot = null;
    if (panel) {
      const texts = [...panel.querySelectorAll('.cmp-text')];
      if (texts.length) {
        answerRoot = document.createElement('div');
        texts.forEach((t) => answerRoot.append(...t.childNodes));
      } else {
        answerRoot = panel;
      }
    }

    const answer = [];
    if (answerRoot) {
      // Drop empty block elements (e.g. <h3>&nbsp;</h3>, empty <p>)
      answerRoot.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
        const empty = !el.textContent.replace(/ /g, ' ').trim()
          && !el.querySelector('img, picture, video, iframe, a');
        if (empty) el.remove();
      });
      answer.push(...[...answerRoot.children]);
      if (!answer.length && answerRoot.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = answerRoot.textContent.trim();
        answer.push(p);
      }
    }

    if (!questionText && !answer.length) return;

    const question = document.createElement('p');
    question.textContent = questionText;
    cells.push([question, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
