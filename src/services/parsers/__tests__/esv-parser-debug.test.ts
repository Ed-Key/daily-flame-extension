import { ESVBibleParser } from '../esv-parser';

// This test is to help debug the issue with ESV not loading chapters
describe('ESVBibleParser - Debug Real API Response', () => {
  let parser: ESVBibleParser;

  beforeEach(() => {
    parser = new ESVBibleParser();
  });

  // To debug: 
  // 1. Copy the actual API response from browser console after adding logging
  // 2. Paste it here as actualResponse
  // 3. Run the test to see what's happening
  
  it.skip('should parse actual James 1 response from console', () => {
    // TODO: Replace this with actual response from console.log('ESV API raw response:', rawData);
    const actualResponse = {
      // Paste actual response here
    };

    const result = parser.parse(actualResponse);
    
    console.log('Parsed result:', {
      verseCount: result.verses.length,
      firstVerse: result.verses[0],
      lastVerse: result.verses[result.verses.length - 1]
    });

    expect(result.verses.length).toBeGreaterThan(0);
  });

  // Let's test with a minimal ESV response to understand the expected format
  it('should handle different ESV HTML structures', () => {
    // Test case 1: With span.text structure (what we expect)
    const withSpanText = {
      passages: [`<p><span class="text"><span class="chapternum">1 </span>Test verse.</span></p>`],
      canonical: "Test 1"
    };
    
    const result1 = parser.parse(withSpanText);
    console.log('With span.text:', result1.verses);
    
    // Test case 2: Without span.text (just verse numbers)
    const withoutSpanText = {
      passages: [`<p><b class="verse-num">1</b> Test verse without span.text.</p>`],
      canonical: "Test 1"
    };
    
    // This will likely fail, helping us understand the issue
    try {
      const result2 = parser.parse(withoutSpanText);
      console.log('Without span.text:', result2.verses);
    } catch (error) {
      console.log('Failed to parse without span.text:', error.message);
    }
    
    // Test case 3: Modern ESV format (what might be returned now)
    const modernFormat = {
      passages: [`<p class="verse"><sup class="verse-num">1</sup>Test verse in modern format.</p>`],
      canonical: "Test 1"
    };
    
    try {
      const result3 = parser.parse(modernFormat);
      console.log('Modern format:', result3.verses);
    } catch (error) {
      console.log('Failed to parse modern format:', error.message);
    }
  });

  // Test with actual HTML format from console (new ESV format)
  it('should parse new ESV HTML format with <b> tags', () => {
    // This is the actual HTML returned by ESV API as seen in console
    const actualEsvHtml = `<h3 id="p59001001_01-1">Greeting</h3>
<p id="p59001001_02-1" class="starts-chapter"><b class="chapter-num" id="v59001001-1">1:1&nbsp;</b>James, a servant of God and of the Lord Jesus Christ,</p>
<p id="p59001001_02-1">To the twelve tribes in the Dispersion:</p>
<p id="p59001001_02-1">Greetings.</p>
<h3 id="p59001001_02-1">Testing of Your Faith</h3>
<p id="p59001001_06-1"><b class="verse-num" id="v59001002-1">2&nbsp;</b>Count it all joy, my brothers, when you meet trials of various kinds, <b class="verse-num" id="v59001003-1">3&nbsp;</b>for you know that the testing of your faith produces steadfastness.</p>`;
    
    const response = {
      passages: [actualEsvHtml],
      canonical: "James 1"
    };
    
    const result = parser.parse(response);
    
    console.log('Parsed verses from new format:', result.verses.map(v => ({
      number: v.number,
      text: v.text.substring(0, 50) + '...',
      heading: v.heading
    })));
    
    // Should have found the verses
    expect(result.verses.length).toBeGreaterThan(0);
    
    // Check first verse
    const firstVerse = result.verses[0];
    expect(firstVerse.number).toBe('1');
    expect(firstVerse.text).toContain('James, a servant of God');
    expect(firstVerse.isFirstVerse).toBe(true);
    expect(firstVerse.heading).toBe('Greeting');
    
    // Find verse 2
    const verse2 = result.verses.find(v => v.number === '2');
    expect(verse2).toBeDefined();
    expect(verse2?.text).toContain('Count it all joy');
    expect(verse2?.heading).toBe('Testing of Your Faith');
    
    // Find verse 3
    const verse3 = result.verses.find(v => v.number === '3');
    expect(verse3).toBeDefined();
    expect(verse3?.text).toContain('testing of your faith produces steadfastness');
    expect(verse3?.heading).toBeUndefined(); // Should not repeat heading
  });

  // Test the fix for nested span parsing (old format)
  it.skip('should parse ESV HTML with proper nested span handling', () => {
    // This is what the actual ESV API returns
    const realEsvHtml = `
      <h2 class="extra_text">James 1 <small class="audio extra_text">(<a class="mp3link" href="https://audio.esv.org/david-cochran-heath/mq/59001001-59001027.mp3" title="James 1" type="audio/mpeg">Listen</a>)</small></h2>
      <h3 id="p59001001_01-1">Greeting</h3>
      <p id="p59001001_07-1" class="chapter-first"><span class="text James-1-1"><span class="chapternum">1 </span>James, a servant of God and of the Lord Jesus Christ,</span></p>
      <p class="same-paragraph"><span class="text James-1-1">To the twelve tribes in the Dispersion:</span></p>
      <p class="same-paragraph"><span class="text James-1-1">Greetings.</span></p>
      <h3 id="p59001002_01-1">Testing of Your Faith</h3>
      <p id="p59001002_06-1"><span class="text James-1-2"><span class="versenum">2 </span>Count it all joy, my brothers, when you meet trials of various kinds, </span><span class="text James-1-3"><span class="versenum">3 </span>for you know that the testing of your faith produces steadfastness.</span></p>
    `;
    
    const response = {
      passages: [realEsvHtml],
      canonical: "James 1"
    };
    
    const result = parser.parse(response);
    
    console.log('Parsed verses:', result.verses.map(v => ({
      number: v.number,
      text: v.text.substring(0, 50) + '...',
      heading: v.heading
    })));
    
    // Should have found the verses
    expect(result.verses.length).toBeGreaterThan(0);
    
    // Check first verse
    const firstVerse = result.verses[0];
    expect(firstVerse.number).toBe('1');
    expect(firstVerse.text).toContain('James, a servant of God');
    expect(firstVerse.isFirstVerse).toBe(true);
    expect(firstVerse.heading).toBe('Greeting');
    
    // Check verse 2
    const verse2 = result.verses.find(v => v.number === '2');
    expect(verse2).toBeDefined();
    expect(verse2?.text).toContain('Count it all joy');
    expect(verse2?.heading).toBe('Testing of Your Faith');
  });

  // Test to verify what HTML patterns we're looking for
  it.skip('should show what patterns the parser is looking for', () => {
    const testHtml = `
      <h3 id="heading1">Test Heading</h3>
      <p class="chapter-first">
        <span class="text James-1-1">
          <span class="chapternum">1 </span>James, a servant of God
        </span>
      </p>
      <p>
        <span class="text James-1-2">
          <span class="versenum">2 </span>Count it all joy
        </span>
      </p>
    `;
    
    const response = {
      passages: [testHtml],
      canonical: "James 1"
    };
    
    // Let's test the regex directly to understand the issue
    const versePattern = /<span[^>]*class="text[^"]*"[^>]*>(.*?)<\/span>/gs;
    const matches = Array.from(testHtml.matchAll(versePattern));
    console.log('Regex matches:', matches.map(m => ({ 
      fullMatch: m[0], 
      capturedContent: m[1] 
    })));
    
    const result = parser.parse(response);
    
    console.log('Parsed verses:', result.verses);
    
    expect(result.verses).toHaveLength(2);
    expect(result.verses[0].number).toBe('1');
    expect(result.verses[0].text).toContain('James, a servant of God');
    expect(result.verses[1].number).toBe('2');
    expect(result.verses[1].text).toContain('Count it all joy');
  });

  // Test to understand the regex issue
  it('should correctly match nested span content', () => {
    // The issue is that the regex is capturing only up to the first closing tag
    const simpleHtml = '<span class="text">Simple content</span>';
    const nestedHtml = '<span class="text"><span class="versenum">1 </span>Nested content</span>';
    
    const pattern = /<span[^>]*class="text[^"]*"[^>]*>(.*?)<\/span>/gs;
    
    const simpleMatch = simpleHtml.match(pattern);
    const nestedMatch = nestedHtml.match(pattern);
    
    console.log('Simple match:', simpleMatch);
    console.log('Nested match:', nestedMatch);
    
    // Try different approaches
    // 1. Use a more specific pattern that handles nested spans
    const testHtml = `<span class="text James-1-1">
          <span class="chapternum">1 </span>James, a servant of God
        </span>`;
    
    // Extract full content of span.text elements
    const spanTextPattern = /<span[^>]*class="text[^"]*"[^>]*>([\s\S]*?)<\/span>(?![^<]*<\/span>)/g;
    const spanMatch = testHtml.match(spanTextPattern);
    console.log('Span text pattern match:', spanMatch);
    
    // Alternative: match the opening tag, then find its matching closing tag
    const openTagPattern = /<span[^>]*class="text[^"]*"[^>]*>/g;
    const openTags = Array.from(testHtml.matchAll(openTagPattern));
    console.log('Open tags found:', openTags.map(m => m[0]));
    
    // For each open tag, find content until matching close
    openTags.forEach(openTag => {
      const startIndex = openTag.index + openTag[0].length;
      let depth = 1;
      let endIndex = startIndex;
      
      while (depth > 0 && endIndex < testHtml.length) {
        const nextOpen = testHtml.indexOf('<span', endIndex);
        const nextClose = testHtml.indexOf('</span>', endIndex);
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          endIndex = nextOpen + 1;
        } else {
          depth--;
          if (depth === 0) {
            const content = testHtml.substring(startIndex, nextClose);
            console.log('Extracted content:', content);
          }
          endIndex = nextClose + 1;
        }
      }
    });
  });
});