/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
  });

  // tools/importer/parsers/hero-stacked.js
  function parse(element, { document: document2 }) {
    const heading = element.querySelector("h1.cmp-title__text") || element.querySelector(".cmp-title__text") || element.querySelector("h1, h2, h3");
    let imageWrapper = null;
    let sib = element.nextElementSibling;
    while (sib) {
      if (sib.classList.contains("image") || sib.querySelector(":scope > .cmp-image")) {
        imageWrapper = sib;
        break;
      }
      if (sib.textContent.trim() || sib.querySelector("img")) break;
      sib = sib.nextElementSibling;
    }
    const imageScope = imageWrapper || element;
    const image = imageScope.querySelector("img.cmp-image__image") || imageScope.querySelector(".cmp-image img") || (imageWrapper ? imageWrapper.querySelector("img") : null);
    if (!heading && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    if (heading) cells.push([heading]);
    if (imageWrapper) imageWrapper.remove();
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-stacked", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .cmp-accordion__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-accordion__item")];
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button") || item.querySelector(".cmp-accordion__header");
      const questionText = titleEl ? titleEl.textContent.trim() : "";
      const panel = item.querySelector(".cmp-accordion__panel");
      let answerRoot = null;
      if (panel) {
        const texts = [...panel.querySelectorAll(".cmp-text")];
        if (texts.length) {
          answerRoot = document2.createElement("div");
          texts.forEach((t) => answerRoot.append(...t.childNodes));
        } else {
          answerRoot = panel;
        }
      }
      const answer = [];
      if (answerRoot) {
        answerRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
          const empty = !el.textContent.replace(/ /g, " ").trim() && !el.querySelector("img, picture, video, iframe, a");
          if (empty) el.remove();
        });
        answer.push(...[...answerRoot.children]);
        if (!answer.length && answerRoot.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = answerRoot.textContent.trim();
          answer.push(p);
        }
      }
      if (!questionText && !answer.length) return;
      const question = document2.createElement("p");
      question.textContent = questionText;
      cells.push([question, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var CONTACT_PHONE = "1-800-800-0000";
  var CONTACT_TEL = "tel:18008000000";
  var CONTACT_MAILTO = "mailto:info@wknd.com";
  var CONTACT_EMAIL = "info@wknd.com";
  var PAGE_TITLE = "FAQ";
  function setPageTitle(doc) {
    if (!doc) return;
    doc.title = PAGE_TITLE;
    const head = doc.head || doc.querySelector("head");
    if (!head) return;
    ["og:title", "twitter:title"].forEach((prop) => {
      const meta = head.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
      if (meta) meta.setAttribute("content", PAGE_TITLE);
    });
  }
  function fixContactLinks(element) {
    const links = element.querySelectorAll('.text.cmp-text--font-small .cmp-text a[href="#"]');
    links.forEach((a) => {
      const text = a.textContent.trim();
      if (text === CONTACT_PHONE) {
        a.setAttribute("href", CONTACT_TEL);
      } else if (text === "@wknd.com" || text === CONTACT_EMAIL) {
        a.setAttribute("href", CONTACT_MAILTO);
        const prev = a.previousSibling;
        if (prev && prev.nodeType === 3 && /info$/.test(prev.textContent)) {
          prev.textContent = prev.textContent.replace(/info$/, "");
          a.textContent = CONTACT_EMAIL;
        }
      }
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      fixContactLinks(element);
      WebImporter.DOMUtils.remove(element, [".separator.cmp-separator--hidden"]);
      const doc = payload && payload.document || element.ownerDocument;
      setPageTitle(doc);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Global header XF (header.experiencefragment.cmp-experiencefragment--header)
        "header.experiencefragment",
        ".cmp-experiencefragment--header",
        // Global footer XF (footer.experiencefragment.cmp-experiencefragment--footer)
        "footer.experiencefragment",
        ".cmp-experiencefragment--footer",
        // Language switcher (inside header)
        ".languagenavigation",
        // Mobile nav + toggle (body-level)
        "#mobileNav",
        "#toggleNav",
        // Adobe ID syncing iframe (#destination_publishing_iframe_wkndsite_0) and any other iframes
        "iframe",
        // Tracking pixels (1x1 images / demdex beacons)
        'img[width="1"][height="1"]',
        'img[src*="demdex.net"]',
        "noscript",
        "link"
      ]);
      const doc = payload && payload.document || element.ownerDocument;
      setPageTitle(doc);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-faqs.js
  var parsers = {
    "hero-stacked": parse,
    "accordion-faq": parse2
  };
  var PAGE_TEMPLATE = {
    name: "faqs",
    description: "WKND FAQ page: stacked title + image hero, intro text, FAQ accordion, contact help sidebar",
    urls: [
      "https://wknd.site/us/en/faqs.html"
    ],
    blocks: [
      {
        name: "hero-stacked",
        instances: [".title.cmp-title--underline"]
      },
      {
        name: "accordion-faq",
        instances: [".accordion.panelcontainer .cmp-accordion"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "Hero",
        selector: [".title.cmp-title--underline"],
        style: null,
        blocks: ["hero-stacked"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Intro and FAQ list",
        selector: [".text.aem-GridColumn--default--8"],
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: [".text.aem-GridColumn--default--8 .cmp-text"]
      },
      {
        id: "3",
        name: "Contact help (sidebar)",
        selector: [".container.responsivegrid.aem-GridColumn--default--3"],
        style: null,
        blocks: [],
        defaultContent: [
          ".container.responsivegrid.aem-GridColumn--default--3 .cmp-title",
          ".container.responsivegrid.aem-GridColumn--default--3 .cmp-text"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var PATH_OVERRIDES = {
    "/us/en/faqs": "/faq"
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_faqs_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      const metaTable = [...main.querySelectorAll("table")].pop();
      if (metaTable) {
        const row = document2.createElement("tr");
        ["template", "faq"].forEach((text) => {
          const td = document2.createElement("td");
          td.textContent = text;
          row.append(td);
        });
        (metaTable.querySelector("tbody") || metaTable).append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const targetPath = PATH_OVERRIDES[rawPath] || (rawPath === "" ? "/index" : rawPath);
      const path = WebImporter.FileUtils.sanitizePath(targetPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_faqs_exports);
})();
