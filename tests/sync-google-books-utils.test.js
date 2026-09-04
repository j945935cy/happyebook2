const test = require("node:test");
const assert = require("node:assert/strict");
const {
  categoriesForTitle,
  cleanDescription,
  isPublishableRow,
  languageForBook,
  newBookLaunchRanks,
  storeStatusForRow,
  titleParts,
} = require("../scripts/sync-google-books-utils");

test("uses explicit display title and subtitle from a manifest row", () => {
  assert.deepEqual(
    titleParts({
      title: "消防設備士 壹：消防法規速記手冊: 消防法規概要",
      displayTitle: "消防設備士 壹：消防法規速記手冊",
      subtitle: "消防法規概要",
    }),
    { title: "消防設備士 壹：消防法規速記手冊", subtitle: "消防法規概要" },
  );
});

test("splits legacy full-width title separators", () => {
  assert.deepEqual(titleParts({ title: "主書名：副標題" }), { title: "主書名", subtitle: "副標題" });
});

test("falls back to a standard subtitle when no separator exists", () => {
  assert.deepEqual(titleParts({ title: "消防法規題庫解析冊" }), {
    title: "消防法規題庫解析冊",
    subtitle: "Google Play Books 電子書",
  });
});

test("classifies exam, workplace safety, and fire-safety books", () => {
  assert.deepEqual(categoriesForTitle("乙安 932 題全解"), ["職業安全衛生", "考試準備"]);
  assert.deepEqual(categoriesForTitle("消防設備士 火災學"), ["消防安全", "考試準備"]);
});

test("classifies data and AI development books without generic categories", () => {
  assert.deepEqual(categoriesForTitle("API 資料契約實戰"), ["程式設計", "資料工程"]);
  assert.deepEqual(categoriesForTitle("OpenCode 團隊作戰"), ["AI Coding", "AI 學習"]);
});

test("allocates stable ranks before all existing ranked books", () => {
  assert.deepEqual(newBookLaunchRanks([{ launchRank: 1 }, { launchRank: 7 }, {}], 3), [-3, -2, -1]);
  assert.deepEqual(newBookLaunchRanks([], 2), [-2, -1]);
});

test("keeps live and preorder rows while excluding needs-action rows", () => {
  assert.equal(isPublishableRow({ status: "在 Google Play 開始販售", googleBooksId: "a" }), true);
  assert.equal(isPublishableRow({ status: "在 Google Play 上預購", googleBooksId: "b" }), true);
  assert.equal(isPublishableRow({ status: "需要處理", googleBooksId: "c" }), false);
  assert.equal(storeStatusForRow({ status: "在 Google Play 上預購" }), "preorder");
  assert.equal(storeStatusForRow({ status: "在 Google Play 開始販售" }), "available");
});

test("removes duplicated storefront text and category residue from descriptions", () => {
  const sentence = "官方題庫分流攻略，會的快答，不會的講通。";
  assert.equal(cleanDescription(`${sentence} ${sentence} Foreign language & study aids`), sentence);
});

test("uses explicit page language and defaults to Traditional Chinese", () => {
  assert.equal(languageForBook({ language: "en" }), "en");
  assert.equal(languageForBook({ title: "中文書" }), "zh-TW");
});
