// Lighthouse CI: speed / accessibility / SEO check on the built site (run by .github/workflows/check.yml).
// Thresholds are a floor, not a target: they catch a page getting much slower or losing alt text,
// headings or meta tags. Performance varies run to run on CI machines, so it fails only below 0.6;
// the job summary lists every score so a slow drift is visible before that.
const fs = require('node:fs');
const article = (fs.readdirSync('dist/review', { withFileTypes: true }).find((d) => d.isDirectory() && fs.readdirSync(`dist/review/${d.name}`).length) || {}).name;
const firstArticle = article ? `/review/${article}/${fs.readdirSync(`dist/review/${article}`)[0]}/` : null;
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/restaurants/', '/destinations/', '/glasses-off-awards/', firstArticle].filter(Boolean).map((p) => `http://localhost${p}`),
      numberOfRuns: 1,
      settings: { skipAudits: ['uses-http2'], chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};
