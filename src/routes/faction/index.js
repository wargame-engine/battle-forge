import {
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from "components/dropdown";
import { DataContext } from "hooks";
import {
  get, isNil, set
} from "lodash";
import { useSnackbar } from "notistack";
import React, {
  useContext, useEffect, useState
} from "react";
import { useParams } from "react-router";
import Tour from "reactour";
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

const allSteps = [];
const steps = [
  [
    {
      selector: "#tab-0",
      content:
        "This is the module overview. This gives you background information and an overview of the game module.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-1",
      content:
        "This is the forces list. It contains information about how to organize your units and what limits exist.",
      stepInteraction: false,
    },
    {
      selector: ".org-card:first-of-type",
      content:
        "This is a force. It describes the minimum and maximum of each unit type allowed in it. It may also cost strategy points per round as described with the (number) after the name.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-2",
      content:
        "This is the units list. Units are grouped into categories which have limits to how many are allowed to be taken depending on the force type selected.",
      stepInteraction: false,
    },
    {
      selector: "#unit-filter",
      content:
        "Pressing this button will open the unit filter allowing you to filter units based on various properties.",
      stepInteraction: false,
    },
    {
      selector: ".unit-card-wrapper:first-of-type",
      content:
        "This is a unit. It has several pieces to it which will be described later.",
      stepInteraction: false,
    },
    {
      selector: ".unit-name:first-of-type",
      content:
        "This is the unit's name and points cost to include in your force.",
      stepInteraction: false,
    },
    {
      selector: ".unit-description:first-of-type",
      content:
        "This is the unit's description. This can describe what a unit is used for or any background flavor on the unit.",
      stepInteraction: false,
    },
    {
      selector: ".unit-stats:first-of-type",
      content:
        "This is the unit's stats. This contains a list of any models that start in the unit and their equipment and special rules.",
      stepInteraction: false,
    },
    {
      selector: ".unit-options:first-of-type",
      content:
        "This is the unit's options. Clicking this button will show any options the unit has such as adding new rules or exchanging weapons.",
      stepInteraction: false,
    },
    {
      selector: ".unit-weapons:first-of-type",
      content:
        "This is the unit's weapons. Clicking this button will show the list of weapons a unit could potentially have and all related stats and special rules on those weapons.",
      stepInteraction: false,
    },
    {
      selector: ".unit-specialrules:first-of-type",
      content:
        "This is the unit's special rules. Clicking this button will show all special rules text for any rules that could be on the models in this unit.",
      stepInteraction: false,
    },
    {
      selector: ".unit-keywords:first-of-type",
      content:
        "This is the unit's keywords. These are typically used to categorize units for being affected by certain special rules or abilities.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-3",
      content:
        "This is the powers list. It contains information about the powers available to this faction.",
      stepInteraction: false,
    },
    {
      selector: ".power-card:first-of-type",
      content:
        "This is a power. Powers are unique abilities that can be used by certain units in the game.",
      stepInteraction: false,
    },
    {
      selector: ".power-name:first-of-type",
      content:
        "This is the power's name. It also contains the charge level of the power required to use it.",
      stepInteraction: false,
    },
    {
      selector: ".power-flavor:first-of-type",
      content:
        "This is the power's flavor text. It also contains a brief amount of flavor about the power.",
      stepInteraction: false,
    },
    {
      selector: ".power-description:first-of-type",
      content:
        "This is the power's description text. It contains information about when the power can be used and any effects when used.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-4",
      content:
        "This is the strategies list. It contains information about the strategies available to this faction. They are grouped into the phase they can be used in.",
      stepInteraction: false,
    },
    {
      selector: ".strategy-card:first-of-type",
      content:
        "This is a strategy. Strategies are unique abilities that can be activated throughout the game.",
      stepInteraction: false,
    },
    {
      selector: ".strategy-name:first-of-type",
      content:
        "This is the strategy's name. It also contains the cost in strategy points required to use it.",
      stepInteraction: false,
    },
    {
      selector: ".strategy-flavor:first-of-type",
      content:
        "This is the strategy's flavor text. It also contains a brief amount of flavor about the strategy.",
      stepInteraction: false,
    },
    {
      selector: ".strategy-description:first-of-type",
      content:
        "This is the strategy's description text. It contains information about when the strategy can be used and any effects when used.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-5",
      content:
        "This is the legends list. It contains information about the legends available to this faction. They are grouped into their type.",
      stepInteraction: false,
    },
    {
      selector: ".legend-card:first-of-type",
      content:
        "This is a legend. Legends are unique and legendary items or individuals which can be taken in limited quantities.",
      stepInteraction: false,
    },
    {
      selector: ".legend-name:first-of-type",
      content:
        "This is the legend's name. It also contains the point cost required to take it.",
      stepInteraction: false,
    },
    {
      selector: ".legend-flavor:first-of-type",
      content:
        "This is the legend's flavor text. It also contains a brief amount of flavor about the legend.",
      stepInteraction: false,
    },
    {
      selector: ".legend-description:first-of-type",
      content:
        "This is the legend's description text. It contains information about when the strategy can be used and any effects when used.",
      stepInteraction: false,
    },
    {
      selector: ".legend-rules-text:first-of-type",
      content:
        "This is the legend's rule text. It contains any rules or weapon profiles related to the legend.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-6",
      content:
        "This is the focus list. It contains information about the focuses available to this faction.",
      stepInteraction: false,
    },
    {
      selector: ".focus-card:first-of-type",
      content:
        "This is a focus. Focuses are sub-factions of a particular faction and allow you to focus on a particular style of play.",
      stepInteraction: false,
    },
    {
      selector: ".focus-select:first-of-type",
      content:
        "Clicking this button will switch the faction display to this focus.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-7",
      content:
        "This is the weapon list. It contains information about the weapons available to this faction.",
      stepInteraction: false,
    },
    {
      selector: ".weapon-card:first-of-type",
      content:
        "This is a weapon. Weapons have several stats such as range and attacks described further in the core rules.",
      stepInteraction: false,
    },
  ],
  [
    {
      selector: "#tab-8",
      content:
        "This is the rule list. It contains information about the rules relevant to this faction.",
      stepInteraction: false,
    },
    {
      selector: ".rule-card:first-of-type",
      content:
        "This is a rule. It has rule text which describes when it is active.",
      stepInteraction: false,
    },
  ],
];

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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(get(appState, "rosterTab", 2));
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
        ] : [])
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
        {/* {!!faction.author && (
          <Dropdown>
            {({ handleClose, open, handleOpen, anchorElement }) => (
              <>
                <IconButton
                  aria-haspopup="true"
                  onMouseEnter={handleOpen}
                  onMouseLeave={handleClose} style={{ marginLeft: '5px' }}>
                  <PersonIcon />
                </IconButton>
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
                  <Typography sx={{ p: 1 }}>{`Written by ${faction.author}`}</Typography>
                </Popover>
              </>
            )}
          </Dropdown>
        )} */}
        {`${faction.name}${subfactionData.name ? ` - ${subfactionData.name}` : ""
          }`}
        <small style={{ fontSize: '1rem' }}> {faction.version ? `(${faction.version})` : ""}</small>
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
              value={activeTab}
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
        {/* <HideOnScroll>
          {({ show }) => (
            <SpeedDial
              ariaLabel="SpeedDial tooltip example"
              sx={{ position: "fixed", bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              onClose={(event) => {
                if (event.type === 'click' || event.type === 'blur') {
                  setDialOpen(false);
                }
              }}
              onOpen={(event) => {
                if (event.type === 'click') {
                  setDialOpen(true);
                }
              }}
              open={dialOpen && show}
              hidden={!show}
            >
              <SpeedDialAction
                tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                tooltipTitle="Refresh"
                color="primary"
                onClick={refreshFactionData}
                icon={<RefreshIcon />}
              />
              {userPrefs.developerMode && (
                <SpeedDialAction
                  tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                  tooltipTitle="Import"
                  color="primary"
                  onClick={handleClick}
                  icon={<UploadIcon />}
                />
              )}
              {!!game.reportUrl && (
                <SpeedDialAction
                  tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                  tooltipTitle="Issue"
                  onClick={() => window.open(game.reportUrl, "_blank")}
                  icon={<BugReportIcon />}
                />
              )}
              <SpeedDialAction
                tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                tooltipTitle="Top"
                color="primary"
                onClick={scrollToTop}
                icon={<KeyboardArrowUpIcon />}
              />
              {!!steps[activeTab] && (
                <SpeedDialAction
                  tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                  tooltipTitle="Help"
                  onClick={() => setIsTourOpen(true)}
                  icon={<FontAwesomeIcon icon={faQuestion} />}
                />
              )}
            </SpeedDial>
          )}
        </HideOnScroll> */}
        {/* <Collapse in={showFilter}>
          <div style={{ marginTop: "0.5em", marginBottom: 0 }}>
            <Form.Label style={{ marginBottom: 0 }}>
              <b>{`Focus:`}</b>
            </Form.Label>
            <Form inline>
              <FormGroup controlId="focus-filter">
                <Form.Check
                  type="checkbox"
                  label={"Filter by currently selected focus"}
                  title="Filter by focus"
                  style={{ marginRight: "5px" }}
                  color="primary"
                  checked={filterByFocus}
                  onChange={(event) => setFilterByFocus(!filterByFocus)}
                />
              </FormGroup>
            </Form>
            <Form.Label style={{ marginBottom: 0 }}>
              <b>{`Categories (OR):`}</b>
            </Form.Label>
            <Form inline>
              {Object.keys(categories).map((categoryKey) => {
                const category = categories[categoryKey];
                return (
                  <FormGroup controlId={`category-${category.name}`}>
                    <Form.Check
                      type="checkbox"
                      label={category.name}
                      title="Update this faction from file."
                      style={{ marginRight: "5px" }}
                      color="primary"
                      checked={unitFilter.categories.has(categoryKey)}
                      onChange={(event) =>
                        toggleCategoryFilter(event, categoryKey)
                      }
                    />
                  </FormGroup>
                );
              })}
            </Form>
            <Form.Label style={{ marginBottom: 0 }}>
              <b>{`Keywords (AND):`}</b>
            </Form.Label>
            <Form inline>
              {keywords.map((keyword) => (
                <FormGroup check inline controlId={`keyword-${keyword}`}>
                  <Form.Check
                    inline
                    type="checkbox"
                    label={keyword}
                    title="Update this faction from file."
                    style={{ marginRight: "5px" }}
                    color="primary"
                    checked={unitFilter.keywords.has(keyword)}
                    onChange={(event) => toggleKeywordFilter(event, keyword)}
                  />
                </FormGroup>
              ))}
            </Form>
          </div>
        </Collapse> */}
      </Box>
      <div>
        {/* {Object.values(TABS).map((pane, index) => (
          <div
            id={`tab-${index}`}
            tabId={index}
            style={{ display: activeTab === index ? "" : "none" }}
          >
            {pane}
          </div>
        ))} */}
        {Object.values(TABS)[activeTab]}
      </div>
      <Tour
        accentColor={`rgb(57, 110, 158)`}
        className="tour"
        key={activeTab}
        steps={[...allSteps, ...(steps[activeTab] || [])]}
        isOpen={isTourOpen}
        onRequestClose={() => {
          setIsTourOpen(false);
        }}
        rounded={5}
        onAfterOpen={(target) => (document.body.style.overflowY = "hidden")}
        onBeforeClose={(target) => (document.body.style.overflowY = "auto")}
      />
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
