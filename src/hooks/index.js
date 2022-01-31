import { get, omitBy } from "lodash";
import { mergeWith, set } from "lodash/fp";
import React, {
  memo, useCallback, useContext, useEffect, useMemo, useState
} from "react";
import { createPortal } from "react-dom";
import ReactGA from "react-ga";
import { useLocation } from 'react-router-dom';
import styled from "styled-components";
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
      .catch((e) => {});
  }, [url]);
  const fetchFactions = async (factionsUrl) => {
    return fetchData(`${factionsUrl}index.json`)
      .then((resultData) => {
        return resultData;
      })
      .catch((e) => {});
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

export const usePointsCache = () => {
  // const localData = JSON.parse(localStorage.getItem("pointsCache") || "{}");
  //let data = { ...localData };
  let data = {};

  const updateCache = (myData) => {
    //localStorage.setItem('pointsCache', JSON.stringify(myData));
    data = myData;
  };

  const setCache = (key, value) => {
    updateCache({
      ...data,
      [key]: value,
    });
  };

  const getCache = (key) => {
    return data[key];
  };

  const resetCache = () => {
    updateCache({});
  };

  return { getCache, setCache, resetCache };
};

export const usePageTracking = () => {
  const location = window.location;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!window.location.href.includes("localhost")) {
      ReactGA.initialize("UA-191175744-1");
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      ReactGA.pageview(location.pathname + location.search);
    }
  }, [initialized, location]);
};

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

export const PointsCacheContext = React.createContext({});
export const DataContext = React.createContext({});

export function usePortal() {
  const portalElRef = React.useRef(document.createElement("div"));

  React.useEffect(() => {
    const theRef = portalElRef.current;
    document.body.appendChild(theRef);

    return () => {
      if (theRef) {
        document.body.removeChild();
      }
    };
  }, [portalElRef]);

  const Portal = React.useCallback(
    ({ children }) => {
      if (portalElRef.current != null)
        return createPortal(children, portalElRef.current);
      return null;
    },
    [portalElRef]
  );

  return Portal;
}

// Usage
// const ModalPortal = usePortal();

// return (
//   <DialogPortal>
//     <div className="overlay">
//       <div className="content">
//         <h2>This header is inside modal</h2>
//       </div>
//     </div>
//   </ModalPortal>
// )

const Wrapper = styled.div`
  font-size: var(--sev1-size);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

/**
 * Throw error when ModalContext is used outside of context provider
 */
const invariantViolation = () => {
  throw new Error(
    "Attempted to call useModal outside of modal context. Make sure your app is rendered inside ModalProvider."
  );
};

/**
 * Modal Context Object
 */
export const ModalContext = React.createContext({
  showModal: invariantViolation,
  hideModal: invariantViolation,
});
ModalContext.displayName = "ModalContext";

/**
 * Modal Provider
 *
 * Provides modal context and renders ModalRoot.
 */
export const ModalProvider = ({ container, rootComponent, children }) => {
  if (container && !(container instanceof HTMLElement)) {
    throw new Error(`Container must specify DOM element to mount modal root into.
    This behavior has changed in 3.0.0. Please use \`rootComponent\` prop instead.
    See: https://github.com/mpontus/react-modal-hook/issues/18`);
  }
  const [modals, setModals] = useState({});
  const showModal = useCallback(
    (key, modal, extraProps) =>
      setModals((modals) => ({
        ...modals,
        [key]: { modal, extraProps },
      })),
    []
  );
  const hideModal = useCallback(
    (key) =>
      setModals((modals) => {
        if (!modals[key]) {
          return modals;
        }
        const newModals = { ...modals };
        delete newModals[key];
        return newModals;
      }),
    []
  );
  const contextValue = useMemo(() => ({ showModal, hideModal }), [hideModal, showModal]);

  return (
    <ModalContext.Provider value={contextValue}>
      <React.Fragment>
        {children}
        <ModalRoot
          modals={modals}
          component={rootComponent}
          container={container}
        />
      </React.Fragment>
    </ModalContext.Provider>
  );
};

/**
 * Component responsible for rendering the modal.
 *
 * The identity of `Component` may change dependeing on the inputs passed to
 * `useModal`. If we simply rendered `<Component />` then the modal would be
 * susceptible to rerenders whenever one of the inputs change.
 */
const ModalRenderer = memo((props) => {
  const { component, extraProps, ...rest } = props;
  return component({ extraProps, ...rest });
});

