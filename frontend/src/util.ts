export function formatCount(count: number | undefined): string {
  if (count === undefined) return '';
  if (count > 999999) {
    return (count / 1000000).toFixed(2) + 'M';
  } else if (count > 999) {
    return (count / 1000).toFixed(2) + 'K';
  } else {
    return count.toString();
  }
}
