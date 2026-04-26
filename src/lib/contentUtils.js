import DOMPurify from 'dompurify';

/**
 * Converts plain-text URLs into clickable anchor tags.
 * Handles http://, https://, and www. prefixed URLs.
 * Skips URLs already wrapped inside <a> tags.
 */
const linkifyHtml = (html) => {
  // Split on existing <a ...>...</a> tags so we never touch them
  const parts = html.split(/(<a\s[^>]*>[\s\S]*?<\/a>)/gi);

  return parts
    .map((part) => {
      // If the part is an existing anchor tag, leave it as-is
      if (/^<a\s/i.test(part)) return part;

      // Match http(s):// URLs and www. URLs
      return part.replace(
        /(?:(?:https?:\/\/)|(?:www\.))[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi,
        (url) => {
          const href = url.startsWith('www.') ? `https://${url}` : url;
          try {
            new URL(href); // validate
          } catch {
            return url; // not a valid URL, leave as-is
          }
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="content-link" style="color: #2563eb; text-decoration: underline;">${url}</a>`;
        }
      );
    })
    .join('');
};

export const normalizeContent = (content = '') => {
  let source = content;

  if (typeof source !== 'string') {
    source = '';
  }

  source = source.trim();
  if (!source) return '';

  const hasHtmlTag = /<\/?[a-z][\s\S]*?>/i.test(source);
  let html = source;

  if (!hasHtmlTag) {
    html = source
      .split(/\n{2,}/)
      .filter(block => block.trim())
      .map((block) => `<p>${block.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  // Convert plain-text URLs into clickable links
  html = linkifyHtml(html);

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel', 'class', 'src', 'alt', 'title', 'loading', 'decoding', 'style', 'width', 'height'],
    ALLOWED_TAGS: [
      'a', 'b', 'strong', 'i', 'em', 'p', 'br', 'ul', 'ol', 'li', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'figure', 'figcaption', 'div', 'span', 'pre', 'code'
    ],
    ALLOWED_STYLES: {
      '*': {
        'color': [/.*/],
        'text-decoration': [/.*/],
      }
    }
  });
};