/**
 * Modal Root
 *
 * Renders modals using react portal.
 */
export const ModalRoot = memo(
  ({ modals, container, component: RootComponent = React.Fragment }) => {
    const [mountNode, setMountNode] = useState(undefined);

    // This effect will not be ran in the server environment
    useEffect(() => setMountNode(container || document.body), [container]);

    return mountNode
      ? createPortal(
          <RootComponent>
            {Object.keys(modals).map((key) => {
              return (
                <Wrapper>
                  <ModalRenderer
                    key={key}
                    component={modals[key].modal}
                    extraProps={modals[key].extraProps}
                  />
                </Wrapper>
              );
            })}
          </RootComponent>,
          mountNode
        )
      : null;
  }
);

/**
 * Utility function to generate unique number per component instance
 */
const generateModalKey = (() => {
  let count = 0;

  return () => `${++count}`;
})();

/**
 * Check whether the argument is a stateless component.
 *
 * We take advantage of the stateless nature of functional components to be
 * inline the rendering of the modal component as part of another immutable
 * component.
 *
 * This is necessary for allowing the modal to update based on the inputs passed
 * as the second argument to useModal without unmounting the previous version of
 * the modal component.
 */
const isFunctionalComponent = (Component) => {
  const prototype = Component.prototype;

  return !prototype || !prototype.isReactComponent;
};

/**
 * React hook for showing modal windows
 */
export const useModal = (component, inputs = []) => {
  if (!isFunctionalComponent(component)) {
    throw new Error(
      "Only stateless components can be used as an argument to useModal. You have probably passed a class component where a function was expected."
    );
  }

  const key = useMemo(generateModalKey, []);
  const modal = useMemo(() => component, [component]);
  const context = useContext(ModalContext);
  const [extraProps, setExtraProps] = useState({});
  const [isShown, setShown] = useState(false);
  const showModal = useCallback((extraProps) => {
    setShown(true)
    return setExtraProps(extraProps);
  }, []);
  const hideModal = useCallback(() => setShown(false), []);

  useEffect(() => {
    if (isShown) {
      context.showModal(key, modal, extraProps);
    } else {
      context.hideModal(key);
    }

    // Hide modal when parent component unmounts
    return () => context.hideModal(key);
  }, [modal, isShown, context, key, extraProps]);

  return [showModal, hideModal];
};

const initialState = { session: null, user: null };
export const AuthContext = React.createContext(initialState);

export function AuthProvider({ children }) {
  // const client = useClient();
  // const [state, setState] = useState(initialState);
  // const userId = get(state, 'user.id');

  // useEffect(() => {
  //   const session = client.auth.session();
  //   setState({ session, user: session?.user ?? null });
  // }, []);
  
  // async function getProfile() {
  //   try {
  //     const user = client.auth.user();

  //     let { data, error, status } = await client
  //       .from("profiles")
  //       .select(`username, website, avatar_url`)
  //       .eq("id", userId)
  //       .single();

  //     // if (error && status !== 406) {
  //     //   setError(error);
  //     // }

  //     if (data) {
  //       setState({ ...state, profile: data });
  //     }
  //   } catch (error) {
  //     // alert(error.message);
  //   }
  // }

  // async function updateProfile({ username, website, avatar_url }) {
  //   try {
  //     const user = client.auth.user();

  //     const updates = {
  //       id: user.id,
  //       username,
  //       website,
  //       avatar_url,
  //       updated_at: new Date(),
  //     };

  //     const result = await client.from("profiles").upsert(updates, {
  //       returning: "minimal", // Don't return the value after inserting
  //     });

  //     setState({ ...state, profile: { ...state?.profile, username, website, avatar_url }});
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // useEffect(() => {
  //   if (!userId) {
  //     setState({ ...state, profile: null });
  //   } else {
  //     getProfile();
  //   }
  // }, [ userId ]);

  // useAuthStateChange((event, session) => {
  //   setState({ session, user: session?.user ?? null });
  // });

  // const data = {
  //   ...state,
  //   updateProfile
  // };

  //return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw Error("useAuth must be used within AuthProvider");
  return context;
}

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
  const [{ data: contextData }] = React.useContext(DataContext);
  const data = optData ?? contextData;
  const loc = useLocation();
  const path = optPath ?? loc.pathname;
  const [ locationTitle ] = path.split('/').slice(-1);
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
  }, [ data ]);
  let title = titles[locationTitle] || locationTitle;
  title = ignoredPathes.has(title) ? null : title;
  return title;
};
