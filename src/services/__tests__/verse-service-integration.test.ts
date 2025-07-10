import { VerseService } from '../verse-service';
import { UnifiedChapter } from '../../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('VerseService - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChapter with unified format', () => {
    it('should return unified format for ESV', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: "John 3",
          canonical: "John 3",
          passages: [
            `<h3>Test Heading</h3><p><span class="text"><span class="chapternum">3 </span>Test verse one.</span></p>`
          ]
        })
      } as Response);

      const result = await VerseService.getChapter('John 3', 'ESV');

      // Verify it returns UnifiedChapter format
      expect(result).toHaveProperty('verses');
      expect(result).toHaveProperty('translation');
      expect(result.translation).toBe('ESV');
      expect(result.reference).toBe('John 3');
      expect(result.bookName).toBe('John');
      expect(result.chapterNumber).toBe('3');
      expect(Array.isArray(result.verses)).toBe(true);
    });

    it('should return unified format for NLT', async () => {
      // Mock NLTService.getChapterWithRedLetters
      const NLTService = require('../nlt-service').NLTService;
      jest.spyOn(NLTService, 'getChapterWithRedLetters').mockResolvedValueOnce({
        passages: [{
          reference: 'John 3',
          content: '<verse_export vn="1"><cn>3</cn>Test verse</verse_export>'
        }]
      });

      const result = await VerseService.getChapter('John 3', 'NLT');

      expect(result).toHaveProperty('verses');
      expect(result.translation).toBe('NLT');
      expect(result.verses).toHaveLength(1);
      expect(result.verses[0].number).toBe('1');
    });

    it('should return unified format for KJV', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'JHN.3',
            reference: 'John 3',
            content: [{
              items: [
                { name: '1', text: 'Test verse' }
              ]
            }]
          }
        })
      } as Response);

      const result = await VerseService.getChapter('John 3', 'de4e12af7f28f599-02'); // KJV ID

      expect(result).toHaveProperty('verses');
      expect(result.translation).toBe('KJV');
      expect(result.verses[0].text).toBe('Test verse');
    });

    it('should throw error for unknown translation', async () => {
      await expect(VerseService.getChapter('John 3', 'UNKNOWN')).rejects.toThrow('Unknown bible ID');
    });
  });
});