export async function fetchFolderData(url: string) {
  const res = await fetch(url);  
  if (!res.ok) return null;

  const html = await res.text();

  const regex = /<script type="application\/json" data-target="react-app\.embeddedData">([^<]+)<\/script>/;
  const match = html.match(regex);

  if (!match) return null;

  const jsonStr = match[1];
  const data = JSON.parse(jsonStr);

  const items = data.payload?.tree?.items || [];

  return items;
}