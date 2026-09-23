#!/usr/bin/env python3
import json
import os
from pathlib import Path

CHUNK_SIZE = 500  # Number of hadith entries per chunk file
BOOKS_DIR = Path(__file__).parent.parent / 'file' / 'books'
CHUNKS_DIR = Path(__file__).parent.parent / 'file' / 'chunks'

# Create chunks directory if it doesn't exist
CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

book_files = [
    'abu-daud.json',
    'ahmad.json',
    'bukhari.json',
    'ibnu-majah.json',
    'malik.json',
    'muslim.json',
    'tirmidzi.json'
]

index = {}

for file in book_files:
    book_name = Path(file).stem
    file_path = BOOKS_DIR / file
    
    print(f"Processing {book_name}...")
    
    # Read the original JSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total_length = len(data)
    print(f"  Total entries: {total_length}")
    
    # Split into chunks
    chunks = []
    for i in range(0, len(data), CHUNK_SIZE):
        chunks.append(data[i:i + CHUNK_SIZE])
    
    print(f"  Split into {len(chunks)} chunk(s)")
    
    # Write chunks to separate files
    chunk_files = []
    for idx, chunk in enumerate(chunks):
        chunk_file_name = f"{book_name}_chunk_{idx}.json"
        chunk_path = CHUNKS_DIR / chunk_file_name
        
        with open(chunk_path, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        
        chunk_files.append(chunk_file_name)
    
    # Store metadata in index
    index[book_name] = {
        'totalLength': total_length,
        'chunkSize': CHUNK_SIZE,
        'chunks': chunk_files
    }
    
    print(f"  ✓ {book_name} complete\n")

# Write index file
index_path = CHUNKS_DIR / 'index.json'
with open(index_path, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print(f"✓ All books split and indexed!")
print(f"Index file: {index_path}")
