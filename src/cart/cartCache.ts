const SUMMARY_KEY = 'bug-204:summary';
export function getCachedSummary(): { total: number } | null {
  const stored = localStorage.getItem(SUMMARY_KEY);
  return stored ? JSON.parse(stored) as { total: number } : null;
}
export function cacheSummary(total: number): void {
  localStorage.setItem(SUMMARY_KEY, JSON.stringify({ total }));
}
export function clearCartCache(): void { localStorage.removeItem(SUMMARY_KEY); }
