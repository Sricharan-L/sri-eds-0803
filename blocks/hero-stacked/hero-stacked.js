import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero (stacked) block
 * Content model: row 1 = image, row 2 = title (H1, optional extra text).
 * Renders the title above a contained (non-full-bleed) image.
 * Authors may also put picture and heading in a single cell, or swap row order.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  // collect any non-image content (heading, paragraphs) for the title area
  const content = document.createElement('div');
  content.className = 'hero-stacked-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.children].forEach((child) => {
      const isImageOnly = child.tagName === 'PICTURE'
        || (child.querySelector('picture') && !child.textContent.trim());
      if (!isImageOnly) content.append(child);
    });
  });
  if (heading && !content.contains(heading)) content.prepend(heading);

  const media = document.createElement('div');
  media.className = 'hero-stacked-media';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '1600' },
        { width: '900' },
      ]);
      const optimizedImg = optimized.querySelector('img');
      if (optimizedImg) {
        optimizedImg.loading = 'eager';
        optimizedImg.setAttribute('fetchpriority', 'high');
        if (img.width) optimizedImg.width = img.width;
        if (img.height) optimizedImg.height = img.height;
      }
      media.append(optimized);
    } else {
      media.append(picture);
    }
  }

  block.replaceChildren();
  if (content.children.length) block.append(content);
  if (media.children.length) block.append(media);
}
