const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  try {
    // Option 1: Using environment variable (recommended for GitHub Actions)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
    } 
    // Option 2: Using service account JSON directly
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'daily-flame'
      });
    }
    // Option 3: For local development with service account file
    else {
      const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
      // Check if file exists before requiring
      try {
        await fs.access(serviceAccountPath);
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: 'daily-flame'
        });
      } catch (e) {
        console.error('No service account key found. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
        throw new Error('Firebase authentication not configured');
      }
    }
    
    return admin.firestore();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

async function processAndSaveVerses(verses) {
  // Sort verses by date
  verses.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Get today's date
  const today = new Date();
  
  try {
    // Initialize Firestore
    const db = await initializeFirebase();
    console.log('Firebase initialized successfully');
    
    // Prepare batch write for efficiency
    const batch = db.batch();
    const collectionRef = db.collection('dailyVerses');
    
    // Format and add each verse to the batch
    verses.forEach((verse, index) => {
      const docRef = collectionRef.doc(verse.date);
      
      const verseDoc = {
        reference: verse.reference,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        bibleId: "de4e12af7f28f599-02", // ESV Bible ID
        url: verse.url || '',
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        order: index + 1
      };
      
      batch.set(docRef, verseDoc);
      console.log(`Prepared verse for ${verse.date}: ${verse.reference}`);
    });
    
    // Calculate next update date (85 days from now)
    const nextUpdate = new Date(today);
    nextUpdate.setDate(today.getDate() + 85);
    
    // Update metadata document
    const metadataRef = collectionRef.doc('_metadata');
    batch.set(metadataRef, {
      lastUpdated: today.toISOString(),
      nextUpdate: nextUpdate.toISOString(),
      source: "YouVersion Verse of the Day Calendar",
      totalDays: verses.length,
      version: "1.0",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Commit the batch
    console.log('Committing batch write to Firestore...');
    await batch.commit();
    
    console.log('Successfully wrote verses to Firestore!');
    console.log(`First verse: ${verses[0].date} - ${verses[0].reference}`);
    console.log(`Last verse: ${verses[verses.length - 1].date} - ${verses[verses.length - 1].reference}`);
    
    // Also save to verses.json as backup
    const versesData = {
      lastUpdated: today.toISOString(),
      nextUpdate: nextUpdate.toISOString(),
      source: "YouVersion Verse of the Day Calendar",
      verses: verses.map(verse => ({
        date: verse.date,
        reference: verse.reference,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        bibleId: "de4e12af7f28f599-02",
        url: verse.url || ''
      })),
      metadata: {
        totalDays: verses.length,
        version: "1.0"
      }
    };
    
    const outputPath = path.join(__dirname, '..', '..', 'docs', 'verses.json');
    await fs.writeFile(outputPath, JSON.stringify(versesData, null, 2));
    console.log('Backup written to docs/verses.json');
    
  } catch (error) {
    console.error('Error saving verses to Firestore:', error);
    throw error;
  }
}

async function scrapeVerses() {
  // Set up download directory
  const downloadPath = path.join(__dirname, 'downloads');
  
  // Create download directory if it doesn't exist
  try {
    await fs.mkdir(downloadPath, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Configure download behavior
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath
    });
    
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
    
    // Log the page title and URL for debugging
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('Loaded page title:', pageTitle);
    console.log('Current URL:', pageUrl);

    // Wait for Airtable to load - try multiple selectors
    console.log('Waiting for Airtable grid to load...');
    try {
      // Try multiple possible selectors for the grid view
      await page.waitForSelector('.gridView, [role="grid"], .dataGridContainer', { timeout: 20000 });
    } catch (error) {
      console.log('Primary selectors failed, trying alternative selectors...');
      await page.waitForSelector('.baymax, .reactGridView, .dataRow', { timeout: 10000 });
    }
    
    // Give the data time to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Handle cookie modal by clicking the X button
    console.log('Looking for cookie modal close button...');
    try {
      // Look for the X close button
      const closeSelectors = [
        'button[aria-label="Close"]',
        'button[aria-label="close"]',
        'button[title="Close"]',
        '.close',
        '.close-button',
        '[aria-label*="dismiss"]',
        'button svg', // X is often an SVG icon
        'button'
      ];
      
      let closeButton = null;
      for (const selector of closeSelectors) {
        closeButton = await page.$(selector);
        if (closeButton) {
          // Check if it's actually a close button
          const isCloseButton = await page.evaluate(el => {
            const text = el.textContent.trim();
            const ariaLabel = el.getAttribute('aria-label');
            const title = el.getAttribute('title');
            // Check for X, ×, or close-related attributes
            return text === '×' || text === 'X' || text === 'x' || 
                   (ariaLabel && ariaLabel.toLowerCase().includes('close')) ||
                   (title && title.toLowerCase().includes('close')) ||
                   el.querySelector('svg'); // Often close buttons have SVG icons
          }, closeButton);
          
          if (isCloseButton) {
            console.log(`Found close button with selector: ${selector}`);
            await closeButton.click();
            console.log('Clicked cookie modal close button');
            await new Promise(resolve => setTimeout(resolve, 2000));
            break;
          }
        }
      }
      
      if (!closeButton) {
        console.log('No close button found for cookie modal');
      }
    } catch (error) {
      console.log('Error handling cookie modal:', error.message);
    }
    
    
    // Try to find and click the "..." (more options) button
    console.log('Looking for more options button...');
    try {
      // Selectors for more options button based on actual HTML
      const moreOptionsSelectors = [
        '[aria-label="More view options"]',  // Most specific
        '.viewMenuButton',                    // Class selector
        '[data-tutorial-selector-id="viewMenuButton"]',  // Data attribute
        'div[role="button"][aria-haspopup="true"]'      // Generic fallback
      ];
      
      let moreButton = null;
      for (const selector of moreOptionsSelectors) {
        try {
          moreButton = await page.$(selector);
          if (moreButton) {
            console.log(`Found more options button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!moreButton) {
        console.log('More options button not found with primary selectors');
      }
      
      if (moreButton) {
        console.log('Clicking more options button...');
        await moreButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Look for download CSV option
        console.log('Looking for Download CSV option...');
        
        // Primary selector based on the HTML provided
        let downloadButton = await page.$('[data-tutorial-selector-id="viewMenuItem-viewExportCsv"]');
        
        if (!downloadButton) {
          // Fallback: look for menu item with "Download CSV" text
          console.log('Primary selector failed, looking for menu item by text...');
          const menuItems = await page.$$('li[role="menuitem"]');
          
          for (const item of menuItems) {
            const text = await page.evaluate(el => el.textContent.trim(), item);
            if (text === 'Download CSV') {
              downloadButton = item;
              console.log('Found Download CSV menu item by text');
              break;
            }
          }
        } else {
          console.log('Found Download CSV button with primary selector');
        }
        
        if (downloadButton) {
          console.log('Clicking download CSV...');
          
          // Set up download promise before clicking
          const downloadPromise = new Promise((resolve) => {
            page.on('response', response => {
              const url = response.url();
              const contentType = response.headers()['content-type'];
              if (contentType && contentType.includes('csv')) {
                console.log('CSV download detected');
                resolve();
              }
            });
          });
          
          await downloadButton.click();
          
          // Wait for download to start (with timeout)
          await Promise.race([
            downloadPromise,
            new Promise(resolve => setTimeout(resolve, 10000))
          ]);
          
          // Give download time to complete
          console.log('Waiting for download to complete...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } else {
          console.log('Could not find Download CSV option');
        }
      } else {
        console.log('Could not find more options button');
      }
      
    } catch (error) {
      console.log('Error trying to download CSV:', error.message);
    }
    
    // Check if CSV file was downloaded
    const files = await fs.readdir(downloadPath);
    const csvFile = files.find(f => f.endsWith('.csv'));
    
    if (csvFile) {
      console.log(`CSV file downloaded: ${csvFile}`);
      const csvPath = path.join(downloadPath, csvFile);
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      
      // Parse CSV
      console.log('Parsing CSV data...');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      console.log(`Found ${records.length} records in CSV`);
      
      // Log the first record to see column names
      if (records.length > 0) {
        console.log('CSV columns:', Object.keys(records[0]));
        console.log('First record:', records[0]);
      }
      
      // Process records into verses
      const verses = [];
      for (const record of records) {
        // Handle BOM character in column names and check multiple possibilities
        const date = record['Date'] || record['date'] || record['﻿Date'];
        const verseRef = record['Verse of the Day'] || record['verse'] || record['Verse'];
        const url = record['URL'] || record['url'] || record['Link'];
        const referenceText = record['Reference Text'] || record['reference text'];
        
        if (date && verseRef) {
          const match = verseRef.match(/^(.+?)\s+(\d+):(\d+)(?:-\d+)?$/);
          if (match) {
            verses.push({
              date: date,
              reference: verseRef,
              book: match[1],
              chapter: parseInt(match[2]),
              verse: match[3],
              url: url || ''
            });
          }
        }
      }
      
      // Clean up downloaded file
      await fs.unlink(csvPath);
      
      // Process the verses
      console.log(`Extracted ${verses.length} verses from CSV`);
      
      if (verses.length > 0) {
        await processAndSaveVerses(verses);
      }
      
      // Successfully got CSV data
      return;
    } else {
      console.log('No CSV file found in download directory');
      throw new Error('Failed to download CSV file from Airtable');
    }

  } catch (error) {
    console.error('Error scraping verses:', error);
    
    // If scraping fails, log but don't fail the action
    // This ensures the existing verses.json remains intact
    console.log('Keeping existing verses.json due to scraping error');
  } finally {
    await browser.close();
    
    // Clean up download directory
    try {
      await fs.rmdir(downloadPath, { recursive: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Run the scraper
scrapeVerses().catch(console.error);