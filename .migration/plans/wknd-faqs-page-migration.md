# WKND FAQs Page Migration Plan

> **▶️ To start the migration, click the "Execute Plan" button under the chat input box.** Typing "execute the plan" as a message won't start it, because the chat is still in Plan mode and that mode only lets me update the plan. Another option is to switch the **Quick / Plan** toggle (also under the chat input) to **Quick** and send "execute the plan" again. Either way, work starts with the first checklist item.

**Source page:** https://wknd.site/us/en/faqs.html
**Target page:** **FAQ** at **`/faq`**, a top-level page next to the homepage (alongside the existing About Us pages)
**Project:** AEM Edge Delivery project `sri-eds-0803`
**Page type:** Standard content page. The commerce and forms tools aren't needed because the page has no products, listings or forms.

## Page Overview (from a first look at the source)

| Area | What's there | Likely EDS mapping |
|---|---|---|
| Hero | Full-width photo of a hiker on a mountain peak | `hero` block (already in the project) |
| Intro | One paragraph about the WKND community | Default content |
| FAQ list | 7 question/answer pairs: audience, funding, contributors, update frequency, founding, the hot dog question, company status | New `accordion` block (not in the project yet) |
| Contact CTA | "We love to talk adventures!" with phone and email | Default content, or `columns` if it's laid out side by side |
| Header / Footer | Language selector, logo, nav, search; footer links, social icons, Adobe disclaimer | Left out of this page migration, can be done separately (see below) |

Blocks already in the project: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget`.
Pages already in the project: homepage, `/about-us`, `/about-us/history`.

## Approach

1. **Analyze the page.** Scrape the source, take screenshots, clean the HTML and pin down the sections and block variants.
2. **Map blocks.** Reuse `hero` (and `columns` if it fits). Add an `accordion` variant for the FAQ list.
3. **Generate blocks.** Build the `accordion` block (one question/answer pair per row, open and close by keyboard and mouse) and adjust `hero` if needed.
4. **Build import tools.** Create the block parsers and page transformers. Point the output path to `/faq` instead of the source's `/us/en/faqs`, then bundle the import script.
5. **Import content.** Run the bulk import for this one URL to produce the `/faq` page and its images.
6. **Match the design.** Copy the WKND fonts, colors and spacing for the hero, accordion and contact area.
7. **Check the result.** Compare the `/faq` preview with the original side by side and fix any differences.

## Checklist

- [ ] Confirm the project setup (document-based project, block library source)
- [ ] Scrape and analyze https://wknd.site/us/en/faqs.html (screenshots, cleaned HTML, metadata)
- [ ] Identify the sections: hero, intro, FAQ list, contact CTA
- [ ] Decide what's default content and what's a block, and name the block variants
- [ ] Add block mappings (DOM selectors) to the page template
- [ ] Reuse or adjust the `hero` block for the mountain hero image
- [ ] Create the new `accordion` block for the 7 FAQ items (accessible, mobile-first)
- [ ] Check whether the contact CTA should be default content or `columns`
- [ ] Generate import parsers for `hero`, `accordion` and any others
- [ ] Generate page transformers (remove header, footer, language selector and other non-content parts; split sections; set metadata with page title **"FAQ"**)
- [ ] Set the import output path so `/us/en/faqs.html` becomes **`/faq`**
- [ ] Bundle the import script and run the import for the FAQs URL
- [ ] Check that the `/faq` page exists and includes all 7 Q&As, the intro, the contact details and the hero image
- [ ] Migrate the styling (typography, colors, spacing) for the hero, accordion and CTA
- [ ] Visually compare the `/faq` preview with the original page and fix differences
- [ ] Run lint (`npm run lint`) on the new or changed block code
- [ ] Summarize the results and suggest next steps

## Out of Scope (can be added later)

- Header/navigation migration, including the language selector, mega-nav and search
- Adding the FAQ link to the site navigation
- Footer migration (links, social icons, disclaimer)
- Other WKND pages (Magazine, Adventures, About Us) or a full-site catalog
- Publishing to Document Authoring or pushing code to git (only if you ask for it)

## Notes

- The plan is ready and includes the `/faq` location. Nothing has been changed yet.
- Only the main page content is migrated, and the site's existing header and footer stay as they are.
