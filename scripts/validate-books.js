const { printReport, validateBooks } = require("./site-utils");

const result = validateBooks();
printReport("Happy eBook book data validation", result);

if (result.errors.length) {
  process.exit(1);
}

console.log("\nPASS: book data, covers, and static book pages are consistent.");
