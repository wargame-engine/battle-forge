import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export const DataContext = React.createContext({});

const breadCrumbDefaults = {
  '': 'Home',
  factions: 'Factions',
  rules: 'Rules',
  games: 'Games',
  missions: 'Missions',
  quickstart: 'Rules',
  updates: 'Updates',
  privacy: 'Privacy Policy',
  lists: 'Rosters'
};

export function usePageTitle(opts = {}) {
  const { path: optPath, optData } = opts;
  // const [{ data: contextData }] = React.useContext(DataContext);
  const contextData = {};
  const data = optData ?? contextData;
  const loc = useLocation();
  const path = optPath ?? loc.pathname;
  const [locationTitle] = path.split('/').slice(-1);
  //const ignoredPathes = new Set(['lists']);
  const ignoredPathes = new Set([]);
  const titles = React.useMemo(() => {
    const breadCrumbTitles = {
      ...breadCrumbDefaults
    };
    Object.keys(get(data, 'gameData.games', {})).forEach((gameId) => {
      const game = get(data, `gameData.games[${gameId}]`);
      Object.keys(get(game, 'factions', {})).forEach((factionId) => {
        const faction = get(data, `gameData.games[${gameId}].factions[${factionId}]`);
        breadCrumbTitles[factionId] = faction.name;
      });
      breadCrumbTitles[gameId] = game.name;
    });
    const lists = get(data, 'lists', {});
    Object.keys(lists).forEach((listId) => {
      const list = lists[listId];
      breadCrumbTitles[listId] = list.name;
    });
    return breadCrumbTitles;
  }, [data]);
  let title = titles[locationTitle] || locationTitle;
  title = ignoredPathes.has(title) ? null : title;
  return title;
};

export * from './use-data-fetcher';
export * from './use-modal';

