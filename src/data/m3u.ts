import type { Channel } from '../types';
import { COLOR_PAIRS } from './demo';

const MAX_ENTRIES = 600;

function colorFor(value: string): [string, string] {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }
  return COLOR_PAIRS[hash % COLOR_PAIRS.length];
}

function parseAttributes(line: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const matcher = /([\w-]+)="([^"]*)"/g;
  let match = matcher.exec(line);
  while (match) {
    attributes[match[1].toLowerCase()] = match[2];
    match = matcher.exec(line);
  }
  return attributes;
}

function resolveUrl(candidate: string, base?: string): string {
  if (!base) return candidate;
  try {
    return new URL(candidate, base).toString();
  } catch {
    return candidate;
  }
}

export function parseM3U(content: string, baseUrl?: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let pending: { name: string; category: string; logo: string } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.lastIndexOf(',');
      const displayName = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : '';
      const attributes = parseAttributes(line);
      pending = {
        name: displayName || attributes['tvg-name'] || 'Canal sin nombre',
        category: attributes['group-title']?.trim() || 'General',
        logo: attributes['tvg-logo']?.trim() || '',
      };
      continue;
    }

    if (line.startsWith('#')) continue;

    if (pending) {
      channels.push({
        id: `m3u-${channels.length + 1}`,
        name: pending.name,
        category: pending.category,
        streamUrl: resolveUrl(line, baseUrl),
        colors: colorFor(pending.name + pending.category),
      });
      pending = null;
      if (channels.length >= MAX_ENTRIES) break;
    }
  }

  return channels;
}
