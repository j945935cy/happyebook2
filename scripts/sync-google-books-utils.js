function splitLegacyTitle(fullTitle) {
  const volumeSplit = fullTitle.match(/^(.*?（Vol\.\d+）)：(.+)$/);
  if (volumeSplit) return { title: volumeSplit[1], subtitle: volumeSplit[2] };
  const index = fullTitle.indexOf("：");
  if (index < 0) return { title: fullTitle, subtitle: "Google Play Books 電子書" };
  return { title: fullTitle.slice(0, index), subtitle: fullTitle.slice(index + 1) };
}

function titleParts(row) {
  if (String(row.displayTitle || "").trim()) {
    return {
      title: String(row.displayTitle).trim(),
      subtitle: String(row.subtitle || "Google Play Books 電子書").trim(),
    };
  }
  return splitLegacyTitle(String(row.title || "").trim());
}

function categoriesForTitle(title) {
  if (/乙安|職業安全衛生/.test(title)) return ["職業安全衛生", "考試準備"];
  if (/消防/.test(title)) return ["消防安全", "考試準備"];
  if (/API|資料格式|資料處理|資料契約|JSON|CSV|OpenAPI|Schema|Protobuf|Parquet/i.test(title)) {
    return ["程式設計", "資料工程"];
  }
  if (/OpenCode|Pi Coding|程式開發代理|Coding Agents?|Hermes Agent|Herdr|AI Agent|Smart AI Agents?/i.test(title)) {
    return ["AI Coding", "AI 學習"];
  }
  if (/網頁開發|網站上線|Web Development/i.test(title)) return ["網頁開發", "AI Coding"];
  const result = [];
  if (/iPAS/i.test(title)) result.push("iPAS AI", "證照考試");
  if (/資安|安全|Security/i.test(title)) result.push("資安");
  if (/英文|English|Romeo|Shrew|文法|伊索/i.test(title)) result.push("英文學習");
  if (/AI|LLM|RAG|MCP|Codex|Agent|ChatGPT/i.test(title)) result.push("AI 學習");
  if (/Codex|Coding|SQL|RAG|MCP|Agent/i.test(title)) result.push("AI Coding");
  const unique = [...new Set(result)].slice(0, 4);
  return unique.length ? unique : ["電子書"];
}

function newBookLaunchRanks(books, count) {
  const ranked = books.map((book) => Number(book.launchRank)).filter((rank) => Number.isFinite(rank) && rank !== 0);
  const minimum = ranked.length ? Math.min(...ranked) : 0;
  const upperBound = Math.min(minimum - 1, -1);
  const firstRank = upperBound - count + 1;
  return Array.from({ length: count }, (_, index) => firstRank + index);
}

const publishableStatuses = new Set(["在 Google Play 開始販售", "在 Google Play 上預購"]);

function isPublishableRow(row) {
  return publishableStatuses.has(row.status) && Boolean(row.googleBooksId);
}

function storeStatusForRow(row) {
  return row.status === "在 Google Play 上預購" ? "preorder" : "available";
}

function cleanDescription(value) {
  let description = String(value || "").replace(/\s+/g, " ").trim();
  const residue = /\s*(?:Foreign language & study aids|Technology & Engineering|Business & Economics|Computers|Happy eBook Authors|Happy eBook)\s*$/i;
  while (residue.test(description)) description = description.replace(residue, "").trim();
  if (description.length >= 40) {
    const probe = description.slice(0, Math.min(24, Math.floor(description.length / 2)));
    const duplicateIndex = description.indexOf(probe, probe.length);
    if (duplicateIndex > 0) description = description.slice(0, duplicateIndex).trim();
  }
  return description.replace(/\s*(?:\.\.\.|…)\s*$/, "").trim();
}

function languageForBook(book) {
  return book.language === "en" ? "en" : "zh-TW";
}

module.exports = {
  categoriesForTitle,
  cleanDescription,
  isPublishableRow,
  languageForBook,
  newBookLaunchRanks,
  splitLegacyTitle,
  storeStatusForRow,
  titleParts,
};
