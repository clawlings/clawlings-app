const KEY = "clawlings_watchlist";

export function getWatchlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(id: string) {
  const list = getWatchlist();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function removeFromWatchlist(id: string) {
  const list = getWatchlist().filter((x) => x !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isWatched(id: string): boolean {
  return getWatchlist().includes(id);
}
