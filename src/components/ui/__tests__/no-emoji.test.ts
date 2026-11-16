import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('no emoji icons', () => {
  it('has no emoji in sources', () => {
    const roots = ['src/components', 'src/pages', 'src/context', 'src/utils'];
    const files = roots.flatMap(walk).filter(file => /\.tsx?$/.test(file) && !file.includes('__tests__'));
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const offenders = files.filter(file => emoji.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
