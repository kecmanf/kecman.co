# Filip Kecman - Content Style Guide

## Who Filip Is
Filip Kecman is a penetration tester and security researcher based in Serbia. He runs The Free Security (thefreesecurity.com), a nonprofit that provides free pentesting to SMBs in the Balkans. He wants to be perceived as a strong, credible security expert - not a content marketer. His blog at kecman.co is his personal technical authority platform.

## Voice & Tone
- Professional but personal. Uses "I" naturally.
- Direct. No fluff, no throat-clearing intros.
- Technically credible. Shows depth, not just surface awareness.
- Not a marketer. Avoid anything that sounds like a press release or LinkedIn growth-hacking.
- Confident but not arrogant.
- Occasionally writes short, punchy sentences for impact. Then expands.

## Hard Rules
- NO em dashes (—). Use a regular hyphen with spaces ( - ) or restructure the sentence.
- No "In conclusion" or "In summary" sign-offs.
- No bullet-point-only posts. Always substantial prose.
- No hype words: "game-changer", "revolutionary", "exciting", "thrilled".
- No generic security awareness fluff. Everything must be technically specific.
- Always English only.

## Blog Post Structure
- File goes in: blog/[slug].html
- Slug: kebab-case, descriptive, SEO-friendly
- Length: 800-2000 words depending on topic depth
- Always ends with a soft CTA: invite readers to reach out on LinkedIn (https://www.linkedin.com/in/filip-kecman/) or via the contact form (../index.html#contact)
- Code blocks: use <pre><code>...</code></pre>
- Inline code: use <code>...</code>
- Headings: <h2> for main sections, <h3> for subsections
- Must update blog.html (add card at top of blog-grid div) and sitemap.xml after creating post
- Reading time: ~200 words per minute, round to nearest minute

## HTML Head Boilerplate
Copy exactly from blog/sensitive-data-in-urls.html. Update: title, description, canonical URL, og:url, og:title, og:description, article:published_time, article:tag entries, JSON-LD headline/datePublished/description/keywords, BreadcrumbList third item name.

## HTML Nav and Footer
Copy exactly from blog/sensitive-data-in-urls.html. Do not change.

## Blog Post Topics That Work Well
- Real vulnerability classes with technical depth (supply chain, auth bypass, info leakage)
- Pentest methodology (what real engagements look like)
- CVE breakdowns of high-profile vulnerabilities
- Developer security mistakes that pentesters exploit
- AI and security intersections
- Red team techniques explained
- Security tooling professionals actually use

## Topics to Avoid
- Generic "top 10 security tips" listicles
- Pure news summary with no original analysis
- Anything a non-technical person would write
- Anything already covered by every security blogger without a new angle

## blog.html Card Format
Add at the TOP of the blog-grid div:
```html
<a href="blog/[slug].html" class="blog-card reveal" data-tags="[tags]">
  <div class="blog-meta">
    <span class="blog-tag">[Category]</span>
    <span>[YYYY-MM-DD]</span>
    <span>[X] min read</span>
  </div>
  <h3>[Title]</h3>
  <p>[1-2 sentence preview. No em dashes.]</p>
  <span class="read-more">Read more <span class="arrow">&rarr;</span></span>
</a>
```
Valid data-tags: web-security, mobile-security, pentesting, api-security, tools, osint, career

## LinkedIn Post Format
Structure:
1. Hook (one sentence - shocking, specific, factual)
2. Re-hook (one sentence - confirms it is real, names the thing)
3. Three blank lines
4. 3-4 sentences: what happened, technical detail, the angle nobody covers
5. Final line: "Full post on kecman.co - link in the comments."

Rules:
- Max 200 words total
- No em dashes
- No bullet point lists in the body
- Mention a specific technical detail (CVE number, package name, version, technique name)
- End: link in the comments (never put actual URLs in the post body)
