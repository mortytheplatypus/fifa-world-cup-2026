export const THEME_STORAGE_KEY = 'fifa-wc-2026-theme';
export const FAVORITE_TEAM_STORAGE_KEY = 'fifa-wc-2026-favorite-team';
export const TEAM_THEME_VARS_KEY = 'fifa-wc-2026-team-theme-vars';

const VALID_THEMES = new Set(['dark', 'light', 'team']);

export const THEME_OPTIONS = {
  DARK: 'dark',
  LIGHT: 'light',
  TEAM: 'team',
};

const LIVE_COLORS_DARK = {
  '--live': '#e07a5f',
  '--live-text': '#f4c4b8',
};

const LIVE_COLORS_LIGHT = {
  '--live': '#c94e35',
  '--live-text': '#852d1a',
};

export const DARK_THEME = {
  '--bg': '#12171e',
  '--bg-deep': '#0d1117',
  '--bg-elevated': '#171e28',
  '--surface': '#1e2732',
  '--surface-hover': '#283342',
  '--border': '#3a4656',
  '--text': '#eef1f5',
  '--text-muted': '#9aa8ba',
  '--accent': '#5d9a82',
  '--accent-hover': '#6faf96',
  '--highlight': '#c8ad72',
  '--highlight-hover': '#d9be86',
  '--highlight-text': '#ede4d4',
  ...LIVE_COLORS_DARK,
};

export const LIGHT_THEME = {
  '--bg': '#f7f3eb',
  '--bg-deep': '#efe8dc',
  '--bg-elevated': '#faf6ef',
  '--surface': '#fffdf8',
  '--surface-hover': '#f5efe4',
  '--border': '#ddd2c0',
  '--text': '#2e281c',
  '--text-muted': '#7a6e5c',
  '--accent': '#5d8a6a',
  '--accent-hover': '#4d7a5a',
  '--highlight': '#c4a04d',
  '--highlight-hover': '#b08f3e',
  '--highlight-text': '#3d3018',
  ...LIVE_COLORS_LIGHT,
};

const THEME_VAR_KEYS = Object.keys(DARK_THEME);

function parseHex(hex) {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function toHex({ r, g, b }) {
  const channel = (value) => value.toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  const channels = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function mixHex(hexA, hexB, weightB) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const weightA = 1 - weightB;
  return toHex({
    r: Math.round(a.r * weightA + b.r * weightB),
    g: Math.round(a.g * weightA + b.g * weightB),
    b: Math.round(a.b * weightA + b.b * weightB),
  });
}

function contrastRatio(hexA, hexB) {
  const lumA = luminance(hexA);
  const lumB = luminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickTextColor(backgroundHex) {
  const whiteContrast = contrastRatio(backgroundHex, '#ffffff');
  const darkContrast = contrastRatio(backgroundHex, '#1a2332');
  return whiteContrast >= darkContrast ? '#ffffff' : '#1a2332';
}

export function buildTeamTheme(colors) {
  const [darkest, mid, brightest] = [...colors].sort(
    (a, b) => luminance(a) - luminance(b)
  );

  const bgDeep = darkest;
  const bg = mixHex(darkest, mid, 0.35);
  const bgElevated = mixHex(darkest, mid, 0.2);
  const surface = mixHex(darkest, mid, 0.55);
  const surfaceHover = mixHex(darkest, mid, 0.7);
  const border = mixHex(mid, brightest, 0.4);
  const text = pickTextColor(bg);
  const textMuted = mixHex(text, mid, 0.45);
  const accent = mid;
  const accentHover = mixHex(mid, brightest, 0.35);
  const highlight = brightest;
  const highlightHover = mixHex(brightest, mid, 0.25);
  const highlightText = pickTextColor(highlight);

  const liveColors = luminance(bg) > 0.45 ? LIVE_COLORS_LIGHT : LIVE_COLORS_DARK;

  return {
    '--bg': bg,
    '--bg-deep': bgDeep,
    '--bg-elevated': bgElevated,
    '--surface': surface,
    '--surface-hover': surfaceHover,
    '--border': border,
    '--text': text,
    '--text-muted': textMuted,
    '--accent': accent,
    '--accent-hover': accentHover,
    '--highlight': highlight,
    '--highlight-hover': highlightHover,
    '--highlight-text': highlightText,
    ...liveColors,
  };
}

export function applyTheme(themeVars, themeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeMode);

  THEME_VAR_KEYS.forEach((key) => {
    root.style.removeProperty(key);
  });

  if (themeMode === THEME_OPTIONS.TEAM) {
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    return;
  }

  if (themeMode === THEME_OPTIONS.LIGHT) {
    Object.entries(LIGHT_THEME).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    return;
  }

  Object.entries(DARK_THEME).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function getThemeColorMeta(themeMode, themeVars) {
  if (themeMode === THEME_OPTIONS.LIGHT) {
    return LIGHT_THEME['--bg-deep'];
  }
  if (themeMode === THEME_OPTIONS.TEAM) {
    return themeVars?.['--bg-deep'] ?? DARK_THEME['--bg-deep'];
  }
  return DARK_THEME['--bg-deep'];
}

export function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value && VALID_THEMES.has(value) ? value : null;
  } catch {
    return null;
  }
}

export function readStoredFavoriteTeam() {
  try {
    return localStorage.getItem(FAVORITE_TEAM_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures
  }
}

export function writeStoredFavoriteTeam(teamId) {
  try {
    localStorage.setItem(FAVORITE_TEAM_STORAGE_KEY, teamId);
  } catch {
    // Ignore storage failures
  }
}

export function readCachedTeamThemeVars() {
  try {
    const raw = localStorage.getItem(TEAM_THEME_VARS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCachedTeamThemeVars(vars) {
  try {
    localStorage.setItem(TEAM_THEME_VARS_KEY, JSON.stringify(vars));
  } catch {
    // Ignore storage failures
  }
}

function updateThemeColorMeta(themeMode, themeVars) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute('content', getThemeColorMeta(themeMode, themeVars));
}

export async function initializeThemeFromStorage() {
  const theme = readStoredTheme() ?? THEME_OPTIONS.DARK;

  if (theme === THEME_OPTIONS.TEAM) {
    const cachedVars = readCachedTeamThemeVars();
    if (cachedVars) {
      applyTheme(cachedVars, THEME_OPTIONS.TEAM);
      updateThemeColorMeta(THEME_OPTIONS.TEAM, cachedVars);
    }

    const teamId = readStoredFavoriteTeam() ?? 'MEX';
    try {
      const response = await fetch('/data/team-colors.json');
      if (response.ok) {
        const colors = await response.json();
        if (colors[teamId]) {
          const vars = buildTeamTheme(colors[teamId]);
          applyTheme(vars, THEME_OPTIONS.TEAM);
          writeCachedTeamThemeVars(vars);
          updateThemeColorMeta(THEME_OPTIONS.TEAM, vars);
        }
      }
    } catch {
      if (!cachedVars) {
        applyTheme(null, THEME_OPTIONS.DARK);
        updateThemeColorMeta(THEME_OPTIONS.DARK, null);
      }
    }
    return;
  }

  applyTheme(null, theme);
  updateThemeColorMeta(theme, null);
}
