const fs = require('fs');
const report = JSON.parse(fs.readFileSync('validation-report.json', 'utf-8'));

// Get all unique failing references
const failures = [];
report.books.forEach(book => {
  book.chapters.forEach(ch => {
    if (!ch.success) {
      const emptyVerses = ch.qualityIssues
        .filter(i => i.message.includes('Empty text'))
        .map(i => i.message.match(/Verse (\d+)/)?.[1])
        .filter(Boolean);
      failures.push({
        ref: ch.reference,
        emptyVerses: emptyVerses.slice(0, 5).join(', ') + (emptyVerses.length > 5 ? '...' : ''),
        count: emptyVerses.length
      });
    }
  });
});

console.log('=== All 23 Failing Chapters ===\n');
failures.forEach(f => {
  console.log(`${f.ref}: ${f.count} empty verses (${f.emptyVerses})`);
});

console.log('\n=== Analysis ===');
const genealogy = failures.filter(f =>
  f.ref.includes('Numbers') || f.ref.includes('Ezra') ||
  f.ref.includes('Nehemiah') || f.ref.includes('Chronicles'));
const textualVariant = failures.filter(f =>
  f.ref.includes('Matthew') || f.ref.includes('Mark') ||
  f.ref.includes('Luke') || f.ref.includes('John') ||
  f.ref.includes('Acts') || f.ref.includes('Romans') ||
  f.ref.includes('Revelation'));

console.log('Genealogy/Census chapters:', genealogy.length);
console.log('NT Textual variant chapters:', textualVariant.length);

// Known NLT omitted verses (textual variants)
const knownOmitted = [
  'Matthew 17:21', 'Matthew 18:11', 'Matthew 23:14',
  'Mark 7:16', 'Mark 9:44', 'Mark 9:46', 'Mark 11:26', 'Mark 15:28',
  'Luke 17:36', 'Luke 23:17',
  'John 5:4',
  'Acts 8:37', 'Acts 15:34', 'Acts 24:7', 'Acts 28:29',
  'Romans 16:24',
  'Revelation 21' // Has verse numbering differences
];

console.log('\nThese verses are INTENTIONALLY omitted in NLT (textual variants from later manuscripts)');
