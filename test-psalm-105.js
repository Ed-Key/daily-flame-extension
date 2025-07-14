// Test script to fetch Psalm 105 from different translations
const fetch = require('node-fetch');

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
    console.log('ESV Response structure:', JSON.stringify(data, null, 2));
    
    // Also fetch as text to see formatting
    const textUrl = `https://api.esv.org/v3/passage/text/?q=Psalm+105&include-passage-references=false&include-footnotes=false&include-headings=true&include-verse-numbers=true`;
    const textResponse = await fetch(textUrl, {
      headers: {
        'Authorization': `Token ${ESV_API_KEY}`
      }
    });
    const textData = await textResponse.json();
    console.log('\nESV Text format:', textData.passages[0].substring(0, 500) + '...');
    
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
    console.log('NLT Response structure:', JSON.stringify(data, null, 2).substring(0, 1000) + '...');
    
  } catch (error) {
    console.error('NLT Error:', error);
  }
}

async function fetchWEBPsalm105() {
  console.log('\n=== Fetching Psalm 105 from WEB (Scripture.api.bible) ===');
  
  // First get the passage ID for Psalm 105
  const searchUrl = `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01/search?query=Psalm+105&limit=1`;
  
  try {
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'api-key': SCRIPTURE_API_KEY
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('Search results:', JSON.stringify(searchData, null, 2).substring(0, 500) + '...');
    
    // Now fetch the actual passage with XML content
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
    console.log('\nWEB/XML Response structure:', JSON.stringify(passageData, null, 2).substring(0, 1000) + '...');
    
    // Also show a sample of the XML content
    if (passageData.data && passageData.data.content) {
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

main().catch(console.error);