/* ============================================================
   HadisLoader — memory-bounded chunk loader.
   - One chunk in memory is enough for a random hadith.
   - LRU cache of `maxCachedChunks`.
   - In-flight de-duplication for rapid clicks.
   - Reads embedded `number` (your data has gaps: 97, 101, 105…).
   ============================================================ */
class HadisLoader {
  constructor(options = {}) {
    this.index = null;
    this.indexPromise = null;

    // 4–8 works well for ~512-entry chunks (~1 MB parsed each).
    this.maxCachedChunks = options.maxCachedChunks ?? 6;

    // Your schema: number = hadith number, id = Indonesian, arab = Arabic.
    this.numberFields = options.numberFields ?? [
      'number',
      'no',
      'hadithnumber',
    ];

    /** @type {Map<string, any[]>} */
    this.chunkCache = new Map();
    /** @type {Map<string, Promise<any[]>>} */
    this.chunkPending = new Map();
    /** @type {Map<string, {totalLength:number, chunks:{file:string,length:number,start:number}[]}>} */
    this.bookMeta = new Map();
  }

  // ---------- index ----------

  async loadIndex() {
    if (this.index) return this.index;
    if (this.indexPromise) return this.indexPromise;

    this.indexPromise = (async () => {
      const res = await fetch('file/chunks/index.json', {
        cache: 'force-cache',
      });
      if (!res.ok) throw new Error(`Index load failed: ${res.status}`);
      this.index = await res.json();
      return this.index;
    })().finally(() => {
      this.indexPromise = null;
    });

    return this.indexPromise;
  }

  async _ensureBookMeta(bookName) {
    const cached = this.bookMeta.get(bookName);
    if (cached) return cached;

    const index = await this.loadIndex();
    const book = index[bookName];
    if (!book) throw new Error(`Book "${bookName}" not found in index`);

    const rawChunks = Array.isArray(book.chunks) ? book.chunks : [];
    const chunks = [];
    let offset = 0;
    let sum = 0;

    for (const c of rawChunks) {
      const file = typeof c === 'string' ? c : c.file;
      const length = typeof c === 'string' ? 0 : c.length | 0;
      chunks.push({ file, length, start: offset });
      offset += length;
      sum += length;
    }

    const totalLength = book.totalLength || sum || 0;
    const meta = { totalLength, chunks };
    this.bookMeta.set(bookName, meta);
    return meta;
  }

  // ---------- LRU chunk cache ----------

  _touch(key) {
    const v = this.chunkCache.get(key);
    this.chunkCache.delete(key);
    this.chunkCache.set(key, v);
  }

  _evict() {
    while (this.chunkCache.size > this.maxCachedChunks) {
      const oldest = this.chunkCache.keys().next().value;
      this.chunkCache.delete(oldest);
    }
  }

  async _fetchChunk(file) {
    if (this.chunkCache.has(file)) {
      this._touch(file);
      return this.chunkCache.get(file);
    }
    if (this.chunkPending.has(file)) {
      return this.chunkPending.get(file);
    }
    const p = (async () => {
      const res = await fetch(`file/chunks/${file}`, { cache: 'force-cache' });
      if (!res.ok)
        throw new Error(`Chunk load failed: ${file} (${res.status})`);
      const data = await res.json();
      this.chunkCache.set(file, data);
      this._evict();
      return data;
    })().finally(() => {
      this.chunkPending.delete(file);
    });

    this.chunkPending.set(file, p);
    return p;
  }

  // ---------- helpers ----------

  _resolveNumber(entry, globalIndex) {
    for (const f of this.numberFields) {
      const v = entry?.[f];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    // Only reached if the source JSON truly lacks a number field.
    return globalIndex + 1;
  }

  // ---------- public ----------

  async getRandomHadith(bookName) {
    const meta = await this._ensureBookMeta(bookName);

    // Fast path: known chunk lengths → uniform random across whole book.
    if (meta.totalLength > 0 && meta.chunks.every((c) => c.length > 0)) {
      let pos = Math.floor(Math.random() * meta.totalLength);
      for (let i = 0; i < meta.chunks.length; i++) {
        const ch = meta.chunks[i];
        if (pos < ch.length) {
          const data = await this._fetchChunk(ch.file);
          const entry = data[pos];
          const globalIndex = ch.start + pos;
          const number = this._resolveNumber(entry, globalIndex);
          return {
            entry,
            number,
            globalIndex,
            imam: bookName,
            chunkFile: ch.file,
          };
        }
        pos -= ch.length;
      }
    }

    // Fallback: unknown chunk lengths → pick chunk, discover lengths, retry next time.
    const ci = Math.floor(Math.random() * meta.chunks.length);
    const ch = meta.chunks[ci];
    const data = await this._fetchChunk(ch.file);

    if (!ch.length) {
      ch.length = data.length;
      let off = 0;
      for (const c of meta.chunks) {
        c.start = off;
        off += c.length || 0;
      }
      if (meta.chunks.every((c) => c.length > 0)) {
        meta.totalLength = meta.chunks.reduce((s, c) => s + c.length, 0);
      }
    }

    const local = (Math.random() * data.length) | 0;
    const entry = data[local];
    const globalIndex = ch.start + local;
    const number = this._resolveNumber(entry, globalIndex);
    return { entry, number, globalIndex, imam: bookName, chunkFile: ch.file };
  }

  async warm(bookName, chunkCount = 1) {
    const meta = await this._ensureBookMeta(bookName);
    const n = Math.min(chunkCount, meta.chunks.length);
    for (let i = 0; i < n; i++) {
      try {
        await this._fetchChunk(meta.chunks[i].file);
      } catch {
        /* ignore */
      }
    }
  }

  clearCache() {
    this.chunkCache.clear();
    this.chunkPending.clear();
    this.bookMeta.clear();
    this.index = null;
    this.indexPromise = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HadisLoader;
}
