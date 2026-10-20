export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Starts at `start` and advances in real time. */
export const createOffsetClock = (start: Date, realNow: () => number = Date.now): Clock => {
  const offset = start.getTime() - realNow();
  return { now: () => new Date(realNow() + offset) };
};

export const createClock = (config: { now: Date | null }, realNow: () => number = Date.now): Clock =>
  config.now ? createOffsetClock(config.now, realNow) : systemClock;
