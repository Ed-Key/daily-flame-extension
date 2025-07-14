// Test script to fetch Psalm 105 from different translations
// Run this by pasting into browser console on a page with CORS disabled or from the extension

// API configurations
const ESV_API_KEY = '689d47f3f940b8417c0a06ad8bfdacb59e4bb94f';
const SCRIPTURE_API_KEY = '58410e50f19ea158ea4902e05191db02';
const NLT_API_KEY = 'f91ffc0989fa54147be78bc74c1f3fd8';

async function fetchESVPsalm105() {
  console.log('\n=== Fetching Psalm 105 from ESV ===');
  const url = `https://api.esv.org/v3/passage/html/?q=Psalm+105&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true&include-audio-link=false`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${ESV_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`ESV API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('ESV HTML Response:', data);
    
    // Parse the HTML to see structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.passages[0], 'text/html');
    
    // Look for superscription
    const h3 = doc.querySelector('h3');
    if (h3) {
      console.log('Superscription found:', h3.textContent);
    }
    
    // Look for section headings
    const headings = doc.querySelectorAll('.heading');
    console.log('Section headings found:', headings.length);
    headings.forEach((h, i) => console.log(`  Heading ${i + 1}:`, h.textContent));
    
    // Look for verses
    const verses = doc.querySelectorAll('.verse-num');
    console.log('Verse numbers found:', verses.length);
    
    // Look for paragraph markers
    const paragraphs = doc.querySelectorAll('p');
    console.log('Paragraphs found:', paragraphs.length);
    
    // Also fetch as text to see formatting
    const textUrl = `https://api.esv.org/v3/passage/text/?q=Psalm+105&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true`;
    const textResponse = await fetch(textUrl, {
      headers: {
        'Authorization': `Token ${ESV_API_KEY}`
      }
    });
    const textData = await textResponse.json();
    console.log('\nESV Text format (first 500 chars):', textData.passages[0].substring(0, 500) + '...');
    
    // Check for Selah
    if (textData.passages[0].includes('Selah')) {
      console.log('Contains Selah!');
    }
    
  } catch (error) {
    console.error('ESV Error:', error);
  }
}

async function fetchNLTPsalm105() {
  console.log('\n=== Fetching Psalm 105 from NLT ===');
  const url = 'https://api.nlt.to/api/passages?ref=Psalm+105&version=NLT';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NLT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NLT API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('NLT Response:', data);
    
    // Parse the content
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.content, 'text/html');
    
    // Look for superscription
    const sup = doc.querySelector('sup.heading');
    if (sup) {
      console.log('Superscription found:', sup.textContent);
    }
    
    // Look for verses with specific classes
    const verses = doc.querySelectorAll('.verse');
    console.log('Verses found:', verses.length);
    
    // Check for poetry formatting
    const poetryLines = doc.querySelectorAll('.q1, .q2');
    console.log('Poetry lines found:', poetryLines.length);
    
  } catch (error) {
    console.error('NLT Error:', error);
  }
}

async function fetchWEBPsalm105() {
  console.log('\n=== Fetching Psalm 105 from WEB (Scripture.api.bible) ===');
  
  try {
    // Direct fetch with known ID
    const passageUrl = `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01/passages/PSA.105?content-type=xml&include-notes=false&include-titles=true&include-chapter-numbers=true&include-verse-numbers=true`;
    
    const passageResponse = await fetch(passageUrl, {
      headers: {
        'api-key': SCRIPTURE_API_KEY
      }
    });
    
    if (!passageResponse.ok) {
      throw new Error(`Passage fetch failed: ${passageResponse.status}`);
    }
    
    const passageData = await passageResponse.json();
    console.log('WEB Response:', passageData);
    
    // Parse XML content
    if (passageData.data && passageData.data.content) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(passageData.data.content, 'text/xml');
      
      // Look for title
      const title = xmlDoc.querySelector('title');
      if (title) {
        console.log('Title found:', title.textContent);
      }
      
      // Look for verses
      const verses = xmlDoc.querySelectorAll('verse');
      console.log('Verses found:', verses.length);
      
      // Look for paragraph markers
      const paras = xmlDoc.querySelectorAll('para');
      console.log('Para elements found:', paras.length);
      
      // Check for poetry markers
      const q1 = xmlDoc.querySelectorAll('[style*="q1"]');
      const q2 = xmlDoc.querySelectorAll('[style*="q2"]');
      console.log('Poetry markers - q1:', q1.length, 'q2:', q2.length);
      
      // Show first 1000 chars of XML
      console.log('\nXML Content sample:', passageData.data.content.substring(0, 1000) + '...');
    }
    
  } catch (error) {
    console.error('WEB Error:', error);
  }
}

// Run all fetches
async function main() {
  await fetchESVPsalm105();
  await fetchNLTPsalm105();
  await fetchWEBPsalm105();
}

// Export for browser console
(window as any).testPsalm105 = main;