import type { GameCode } from '../../types/lottery';

const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getDailyWindow = (daysBack = 7) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);

  return {
    start: toApiDate(start),
    end: toApiDate(end),
  };
};

const getGordoWindow = (daysBack = 15) => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);

  return {
    start: toApiDate(start),
    end: toApiDate(end),
  };
};

const getFridayOffset = (date: Date) => {
  const day = date.getDay();
  return (day + 2) % 7;
};

const getQuinielaWindow = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const friday = new Date(today);
  friday.setDate(today.getDate() - getFridayOffset(today));

  const nextFriday = new Date(friday);
  nextFriday.setDate(friday.getDate() + 7);

  return {
    start: toApiDate(friday),
    end: toApiDate(nextFriday),
  };
};

export const getDateWindowForGame = (game: GameCode) => {
  switch (game) {
    case 'BONO':
    case 'LAPR':
    case 'EMIL':
      return getDailyWindow(7);
    case 'ELGR':
      return getGordoWindow(15);
    case 'LNAC':
      return getDailyWindow(14);
    case 'LAQU':
      return getQuinielaWindow();
    default:
      return getDailyWindow(7);
  }
};
