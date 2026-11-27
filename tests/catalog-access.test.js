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
