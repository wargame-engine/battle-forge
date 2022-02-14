import { get, omitBy } from "lodash";
import { mergeWith, set } from "lodash/fp";
import React, { useEffect, useState } from "react";
import { isUrl } from "utils/files";
import { customMerge } from "utils/misc";

export const useDataFetcher = (myUrl) => {
  const localData = JSON.parse(localStorage.getItem("data") || "{}");
  const localPrefs = JSON.parse(localStorage.getItem("userPrefs") || "{}");
  const [data, setData] = useState(localData);
  const [userPrefs, setUserPrefs] = useState(localPrefs);
  const [appState, setAppState] = useState({});
  const [url, setUrl] = useState(
    myUrl || "https://raw.githubusercontent.com/wargame-engine/root/master/"
  );
  // Directly overwrite faction related stuff
  const overwrite = new Set([
    "powerCategories",
    "weather",
    "secondaries",
    "missions",
    "buyLinks",
    "units",
    "powers",
    "terrain",
    "strategies",
    "weapons",
    "rules",
    "perks",
    "models",
    "subfactions",
    "setbacks",
    "relics",
    "categories",
    "organizations",
    "alliances",
  ]);
  // const missionUrl = "/data/missions/index.json";
  const ruleUrl = "/data/rules.md";
  const skirmishRuleUrl = "/data/rules_skirmish.md";
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const updateUserPrefs = (myData) => {
    const newData = {
      ...userPrefs,
      ...myData,
    };
    localStorage.setItem("userPrefs", JSON.stringify(newData));
    setUserPrefs(newData);
  };
  const updateData = (myData) => {
    localStorage.setItem("data", JSON.stringify(myData));
    setData(myData);
  };
  const fetchGameSystems = React.useCallback(async (factionsUrl) => {
    return fetchData(`${factionsUrl || url}index.json`)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => { });
  }, [url]);
  const fetchFactions = async (factionsUrl) => {
    return fetchData(`${factionsUrl}index.json`)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => { });
  };
  // const fetchMissions = async (missionsUrl) => {
  //   return fetchData(missionsUrl || missionUrl)
  //     .then((resultData) => {
  //       return resultData;
  //     })
  //     .catch((e) => Promise.reject(e));
  // };
  const fetchNameLists = React.useCallback(async (namelistsUrl) => {
    return fetchData(`${namelistsUrl || url}namelists.json`)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => Promise.reject(e));
  }, [url]);
  const fetchGameUpdates = React.useCallback(async (updatesUrl) => {
    return fetchTextData(`${updatesUrl || url}updates.md`)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => Promise.reject(e));
  }, [url]);
  const fetchRules = React.useCallback(async (rulesUrl) => {
    return fetchTextData(rulesUrl || ruleUrl)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => Promise.reject(e));
  }, []);
  const fetchSkirmishRules = React.useCallback(async (rulesUrl) => {
    return fetchTextData(rulesUrl || skirmishRuleUrl)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => Promise.reject(e));
  }, []);
  const fetchAllData = React.useCallback(async (reset = false) => {
    const resultData = await fetchGameSystems();
    // const resultDataMissions = await fetchMissions();
    const resultDataNameLists = await fetchNameLists();
    const resultDataUpdates = await fetchGameUpdates();
    const resultDataRules = await fetchRules();
    const resultSkirmishRules = await fetchSkirmishRules();
    const allData = {
      lastFetch: Date.now(),
      gameData: {
        ...get(data, "gameData", {}),
        ...resultData,
        globalData: {
          ...get(data, "gameData.globalData", {}),
          ...get(resultData, "globalData", {}),
          all: {
            ...get(data, "gameData.globalData.all", {}),
            ...get(resultData, "globalData.all", {}),
            nameLists: resultDataNameLists,
          },
        },
      },
      customData: reset
        ? {}
        : {
          ...get(data, "customData", {}),
        },
      updates: resultDataUpdates,
      gameRules: resultDataRules,
      skirmishRules: resultSkirmishRules,
      lists: get(data, "lists", {}),
    };
    updateData(allData);
    return allData;
  }, [data, fetchGameSystems, fetchGameUpdates, fetchNameLists, fetchRules, fetchSkirmishRules]);
  useEffect(() => {
    const hasGameData = !Object.keys(get(data, `gameData.games`, {})).length;
    const MAX_CACHE_AGE = 2 * 60 * 60 * 1000; // 2 hours
    if (hasGameData || Date.now() - get(data, `lastFetch`, 0) > MAX_CACHE_AGE) {
      fetchAllData();
    }
  }, [data, fetchAllData, url]);

  const refreshData = (gameid) => {
    const gameUrl = get(data, `gameData.games[${gameid}].url`);
    if (!gameUrl) {
      return Promise.resolve({});
    }
    return fetchFactions(`${gameUrl}`)
      .then((gameData) => {
        let newData = {
          ...data,
          gameData: {
            ...get(data, "gameData", {}),
            games: {
              ...get(data, "gameData.games", {}),
              [gameid]: {
                ...get(data, `gameData.games[${gameid}]`),
                ...gameData,
              },
            },
          },
          customData: {
            games: {
              ...get(data, "customData.games", {}),
              [gameid]: {},
            },
          },
        };
        updateData(newData);
        return gameData;
      })
      .catch((error) => {
        return Promise.resolve({});
      });
  };

  const refreshFaction = (gameid, factionName) => {
    return fetchFaction(gameid, factionName)
      .then((gameData) => {
        let newData = {
          ...data,
          customData: {
            games: {
              ...get(data, "customData.games", {}),
            },
          },
        };
        if (get(data, `customData.games[${gameid}]`)) {
          newData.customData.games[gameid] = {
            ...get(data, `customData.games[${gameid}]`, {}),
            factions: {
              ...get(data, `customData.games[${gameid}].factions`, {}),
              [factionName]: {},
            },
          };
        }
        updateData(newData);
        return gameData;
      })
      .catch((error) => {
        return Promise.resolve({});
      });
  };

  const fetchTextData = async (someUrl) => {
    setIsError(false);
    setIsLoading(true);
    try {
      const result = await fetch(someUrl);
      const resultData = await result.text();
      setIsLoading(false);
      return resultData;
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  const fetchData = async (someUrl) => {
    setIsError(false);
    setIsLoading(true);
    try {
      const result = await fetch(someUrl);
      const resultData = await result.json();
      setIsLoading(false);
      return resultData;
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  const updateGameData = (gameName, updatedData) => {
    const newData = {
      ...data,
      games: {
        ...get(data, "games", {}),
        [gameName]: {
          ...[get(data, `games[${gameName}]`, {}), updatedData].reduce(
            customMerge
          ),
        },
      },
    };
    updateData(newData);
  };

  const fetchFaction = (gameName, factionName) => {
    const fetch = async () => {
      const gameUrl =
        get(data, `gameData.games[${gameName}].url`) ||
        get(data, `customData.games[${gameName}].url`);
      if (!gameUrl) {
        return Promise.resolve({});
      }
      const gameData = await fetchFactions(`${gameUrl}`);
      const newData = set(
        `gameData.games.${gameName}`,
        { ...gameData, ...get(data, `gameData.games.${gameName}`, {}) },
        data
      );
      const factionUrl =
        get(
          newData,
          `gameData.games[${gameName}].factions[${factionName}].url`
        ) ||
        get(
          newData,
          `customData.games[${gameName}].factions[${factionName}].url`
        );
      if (!factionUrl) {
        return Promise.resolve({});
      }
      const fullFactionUrl = isUrl(factionUrl)
        ? factionUrl
        : `${gameUrl}${factionUrl}`;
      const factionData = await fetchData(fullFactionUrl);
      const newDataWithFaction = set(
        `gameData.games.${gameName}.factions.${factionName}`,
        {
          ...get(gameData, `factions[${factionName}]`, {}),
          ...get(
            data,
            `gameData.games[${gameName}].factions[${factionName}]`,
            {}
          ),
          ...factionData,
        },
        newData
      );
      updateData(newDataWithFaction);
      return factionData;
    };
    return fetch();
  };

  const fetchGame = (gameid) => {
    const fetch = async () => {
      const gameUrl = get(data, `gameData.games[${gameid}].url`);
      if (!gameUrl) {
        return Promise.resolve({});
      }
      return fetchFactions(`${gameUrl}`)
        .then((gameData) => {
          let newData = {
            ...data,
            gameData: {
              ...get(data, "gameData", {}),
              games: {
                ...get(data, "gameData.games", {}),
                [gameid]: {
                  ...gameData,
                  ...omitBy(
                    get(data, `gameData.games[${gameid}]`, {}),
                    (game) => game.url
                  ),
                },
              },
            },
          };
          updateData(newData);
          return gameData;
        })
        .catch((error) => {
          return Promise.resolve({});
        });
    };
    fetch();
  };

  const deep = mergeWith(
    (objValue, srcValue, key, object, source, stack) => {
      if (overwrite.has(key)) {
        return srcValue;
      }
    },
    get(data, "gameData", {}),
    get(data, "customData", {})
  );
  const mergedData = {
    ...data,
    gameData: deep,
  };
  return [
    {
      data: mergedData,
      coreData: data,
      isLoading,
      isError,
      refreshFaction,
      setUrl,
      fetchFaction,
      fetchGame,
      setData: updateData,
      updateGameData,
      refreshData,
      refreshAllData: fetchAllData,
      appState,
      setAppState,
      userPrefs,
      setUserPrefs: updateUserPrefs,
    },
  ];
};