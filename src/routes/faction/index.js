import {
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from "components/dropdown";
import { DataContext, useModal } from "hooks";
import useQueryParams from 'hooks/use-query-params';
import {
  get, isNil, set
} from "lodash";
import { useSnackbar } from "notistack";
import React, {
  useContext, useEffect, useState
} from "react";
import { useParams } from "react-router";
import { DataAPI, mergeGlobalData } from "utils/data";
import { readFileContent } from "utils/files";
import { Focus } from "./focus";
import { Organization } from "./organization";
import { Overview } from "./overview";
import { Powers } from "./powers";
import { Relics } from "./relics";
import { Rules } from "./rules";
import { Strategies } from "./strategies";
import { Units } from "./units";
import { Weapons } from "./weapons";
import { ShowInfo } from "routes/modals";

export default React.memo((props) => {
  const { factionName, gameName } = useParams();
  const [
    {
      data: someData,
      coreData,
      fetchFaction,
      setData,
      isLoading,
      refreshFaction,
      appState,
      setAppState,
      userPrefs
    },
  ] = useContext(DataContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const nameFilter = appState?.searchText;
  let [ activeTab, setActiveTab ] = useQueryParams("tab", 2);
  const [filterByFocus, ] = useState(true);
  const [subfaction, setSubfaction] = useState("none");
  const [retryCount, setRetryCount] = useState(0);
  const game = get(someData, `gameData.games[${gameName}]`, {});
  const globalData = mergeGlobalData(game, someData);
  const data = DataAPI(game, globalData);
  const faction = filterByFocus
    ? data.getFactionWithSubfaction(factionName, subfaction)
    : data.getFaction(factionName);
  const buyLinks = get(faction, "buyLinks", []);
  const rawFaction = data.getRawFaction(factionName);
  const DEFAULT_FILTER = {
    keywords: new Set(),
    categories: new Set(),
  };
  const [unitFilter, ] = useState(DEFAULT_FILTER);
  const powers =
    !isNil(rawFaction.powers) && Object.keys(rawFaction.powers).length;
  const subfactionData = data.getSubfaction(factionName, subfaction);
  const { enqueueSnackbar } = useSnackbar();
  const fileDialog = React.useRef();
  const subfactions = Object.values(faction.subfactions || []);
  useEffect(() => {
    if (
      !get(
        someData,
        `gameData.games[${gameName}].factions[${factionName}].units`
      ) &&
      !isLoading &&
      retryCount < 5
    ) {
      setRetryCount(retryCount + 1);
      fetchFaction(gameName, factionName);
    }
  }, [coreData, factionName, fetchFaction, gameName, isLoading, retryCount, someData]);
  const handleClick = () => {
    fileDialog.current.click();
  };
  const setCustomData = (passedData) => {
    const newGameData = {
      ...coreData,
      customData: {
        ...get(someData, "customData", {}),
        ...passedData,
      },
    };
    setData(newGameData);
  };
  const refreshFactionData = () => {
    refreshFaction(gameName, factionName)
      .then(() => {
        enqueueSnackbar(`Faction data successfully updated.`, {
          appearance: "success",
        });
      })
      .catch((error) => {
        enqueueSnackbar(`Faction failed to fetch factions. ${error.message}`, {
          appearance: "error",
        });
      });
  };
  const uploadFaction = (event) => {
    event.preventDefault();
    const file = get(event, "target.files[0]");
    if (file) {
      readFileContent(file)
        .then((content) => {
          let armyObject = {};
          try {
            armyObject = JSON.parse(content);
          } catch (e) {
            return Promise.reject(e);
          }
          if (armyObject.games) {
            const newArmyData = {
              ...armyObject,
            };
            setCustomData(newArmyData);
            enqueueSnackbar(`Core data successfully imported.`, {
              appearance: "success",
            });
          } else if (armyObject.factions) {
            const newData = set(
              { ...get(someData, "customData", {}) },
              `games[${gameName}]`,
              {
                ...get(someData, `customData.games[${gameName}]`),
                ...armyObject,
              }
            );
            setCustomData(newData);
            enqueueSnackbar(`Core data successfully imported.`, {
              appearance: "success",
            });
          } else {
            // const hasArmy = nope.factions[armyObject.id];
            const factionId = faction.id;
            const newData = set(
              { ...get(someData, "customData", {}) },
              `games[${gameName}].factions[${factionId}]`,
              {
                ...get(
                  someData,
                  `customData.games[${gameName}].factions[${factionId}]`,
                  {}
                ),
                ...armyObject,
                id: faction.id,
                color: faction.color,
              }
            );
            setCustomData(newData);
            enqueueSnackbar(`${armyObject.name} successfully imported.`, {
              appearance: "success",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`Faction failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
  };
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
    setAppState({ ...appState, rosterTab: tab });
  };
  const handleChange = (event, newValue) => {
    toggle(newValue);
  };
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [showShowInfo, hideShowInfo] = useModal(
    ({ extraProps }) => (
      <ShowInfo
        hideModal={hideShowInfo}
        contextTitle={'Faction Details'}
        author={faction?.author}
        version={faction?.version}
        id={faction?.id}
        {...extraProps}
      />
    ),
    []
  );
  React.useEffect(() => {
    setAppState({
      enableSearch: true,
      contextActions: [
        {
          name: 'Refresh',
          icon: <RefreshIcon />,
          onClick: () => refreshFactionData()
        },
        ...(!!userPrefs.developerMode ? [
          {
            name: 'Import',
            icon: <UploadIcon />,
            onClick: () => handleClick()
          }
        ] : []),
        ...(!!game.reportUrl ? [
          {
            name: 'Report',
            icon: <BugReportIcon />,
            onClick: () => window.open(game.reportUrl, "_blank")
          }
        ] : []),
        {
          name: 'Details',
          icon: <InfoIcon />,
          onClick: () => showShowInfo()
        }
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ userPrefs.developerMode ]);
  //const [dialOpen, setDialOpen] = React.useState(false);
  if (
    !someData ||
    !faction ||
    !faction.name ||
    !get(someData, `gameData.games[${gameName}].factions[${factionName}].units`)
  ) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <CustomCircularProgress />
        <input
          id="file-input"
          type="file"
          name="name"
          multiple
          ref={fileDialog}
          onChange={uploadFaction}
          style={{ height: "0", overflow: "hidden", display: "none" }}
        />
      </Box>
    );
  }
  let TABS = {
    Overview: (
      <Overview data={data} faction={faction} subfaction={subfactionData} />
    ),
    Forces: (
      <Organization
        data={data}
        faction={faction}
        subfaction={subfactionData}
        nameFilter={nameFilter}
      />
    ),
    Units: (
      <Units
        data={data}
        faction={faction}
        subfactionId={subfaction}
        setData={setData}
        rawData={someData}
        userPrefs={userPrefs}
        nameFilter={nameFilter}
        unitFilter={unitFilter}
        filterByFocus={filterByFocus}
      />
    ),
    Powers: <Powers data={data} faction={faction} nameFilter={nameFilter} />,
    Strategies: (
      <Strategies data={data} faction={faction} nameFilter={nameFilter} />
    ),
    Legends: <Relics data={data} faction={faction} nameFilter={nameFilter} />,
    Focus: (
      <Focus
        data={data}
        faction={faction}
        nameFilter={nameFilter}
        subfactions={subfactions}
        setSubfaction={setSubfaction}
        subfaction={subfaction}
      />
    ),
    Weapons: <Weapons data={data} faction={faction} nameFilter={nameFilter} />,
    Rules: <Rules data={data} faction={faction} nameFilter={nameFilter} />,
  };
  const isModified = Object.values(
    get(someData, `customData.games[${gameName}].factions[${factionName}]`, {})
  ).length;
  const hiddenTabs = new Set([]);
  if (!powers) {
    hiddenTabs.add("Powers");
  }
  if (!subfactions.length) {
    hiddenTabs.add("Focus");
  }
  if (!buyLinks.length) {
    hiddenTabs.add("Buy");
  }
  return (
    <Container>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        {!!isModified && (
          <Dropdown>
            {({ handleClose, open, handleOpen, anchorElement }) => (
              <>
                <span
                  aria-haspopup="true"
                  onMouseEnter={handleOpen}
                  onMouseLeave={handleClose} style={{ marginRight: '5px' }}>
                  <FontAwesomeIcon
                    size="sm"
                    icon={faExclamationCircle}
                  />
                </span>
                <Popover
                  variant="warning"
                  id="mouse-over-popover"
                  sx={{
                    pointerEvents: 'none',
                  }}
                  open={open}
                  anchorEl={anchorElement}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  onClose={handleClose}
                  disableRestoreFocus
                >
                  <Typography sx={{ p: 1 }}>Warning: Data Is Modified Locally</Typography>
                </Popover>
              </>
            )}
          </Dropdown>
        )}
        {`${faction.name}${subfactionData.name ? ` - ${subfactionData.name}` : ""}`}
        {/* <small style={{ fontSize: '1rem' }}> {faction.version ? `(${faction.version})` : ""}</small> */}
      </Typography>
      <Box
        className="sticky"
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          top: isMobile ? "56px" : "64px",
        }}
      >
        <Box sx={{ width: "100%", bgcolor: "background.paper", pb: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="scrollable"
              value={parseInt(activeTab) || 0}
              onChange={handleChange}
              aria-label="The Tabs"
            >
              {Object.keys(TABS).map((tab, index) => (
                <Tab
                  style={{ display: hiddenTabs.has(tab) ? "none" : "" }}
                  sx={{ textTransform: "none" }}
                  label={tab}
                  {...a11yProps(0)}
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Box>
      <div>
        {Object.values(TABS)[activeTab]}
      </div>
      <input
        id="file-input"
        type="file"
        name="name"
        multiple
        ref={fileDialog}
        onChange={uploadFaction}
        style={{ height: "0", overflow: "hidden", display: "none" }}
      />
    </Container>
  );
});
