const photoCache = new Map();

export function getPlayerInitials(name) {
  if (!name) {
    return '?';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function enlargeWikipediaThumb(url) {
  if (!url) {
    return null;
  }

  return url.replace(/\/(\d+)px-/, '/500px-');
}

async function fetchWikipediaSummary(title) {
  const encoded = encodeURIComponent(title.replace(/\s+/g, '_'));

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return enlargeWikipediaThumb(data.thumbnail?.source ?? null);
  } catch {
    return null;
  }
}

async function fetchWikipediaSearch(playerName) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${playerName} footballer`,
    gsrlimit: '3',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '500',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});
    const normalized = normalizeName(playerName);

    const exactMatch = pages.find((page) => normalizeName(page.title) === normalized);
    const footballerMatch = pages.find((page) =>
      page.title?.toLowerCase().includes('footballer')
    );

    const page = exactMatch ?? footballerMatch ?? pages[0];
    return enlargeWikipediaThumb(page?.thumbnail?.source ?? null);
  } catch {
    return null;
  }
}

async function fetchSportsDbPhoto(playerName) {
  const params = new URLSearchParams({ p: playerName });

  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?${params}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const players = (data.player ?? []).filter(
      (entry) => entry.strSport?.toLowerCase() === 'soccer'
    );

    if (!players.length) {
      return null;
    }

    const normalized = normalizeName(playerName);
    const exactMatch =
      players.find((entry) => normalizeName(entry.strPlayer) === normalized) ?? players[0];

    return exactMatch.strCutout || exactMatch.strThumb || null;
  } catch {
    return null;
  }
}

async function fetchWikipediaPhoto(playerName) {
  const candidates = [
    playerName,
    `${playerName} (footballer)`,
  ];

  for (const title of candidates) {
    const photo = await fetchWikipediaSummary(title);
    if (photo) {
      return photo;
    }
  }

  return fetchWikipediaSearch(playerName);
}

export async function fetchPlayerPhoto(playerName) {
  if (!playerName) {
    return null;
  }

  if (photoCache.has(playerName)) {
    return photoCache.get(playerName);
  }

  const sportsDbPhoto = await fetchSportsDbPhoto(playerName);
  if (sportsDbPhoto) {
    photoCache.set(playerName, sportsDbPhoto);
    return sportsDbPhoto;
  }

  const wikipediaPhoto = await fetchWikipediaPhoto(playerName);
  photoCache.set(playerName, wikipediaPhoto);
  return wikipediaPhoto;
}
