import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://ideasopen.in';
const SITE_NAME = 'IdeasOpen';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function Seo({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags = [],
}) {
  const pageUrl = url || SITE_URL;
  const pageImage = image || DEFAULT_IMAGE;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: title,
    description,
    url: pageUrl,
    image: [pageImage],
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  };

  if (type === 'article' && publishedTime) {
    jsonLd.datePublished = publishedTime;
    if (modifiedTime) jsonLd.dateModified = modifiedTime;
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={tags.join(', ')} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
