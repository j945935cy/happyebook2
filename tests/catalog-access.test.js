const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const books = JSON.parse(fs.readFileSync(path.join(root, 'src/books.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'src/script.js'), 'utf8').replace(/boot\(\);\s*$/, '');
const context = vm.createContext({ URL, Intl, console, document: { currentScript: { src: 'https://happyebook.com/src/script.js' } }, window: { location: { pathname: '/', href: 'https://happyebook.com/' } } });
vm.runInContext(source, context);
test('unverified, placeholder, changed and unpublished purchase entries cannot render', () => {
  const verified = books[0];
  for (const book of [
    {...verified, purchaseVerification: undefined},
    {...verified, koboUrl: '#', buyUrl: '#'},
    {...verified, koboUrl: 'https://www.kobo.com/tw/zh/ebook/another-product'},
    {...verified, published: false},
    {...verified, koboUrl: 'https://www.kobo.com.evil.test/tw/zh/ebook/book'},
  ]) {
    context.book = book;
    assert.equal(vm.runInContext('isPublished(book)', context), false);
    assert.equal(vm.runInContext('createBookCard(book) + createMiniBookCard(book)', context), '');
  }
});
test('the loader excludes unverified records before search, counts or recommendations', async () => {
  context.fetch = async () => ({ok: true, json: async () => [books[0], {...books[0], id: 'invalid', koboUrl: '#'}]});
  const loaded = await vm.runInContext('loadBooks()', context);
  assert.deepEqual(Array.from(loaded, b => b.id), [books[0].id]);
});
test('retired book pages are not indexed and contain no product listings', () => {
  const ids = new Set(books.map(b => b.id));
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const name of fs.readdirSync(path.join(root, 'books'))) {
    if (!name.endsWith('.html') || ids.has(name.slice(0, -5))) continue;
    const html = fs.readFileSync(path.join(root, 'books', name), 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, follow">/, name);
    assert.doesNotMatch(html, /book-detail|book-card|"@type"\s*:\s*"Book"/, name);
    assert.ok(!sitemap.includes(`/books/${name}</loc>`), name);
  }
});
test('learning resources have a separate entry and never enter the public book catalog', () => {
  assert.ok(books.every(b => b.type === 'paid'));
  const resources = fs.readFileSync(path.join(root, 'resources/learning-materials.html'), 'utf8');
  assert.match(resources, /Python for Beginners/);
  assert.match(resources, /前往學習網站/);
  const catalog = fs.readFileSync(path.join(root, 'books.html'), 'utf8');
  assert.match(catalog, /resources\/learning-materials.html/);
  assert.doesNotMatch(catalog, /data-type-filter="(?:free|web|catalog)"/);
});
test('all catalog cards and hero cards render without Google store links or false preview labels', () => {
  for (const book of books) {
    context.book = book;
    const rendered = vm.runInContext('createBookCard(book) + createMiniBookCard(book, false)', context);
    assert.doesNotMatch(rendered, /https?:\/\/(?:play\.google\.com|books\.google\.)/i, book.id);
    if (book.type === 'catalog') {
      assert.doesNotMatch(rendered, />提供試閱版<|>付費購買</, book.id);
      assert.match(rendered, /作品介紹/, book.id);
      assert.equal(Boolean(book.readUrl || book.downloadUrl || book.buyUrl || book.koboUrl), false, book.id);
    }
    if (book.koboUrl) assert.ok(rendered.includes(book.koboUrl), book.id);
  }
});
test('public HTML and data contain no retired Google URLs', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      if (['.git','scratch','node_modules','tests'].includes(entry.name)) continue;
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(html|json)$/.test(p)) assert.doesNotMatch(fs.readFileSync(p,'utf8'), /https?:\/\/(?:play\.google\.com|books\.google\.)/i, p);
    }
  }
  walk(root);
});
test('retired import entry points fail without modifying the catalog', () => {
  const before = fs.readFileSync(path.join(root,'src/books.json'));
  for (const name of ['publish-google-account-books.js','sync-google-account-books.js','sync-eligible-google-books.js','refresh-partner-covers.js']) {
    const result = spawnSync(process.execPath, [path.join(root,'scripts',name), 'unused.json']);
    assert.equal(result.status, 1);
  }
  assert.deepEqual(fs.readFileSync(path.join(root,'src/books.json')), before);
});
