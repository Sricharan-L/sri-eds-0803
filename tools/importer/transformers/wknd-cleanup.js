/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://wknd.site/us/en/faqs.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const CONTACT_PHONE = '1-800-800-0000';
const CONTACT_TEL = 'tel:18008000000';
const CONTACT_MAILTO = 'mailto:info@wknd.com';
const CONTACT_EMAIL = 'info@wknd.com';
const PAGE_TITLE = 'FAQ';

function setPageTitle(doc) {
  if (!doc) return;
  doc.title = PAGE_TITLE;
  const head = doc.head || doc.querySelector('head');
  if (!head) return;
  ['og:title', 'twitter:title'].forEach((prop) => {
    const meta = head.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
    if (meta) meta.setAttribute('content', PAGE_TITLE);
  });
}

// Contact sidebar (cleaned.html line ~331): <div class="text cmp-text--font-small"><div class="cmp-text"><p>
//   Give us a call at <a href="#">1-800-800-0000</a>.<br> E-mail us at info<a href="#">@wknd.com</a><br> We love to talk adventures!</p>
function fixContactLinks(element) {
  const links = element.querySelectorAll('.text.cmp-text--font-small .cmp-text a[href="#"]');
  links.forEach((a) => {
    const text = a.textContent.trim();
    if (text === CONTACT_PHONE) {
      a.setAttribute('href', CONTACT_TEL);
    } else if (text === '@wknd.com' || text === CONTACT_EMAIL) {
      a.setAttribute('href', CONTACT_MAILTO);
      // Merge the dangling "info" text node into the link so the address is a single link.
      const prev = a.previousSibling;
      if (prev && prev.nodeType === 3 && /info$/.test(prev.textContent)) {
        prev.textContent = prev.textContent.replace(/info$/, '');
        a.textContent = CONTACT_EMAIL;
      }
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Contact sidebar placeholder links -> real tel:/mailto:
    fixContactLinks(element);

    // Hidden decorative separator above "Need more help?" (div.separator.cmp-separator--hidden)
    // Removed early so its <hr> is never mistaken for a section break.
    WebImporter.DOMUtils.remove(element, ['.separator.cmp-separator--hidden']);

    // Page title metadata
    const doc = (payload && payload.document) || element.ownerDocument;
    setPageTitle(doc);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Global header XF (header.experiencefragment.cmp-experiencefragment--header)
      'header.experiencefragment',
      '.cmp-experiencefragment--header',
      // Global footer XF (footer.experiencefragment.cmp-experiencefragment--footer)
      'footer.experiencefragment',
      '.cmp-experiencefragment--footer',
      // Language switcher (inside header)
      '.languagenavigation',
      // Mobile nav + toggle (body-level)
      '#mobileNav',
      '#toggleNav',
      // Adobe ID syncing iframe (#destination_publishing_iframe_wkndsite_0) and any other iframes
      'iframe',
      // Tracking pixels (1x1 images / demdex beacons)
      'img[width="1"][height="1"]',
      'img[src*="demdex.net"]',
      'noscript',
      'link',
    ]);

    // Re-apply the title in case anything reset it
    const doc = (payload && payload.document) || element.ownerDocument;
    setPageTitle(doc);
  }
}
