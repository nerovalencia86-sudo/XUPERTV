import { PROGRAM_POOL } from '../data/demo';
import type { Channel } from '../types';

export interface EpgSlot {
  current: string;
  next: string;
  progress: number;
  startsAt: Date;
  endsAt: Date;
}

const SLOT_MS = 30 * 60 * 1000;

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 9973;
  }
  return result;
}

export function scheduleFor(channel: Channel, now = Date.now()): EpgSlot {
  const programs = PROGRAM_POOL[channel.category] ?? ['Programación XUPER'];
  const slot = Math.floor(now / SLOT_MS);
  const startIndex = (slot + hash(channel.id)) % programs.length;
  const startsAt = new Date(slot * SLOT_MS);
  const endsAt = new Date((slot + 1) * SLOT_MS);
  return {
    current: programs[startIndex],
    next: programs[(startIndex + 1) % programs.length],
    progress: (now - startsAt.getTime()) / SLOT_MS,
    startsAt,
    endsAt,
  };
}
