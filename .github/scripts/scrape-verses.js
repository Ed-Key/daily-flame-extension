const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function scrapeVerses() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to YouVersion partner support page
    console.log('Navigating to YouVersion partner support page...');
    await page.goto('https://partner-support.youversion.com/l/en/article/2z6brl1tus-verse-of-the-day-calendar', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the page to load and find the Airtable link
    await page.waitForSelector('a[href*="airtable.com"]', { timeout: 10000 });
    
    // Get the Airtable link
    const airtableLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="airtable.com"]'));
      return links.length > 0 ? links[0].href : null;
    });

    if (!airtableLink) {
      throw new Error('Could not find Airtable link on YouVersion page');
    }

    console.log('Found Airtable link:', airtableLink);

    // Navigate to Airtable
    await page.goto(airtableLink, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for Airtable to load
    await page.waitForSelector('[data-testid="grid-view"]', { timeout: 20000 });
    
    // Give the data time to fully load
    await page.waitForTimeout(3000);

    // Extract verse data from Airtable
    console.log('Extracting verse data...');
    const verses = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[role="row"]'));
      const verseData = [];
      
      // Skip header row
      for (let i = 1; i < rows.length && i <= 90; i++) {
        const cells = rows[i].querySelectorAll('[role="gridcell"]');
        if (cells.length >= 2) {
          // Assuming first cell is date and second is verse reference
          const dateText = cells[0].textContent.trim();
          const reference = cells[1].textContent.trim();
          
          if (dateText && reference) {
            // Parse the reference to extract book, chapter, verse
            const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
            if (match) {
              verseData.push({
                date: dateText,
                reference: reference,
                book: match[1],
                chapter: parseInt(match[2]),
                verse: match[3]
              });
            }
          }
        }
      }
      
      return verseData;
    });

    console.log(`Extracted ${verses.length} verses`);

    // If we have verses, format and save them
    if (verses.length > 0) {
      // Get today's date
      const today = new Date();
      
      // Create formatted verse entries with proper dates
      const formattedVerses = verses.map((verse, index) => {
        const verseDate = new Date(today);
        verseDate.setDate(today.getDate() + index);
        
        return {
          date: verseDate.toISOString().split('T')[0],
          reference: verse.reference,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          bibleId: "de4e12af7f28f599-02" // ESV Bible ID
        };
      });

      // Calculate next update date (85 days from now)
      const nextUpdate = new Date(today);
      nextUpdate.setDate(today.getDate() + 85);

      const versesData = {
        lastUpdated: today.toISOString(),
        nextUpdate: nextUpdate.toISOString(),
        source: "YouVersion Verse of the Day Calendar",
        verses: formattedVerses,
        metadata: {
          totalDays: formattedVerses.length,
          version: "1.0"
        }
      };

      // Write to docs/verses.json
      const outputPath = path.join(__dirname, '..', '..', 'docs', 'verses.json');
      await fs.writeFile(outputPath, JSON.stringify(versesData, null, 2));
      
      console.log('Successfully wrote verses to docs/verses.json');
    } else {
      throw new Error('No verses extracted from Airtable');
    }

  } catch (error) {
    console.error('Error scraping verses:', error);
    
    // If scraping fails, log but don't fail the action
    // This ensures the existing verses.json remains intact
    console.log('Keeping existing verses.json due to scraping error');
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeVerses().catch(console.error);