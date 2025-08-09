import { NLTService } from '../nlt-service';

// Mock fetch
global.fetch = jest.fn();

describe('NLTService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVerse', () => {
    it('should parse verses with paragraph tags (John 3:16 format)', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <!DOCTYPE html><html lang="en-US">
          <body>
          <div id="bibletext" class=" NLT NLT BibleText section">
            <section>
              <h2 class="bk_ch_vs_header">John 3:16, NLT</h2>
              <verse_export orig="john_3_16" bk="john" ch="3" vn="16">
                <p class="body"><span class="vn">16</span><span class="red">"For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.</span></p>
              </verse_export>
            </section>
          </div>
          </body></html>
        `
      } as Response);

      const result = await NLTService.getVerse('John 3:16');
      
      expect(result.text).toBe('"For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.');
      expect(result.reference).toBe('John 3:16');
      expect(result.bibleId).toBe('NLT');
    });

    it('should parse verses without paragraph tags (John 3:17 format)', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <!DOCTYPE html><html lang="en-US">
          <body>
          <div id="bibletext" class=" NLT NLT BibleText section">
            <section>
              <h2 class="bk_ch_vs_header">John 3:17, NLT</h2>
              <verse_export orig="john_3_17" bk="john" ch="3" vn="17">
                <span class="vn">17</span><span class="red">God sent his Son into the world not to judge the world, but to save the world through him.</span>
              </verse_export>
            </section>
          </div>
          </body></html>
        `
      } as Response);

      const result = await NLTService.getVerse('John 3:17');
      
      expect(result.text).toBe('God sent his Son into the world not to judge the world, but to save the world through him.');
      expect(result.reference).toBe('John 3:17');
      expect(result.bibleId).toBe('NLT');
    });

    it('should handle poetry format with poet classes', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <!DOCTYPE html><html lang="en-US">
          <body>
          <div id="bibletext" class=" NLT NLT BibleText section">
            <section>
              <h2 class="bk_ch_vs_header">Psalm 23:1, NLT</h2>
              <verse_export orig="psalm_23_1" bk="psalm" ch="23" vn="1">
                <p class="poet1"><span class="vn">1</span>The Lord is my shepherd;</p>
                <p class="poet2">I shall not want.</p>
              </verse_export>
            </section>
          </div>
          </body></html>
        `
      } as Response);

      const result = await NLTService.getVerse('Psalm 23:1');
      
      expect(result.text).toContain('The Lord is my shepherd');
      expect(result.text).toContain('I shall not want');
      expect(result.reference).toBe('Psalm 23:1');
      expect(result.bibleId).toBe('NLT');
    });

    it('should handle verses with footnotes', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <verse_export orig="john_3_16" bk="john" ch="3" vn="16">
            <p class="body"><span class="vn">16</span><span class="red">"For this is how God loved the world: He gave<a class="a-tn">*</a><span class="tn"><span class="tn-ref">3:16</span> Or <em>For God loved the world so much that he gave.</em></span> his one and only Son, so that everyone who believes in him will not perish but have eternal life.</span></p>
          </verse_export>
        `
      } as Response);

      const result = await NLTService.getVerse('John 3:16');
      
      // Should remove footnote markers and content
      expect(result.text).not.toContain('<a class="a-tn">');
      expect(result.text).not.toContain('Or For God loved');
      expect(result.text).toContain('"For this is how God loved the world: He gave his one and only Son');
    });

    it('should throw error when no content found', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `<div>No verse export here</div>`
      } as Response);

      await expect(NLTService.getVerse('Invalid 1:1')).rejects.toThrow('No verse content found');
    });

    it('should throw error when API request fails', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(NLTService.getVerse('Invalid 1:1')).rejects.toThrow('NLT API request failed: 404 - Not Found');
    });

    it('should handle mixed content (direct text and paragraphs)', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <verse_export>
            Some direct text here
            <p class="body">And paragraph text here</p>
          </verse_export>
        `
      } as Response);

      const result = await NLTService.getVerse('Test 1:1');
      
      // Should get paragraph text first (as per current logic)
      expect(result.text).toBe('And paragraph text here');
    });

    it('should convert reference format correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      
      // Capture the actual URL being called
      let calledUrl: string = '';
      mockFetch.mockImplementationOnce(async (url) => {
        calledUrl = url as string;
        return {
          ok: true,
          text: async () => `
            <verse_export>
              <p class="body">Test verse</p>
            </verse_export>
          `
        } as Response;
      });

      await NLTService.getVerse('John 3:16-17');
      
      // Should convert "John 3:16-17" to "John.3.16-17"
      expect(calledUrl).toContain('John.3.16-17');
    });
  });

  describe('getChapterWithRedLetters', () => {
    it('should return raw HTML content for chapter', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      const htmlContent = '<verse_export vn="1"><cn>3</cn>Test verse</verse_export>';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => htmlContent
      } as Response);

      const result = await NLTService.getChapterWithRedLetters('John 3');
      
      expect(result.passages).toHaveLength(1);
      expect(result.passages[0].reference).toBe('John 3');
      expect(result.passages[0].content).toBe(htmlContent);
    });

    it('should convert chapter reference format correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      
      let calledUrl: string = '';
      mockFetch.mockImplementationOnce(async (url) => {
        calledUrl = url as string;
        return {
          ok: true,
          text: async () => '<verse_export></verse_export>'
        } as Response;
      });

      await NLTService.getChapterWithRedLetters('John 3');
      
      // Should convert "John 3" to "John.3"
      expect(calledUrl).toContain('John.3');
    });
  });
});