import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { translate } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const SOURCE_DIR = join(process.cwd(), 'client', 'src');

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('translations', () => {
  it('defines the same keys for English and Japanese', () => {
    expect(Object.keys(translations.ja).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it('never ships an empty translation', () => {
    for (const language of ['en', 'ja'] as const) {
      for (const [key, value] of Object.entries(translations[language])) {
        expect(value.trim(), `${language}:${key}`).not.toBe('');
      }
    }
  });

  it('falls back to the key when a translation is missing', () => {
    expect(translate('ja', '__missing__')).toBe('__missing__');
  });

  it('defines every key referenced from the UI', () => {
    const used = new Set<string>();

    for (const file of collectSourceFiles(SOURCE_DIR)) {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
      const source = readFileSync(file, 'utf8');
      const matcher = /\bt\(\s*['"]([^'"]+)['"]/g;
      let match: RegExpExecArray | null;
      while ((match = matcher.exec(source)) !== null) {
        used.add(match[1]);
      }
    }

    const missing = [...used].filter((key) => !(key in translations.en)).sort();
    expect(missing).toEqual([]);
  });
});
