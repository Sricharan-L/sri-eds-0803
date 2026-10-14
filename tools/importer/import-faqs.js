/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroStackedParser from './parsers/hero-stacked.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-stacked': heroStackedParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'faqs',
  description: 'WKND FAQ page: stacked title + image hero, intro text, FAQ accordion, contact help sidebar',
  urls: [
    'https://wknd.site/us/en/faqs.html',
  ],
  blocks: [
    {
      name: 'hero-stacked',
      instances: ['.title.cmp-title--underline'],
    },
    {
      name: 'accordion-faq',
      instances: ['.accordion.panelcontainer .cmp-accordion'],
    },
  ],
  sections: [
    {
      id: '1',
      name: 'Hero',
      selector: ['.title.cmp-title--underline'],
      style: null,
      blocks: ['hero-stacked'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'Intro and FAQ list',
      selector: ['.text.aem-GridColumn--default--8'],
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: ['.text.aem-GridColumn--default--8 .cmp-text'],
    },
    {
      id: '3',
      name: 'Contact help (sidebar)',
      selector: ['.container.responsivegrid.aem-GridColumn--default--3'],
      style: null,
      blocks: [],
      defaultContent: [
        '.container.responsivegrid.aem-GridColumn--default--3 .cmp-title',
        '.container.responsivegrid.aem-GridColumn--default--3 .cmp-text',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

// Source path -> target document path overrides
const PATH_OVERRIDES = {
  '/us/en/faqs': '/faq',
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already detached by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section breaks
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in importer rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Template metadata scopes the WKND FAQ styles (styles/templates/faq.css) to this page
    const metaTable = [...main.querySelectorAll('table')].pop();
    if (metaTable) {
      const row = document.createElement('tr');
      ['template', 'faq'].forEach((text) => {
        const td = document.createElement('td');
        td.textContent = text;
        row.append(td);
      });
      (metaTable.querySelector('tbody') || metaTable).append(row);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Target path (root maps to /index; known source paths are remapped)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const targetPath = PATH_OVERRIDES[rawPath] || (rawPath === '' ? '/index' : rawPath);
    const path = WebImporter.FileUtils.sanitizePath(targetPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
