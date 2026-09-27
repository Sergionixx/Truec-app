const files: Record<string, string> = {
  "1606813907291": "ps5", "1611532736597": "laptop", "1517336714731": "laptop",
  "1592286927505": "phone", "1598327105666": "phone", "1511707171634": "phone",
  "1617096200347": "switch", "1546435770": "headphones", "1505740420928": "headphones",
  "1511512578047": "gaming", "1550745165": "gaming", "1486401899868": "ps5",
  "1600294037681": "airpods", "1544244015": "tablet",
};
export function localPhotos(code: string): string {
  return code.replace(/https:\/\/images\.unsplash\.com\/photo-(\d+)-[a-z0-9]+(?:\?[^"'`\s)]*)?/g,
    (url, id: string) => files[id] ? `/web/native-photos/${files[id]}.jpg` : url);
}
