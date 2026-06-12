import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchTeamColors } from '../utils/data';
import {
  applyTheme,
  buildTeamTheme,
  getThemeColorMeta,
  readFavoriteTeamPromptDismissed,
  readStoredFavoriteTeam,
  readStoredTheme,
  THEME_OPTIONS,
  writeCachedTeamThemeVars,
  writeFavoriteTeamPromptDismissed,
  writeStoredFavoriteTeam,
  writeStoredTheme,
} from '../utils/themes';

const SettingsContext = createContext(null);

function updateThemeColorMeta(themeMode, themeVars) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute('content', getThemeColorMeta(themeMode, themeVars));
}

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => readStoredTheme() ?? THEME_OPTIONS.DARK
  );
  const [favoriteTeamId, setFavoriteTeamIdState] = useState(
    () => readStoredFavoriteTeam()
  );
  const [showFavoriteTeamPrompt, setShowFavoriteTeamPrompt] = useState(
    () => !readStoredFavoriteTeam() && !readFavoriteTeamPromptDismissed()
  );
  const [teamColors, setTeamColors] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchTeamColors()
      .then((colors) => {
        if (!cancelled) {
          setTeamColors(colors);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTeamColors({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const teamThemeVars = useMemo(() => {
    if (!teamColors || !favoriteTeamId || !teamColors[favoriteTeamId]) {
      return null;
    }
    return buildTeamTheme(teamColors[favoriteTeamId]);
  }, [teamColors, favoriteTeamId]);

  useEffect(() => {
    if (theme === THEME_OPTIONS.TEAM && !teamThemeVars) {
      return;
    }

    const vars = theme === THEME_OPTIONS.TEAM ? teamThemeVars : null;
    applyTheme(vars, theme);
    updateThemeColorMeta(theme, vars);

    if (theme === THEME_OPTIONS.TEAM && teamThemeVars) {
      writeCachedTeamThemeVars(teamThemeVars);
    }
  }, [theme, teamThemeVars]);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme);
    writeStoredTheme(nextTheme);
  }, []);

  const setFavoriteTeamId = useCallback((nextTeamId) => {
    if (!nextTeamId) {
      return;
    }

    setFavoriteTeamIdState(nextTeamId);
    writeStoredFavoriteTeam(nextTeamId);
    setShowFavoriteTeamPrompt(false);
    writeFavoriteTeamPromptDismissed();
  }, []);

  const dismissFavoriteTeamPrompt = useCallback(() => {
    setShowFavoriteTeamPrompt(false);
    writeFavoriteTeamPromptDismissed();
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      favoriteTeamId,
      setFavoriteTeamId,
      showFavoriteTeamPrompt,
      dismissFavoriteTeamPrompt,
      teamColors,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [
      theme,
      setTheme,
      favoriteTeamId,
      setFavoriteTeamId,
      showFavoriteTeamPrompt,
      dismissFavoriteTeamPrompt,
      teamColors,
      isModalOpen,
      openModal,
      closeModal,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
