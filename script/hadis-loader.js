/**
 * HadisLoader - Load chunked JSON data and verify integrity
 * 
 * Usage:
 *   const loader = new HadisLoader();
 *   loader.loadBook('bukhari').then(data => {
 *     console.log(data); // Full dataset
 *   });
 */

class HadisLoader {
  constructor() {
    this.cache = {};
    this.index = null;
    this.indexLoaded = false;
  }

  /**
   * Load the chunk index
   */
  async loadIndex() {
    if (this.indexLoaded) {
      return this.index;
    }

    try {
      const response = await fetch('file/chunks/index.json');
      this.index = await response.json();
      this.indexLoaded = true;
      return this.index;
    } catch (error) {
      console.error('Failed to load index:', error);
      throw error;
    }
  }

  /**
   * Load all chunks for a specific book and reconstruct the full dataset
   * @param {string} bookName - Name of the book (e.g., 'bukhari', 'muslim')
   * @returns {Promise<Array>} Full reconstructed data array
   */
  async loadBook(bookName) {
    // Check cache first
    if (this.cache[bookName]) {
      return this.cache[bookName];
    }

    // Load index if not already loaded
    const index = await this.loadIndex();

    if (!index[bookName]) {
      throw new Error(`Book "${bookName}" not found in index`);
    }

    const bookMeta = index[bookName];
    const fullData = [];

    console.log(`Loading ${bookName}...`);
    console.log(`  Expected total entries: ${bookMeta.totalLength}`);
    console.log(`  Loading ${bookMeta.chunks.length} chunk(s)...`);

    // Load all chunks
    for (let i = 0; i < bookMeta.chunks.length; i++) {
      const chunkFile = bookMeta.chunks[i];
      try {
        const response = await fetch(`file/chunks/${chunkFile}`);
        const chunkData = await response.json();
        fullData.push(...chunkData);
        console.log(`    ✓ Loaded chunk ${i + 1}/${bookMeta.chunks.length} (${chunkData.length} entries)`);
      } catch (error) {
        console.error(`Failed to load chunk ${i}:`, error);
        throw error;
      }
    }

    // Verify data integrity
    console.log(`  Verifying data integrity...`);
    if (fullData.length !== bookMeta.totalLength) {
      throw new Error(
        `Data mismatch for ${bookName}: ` +
        `expected ${bookMeta.totalLength} entries, ` +
        `got ${fullData.length} entries`
      );
    }

    console.log(`  ✓ ${bookName} loaded and verified (${fullData.length} entries)`);

    // Cache the result
    this.cache[bookName] = fullData;

    return fullData;
  }

  /**
   * Load multiple books at once
   * @param {Array<string>} bookNames - Array of book names
   * @returns {Promise<Object>} Object with book names as keys and data arrays as values
   */
  async loadBooks(bookNames) {
    const results = {};
    const promises = bookNames.map(name =>
      this.loadBook(name).then(data => {
        results[name] = data;
      })
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * Load all available books
   * @returns {Promise<Object>} Object with all books
   */
  async loadAllBooks() {
    const index = await this.loadIndex();
    const bookNames = Object.keys(index);
    return this.loadBooks(bookNames);
  }

  /**
   * Get a random hadith from a specific book
   * @param {string} bookName - Name of the book
   * @returns {Promise<Object>} Random hadith entry
   */
  async getRandomHadith(bookName) {
    const data = await this.loadBook(bookName);
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {};
  }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HadisLoader;
}
