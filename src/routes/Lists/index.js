import {
  faArrowLeft, faArrowRight, faBook, faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Add as AddIcon, MoreVert as MoreVertIcon } from "@mui/icons-material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert, Box, Card,
  CardContent,
  CardHeader, FormGroup, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu,
  MenuItem, ScopedCssBaseline, Stack, Typography, useTheme
} from "@mui/material";
import Container from "@mui/material/Container";
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { InputNumber } from "components/bootstrap";
import CustomCircularProgress from "components/CustomCircularProgress";
import { Dropdown } from 'components/dropdown';
import { PrintView } from "components/print";
import { DataContext, useModal } from "hooks";
import {
  every, find, get, isEqual, isNil, sum, toNumber, uniqBy
} from "lodash";
import ChessPawnIcon from "mdi-material-ui/ChessPawn";
import { useSnackbar } from "notistack";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { useReactToPrint } from "react-to-print";
import { UpdateList } from 'routes/factions/modals';
import styled from "styled-components";
import { getTextColor, hexToRgb } from "utils/colors";
import { BASE_THEME } from 'utils/constants';
import { DataAPI, mergeGlobalData } from "utils/data";
import { downloadFile, readFileContent } from "utils/files";
import { formatLevel } from "utils/format";
import { insert } from "utils/misc";
import {
  AddForce, AddLegend, AddUnit,
  ChooseSubFaction,
  EditUnit, EditUnitCampaign, ViewActionReference, ViewLegend, ViewPowers, ViewStrategies, ViewUnit
} from "./modals";

const PrintStyles = styled.div`

`;

const pageStyle = `
`;

export default React.memo((props) => {
  const { listId } = useParams();
  const [
    {
      data: someData,
      coreData,
      fetchFaction,
      setData,
      isLoading,
      fetchGame,
      userPrefs,
      setAppState
    },
  ] = useContext(DataContext);
  const list = get(someData, `lists[${listId}]`, {});
  const gameName = get(list, 'gameId');
  const game = get(someData, `gameData.games[${gameName}]`, {});
  const gameType = get(game, "gameType", "battle");
  const isSkirmish = gameType === "skirmish";
  const globalData = mergeGlobalData(game, someData);
  const data = DataAPI(game, globalData);
  const lists = get(someData, `lists[${gameName}]`, {});
  const fileDialog = React.useRef();
  const orgs = data.getRawOrganizations();
  const { enqueueSnackbar } = useSnackbar();
  const shouldStartEditMode = gameName && !get(list, "forces", []).length;
  const [editMode, setEditMode] = useState(shouldStartEditMode);
  const [showReserves, setShowReserves] = useState({});
  const theme = useTheme();
  const componentRef = useRef();
  const doPrint = useReactToPrint({
    pageStyle: pageStyle,
    content: () => componentRef.current,
  });
  const handlePrint = () => {
    doPrint();
  };
  const LIST_TYPES = [
    { label: "Competitive", value: "competitive" },
    { label: "Narrative", value: "narrative" },
    { label: "Campaign", value: "campaign" },
  ];
  const calculateUnitPoints = React.useCallback((
    unit,
    faction,
    options,
    selectedOptions,
    selectedPerks,
    selectedSetbacks
  ) => {
    let cost = data.getUnitPoints(unit, faction);
    let unitModels = sum(
      get(unit, "models", []).map((model) => toNumber(get(model, "min", 0)))
    );
    // First scan for any new models in the unit
    options.forEach((option, idx) => {
      option.list.forEach((item, itemIdx) => {
        const selected = toNumber(
          get(selectedOptions, `[${idx}][${itemIdx}]`, 0)
        );
        if (item.models && selected) {
          unitModels += selected;
        }
      });
    });
    options.forEach((option, idx) => {
      option.list.forEach((item, itemIdx) => {
        const selected = get(selectedOptions, `[${idx}][${itemIdx}]`);
        if (item.all && selected) {
          cost += item.points * unitModels;
        } else if (selected) {
          cost += item.points * selected;
        }
      });
    });
    selectedPerks.forEach((perk) => {
      cost += data.resolvePoints(
        get(data.getPerk(faction, perk), "points", 0),
        { unit }
      );
    });
    selectedSetbacks.forEach((setback) => {
      cost += data.resolvePoints(
        get(data.getSetback(faction, setback), "points", 0),
        { unit }
      );
    });
    return cost;
  }, [data]);
  const mapForces = React.useCallback((force, forceId) => {
    const forceFaction = data.getFactionWithSubfaction(
      force.factionId,
      force.subFactionId || "none"
    );
    if (!get(forceFaction, "units")) {
      return force;
    }
    const forceReserves = get(list, `reserves[${force.factionId}]`, []);
    const availablePerks = new Set(
      data.getPerks(forceFaction).map((perk) => perk.id)
    );
    const availableSetbacks = new Set(
      data.getSetbacks(forceFaction).map((setback) => setback.id)
    );
    const forceUnits = get(force, "units", []);
    const processUnits = (daUnits) => {
      return daUnits
        .filter((theUnit) => !!data.getUnit(forceFaction, theUnit.id))
        .map((theUnit, unitId) => {
          const unitKey = theUnit.id;
          const unit = data.getUnit(forceFaction, unitKey);
          const selectedOptions = get(theUnit, `selectedOptions`, []);
          // Get raw option list
          let optionList = data.getOptionsList(unit, forceFaction);
          const modelCounts = {};
          get(unit, "models", []).forEach((model, index) => {
            const count = model.min || 0;
            if (!isNil(modelCounts[index])) {
              modelCounts[index] += count;
            } else {
              modelCounts[index] = count;
            }
          });
          optionList.forEach((option, idx) => {
            option.list.forEach((optItem, optIdx) => {
              const selections = get(
                selectedOptions,
                `[${idx}][${optIdx}]`,
                0
              );
              const optModels = get(optItem, "modelIds", [])
                .flat()
                .map((model) => model.id || model);
              optModels.forEach((model) => {
                if (!isNil(modelCounts[model])) {
                  modelCounts[model] += selections;
                } else {
                  modelCounts[model] = selections;
                }
              });
            });
          });
          const oldModelCounts = { ...modelCounts };
          optionList.forEach((option, idx) => {
            option.list.forEach((optItem, optIdx) => {
              const selections = get(
                selectedOptions,
                `[${idx}][${optIdx}]`,
                0
              );
              const optReplacedModels = get(optItem, "replacedModel", [])
                .flat()
                .map((model) => model.id || model);
              optReplacedModels.forEach((model) => {
                if (!isNil(modelCounts[model])) {
                  modelCounts[model] -= selections;
                } else {
                  modelCounts[model] = -selections;
                }
              });
            });
          });
          // Adjust for model counts
          optionList = data.getOptionsList(unit, forceFaction, {
            selectedModels: modelCounts,
            selectedModelsRaw: oldModelCounts,
          });
          const selectedModels = uniqBy(
            [
              ...optionList.map((option, idx) => {
                return [
                  ...option.list
                    .filter((optItem, optIdx) => {
                      const selections = get(
                        selectedOptions,
                        `[${idx}][${optIdx}]`,
                        0
                      );
                      return selections > 0;
                    })
                    .map((opt) => get(opt, "model", []).flat())
                    .flat(),
                ];
              }, []),
            ].flat(),
            (item) => item.id || item
          );
          const unitModels = [
            ...get(unit, "models", []),
            ...data.getModelList(selectedModels, forceFaction),
          ];
          const selectedPerks = get(theUnit, "selectedPerks", []).filter(
            (perk) => availablePerks.has(perk)
          );
          const selectedSetbacks = get(
            theUnit,
            "selectedSetbacks",
            []
          ).filter((setback) => availableSetbacks.has(setback));
          const thing = {
            ...unit,
            customName: theUnit.customName,
            experience: theUnit.experience,
            modelCounts,
            selectedOptionsList: optionList
              .map((option, idx) => {
                return {
                  ...option,
                  list: option.list
                    .map((optItem, optIdx) => {
                      const selections = get(
                        selectedOptions,
                        `[${idx}][${optIdx}]`,
                        0
                      );
                      return {
                        ...optItem,
                        text:
                          optItem.text +
                          ` (${selections} ${selections > 1 ? "selections" : "selection"
                          })`,
                      };
                    })
                    .filter((optItem, optIdx) => {
                      const selections = get(
                        selectedOptions,
                        `[${idx}][${optIdx}]`,
                        0
                      );
                      return selections > 0;
                    }),
                };
              })
              .filter((option) => option.list.length),
            selectedModels,
            selectedWeapons: uniqBy(
              [
                ...unitModels
                  .map((model) => get(model, "weapons", []))
                  .flat(),
                ...optionList.map((option, idx) => {
                  return [
                    ...option.list
                      .filter((optItem, optIdx) => {
                        const selections = get(
                          selectedOptions,
                          `[${idx}][${optIdx}]`,
                          0
                        );
                        return selections > 0;
                      })
                      .map((opt) => get(opt, "weapons", []).flat())
                      .flat(),
                  ];
                }, []),
              ].flat(),
              (item) => item.id || item
            ),
            selectedRules: uniqBy(
              [
                ...get(unit, "rules", []),
                ...unitModels.map((model) => get(model, "rules", [])).flat(),
                ...optionList.map((option, idx) => {
                  return [
                    ...option.list
                      .filter((optItem, optIdx) => {
                        const selections = get(
                          selectedOptions,
                          `[${idx}][${optIdx}]`,
                          0
                        );
                        return selections > 0;
                      })
                      .map((opt) => get(opt, "rules", []).flat())
                      .flat(),
                  ];
                }, []),
              ].flat(),
              (item) => item.id || item
            ),
            id: unitId,
            optionList,
            selectedPerks,
            selectedSetbacks,
            totalModels: sum(Object.values(modelCounts)),
            selectedOptions: optionList.map((option, idx) => {
              if (option.list) {
                const indValue = get(selectedOptions, `[${idx}]`, []);
                return option.list.map((opt, optIdx) =>
                  !isNil(indValue[optIdx]) ? indValue[optIdx] : 0
                );
              }
              return !isNil(selectedOptions[idx]) ? selectedOptions[idx] : [];
            }),
            powerSpecialty: theUnit?.powerSpecialty
          };
          thing.points = calculateUnitPoints(
            thing,
            forceFaction,
            optionList,
            selectedOptions,
            selectedPerks,
            selectedSetbacks
          );
          return thing;
        });
    };
    return {
      ...force,
      ...get(orgs, `[${force.id}]`, {}),
      faction: forceFaction,
      legends: get(force, "legends", []).map((theLegend, relicId) => {
        const legendKey = theLegend.id;
        const relic = data.getRelic(forceFaction, legendKey);
        return {
          ...relic,
          id: relicId,
          points: data.getRelicCost(relic, forceFaction),
        };
      }),
      units: processUnits(forceUnits),
      reserves: processUnits(forceReserves),
    };
  }, [calculateUnitPoints, data, list, orgs]);
  const forces = React.useMemo(() => get(list, "forces", [])
    .filter(
      (force) =>
        !!data.getFactionWithSubfaction(
          force.factionId,
          force.subFactionId || "none"
        )
    )
    .map(mapForces), [data, list, mapForces]);
  const forceFactionIds = get(list, "forces", [])
    .map((force) => force.factionId)
    .join(",");
  useEffect(() => {
    if (!get(someData, `gameData.games[${gameName}].factions`)) {
      fetchGame(gameName);
    }
    // Use a trick to only fetch the first missing faction at a time
    forces
      .filter((force) => {
        const factionName = force.factionId;
        const faction = get(
          someData,
          `gameData.games[${gameName}].factions[${factionName}]`
        );
        return !get(faction, "units");
      })
      .slice(0, 1)
      .forEach((force) => {
        const factionName = force.factionId;
        const faction = get(
          someData,
          `gameData.games[${gameName}].factions[${factionName}]`
        );
        if (!get(faction, "units") && !isLoading) {
          fetchFaction(gameName, factionName);
        }
      });
  }, [coreData, forces.length, forceFactionIds, someData, gameName, forces, fetchGame, isLoading, fetchFaction]);
  const [showAddForce, hideAddForce] = useModal(
    ({ extraProps }) => (
      <AddForce
        list={list}
        hideModal={hideAddForce}
        data={data}
        userPrefs={userPrefs}
        addForce={addForce}
        forces={forces}
      />
    ),
    [forces, list]
  );
  useEffect(() => {
    setShowReserves({});
  }, [forces.length]);
  useEffect(() => {
    if (shouldStartEditMode) {
      showAddForce();
    }
  }, [shouldStartEditMode, showAddForce]);
  const allFactionsLoaded = every(forces, (force) => {
    const factionName = force.factionId;
    const faction = get(
      someData,
      `gameData.games[${gameName}].factions[${factionName}]`
    );
    const factionUnits = get(faction, "units");
    const factionUrl = get(faction, "url");
    return !!factionUnits || !factionUrl;
  });
  const downloadList = () => {
    downloadFile(
      JSON.stringify(
        {
          ...list,
        },
        null,
        2
      ),
      "data:text/json",
      `${list.name}.json`
    );
  };
  const uploadList = (event) => {
    event.preventDefault();
    const file = get(event, "target.files[0]");
    if (file) {
      readFileContent(file)
        .then((content) => {
          let listObject = {};
          try {
            listObject = JSON.parse(content);
          } catch (e) {
            return Promise.reject(e);
          }
          if (listObject.forces) {
            const newArmyData = {
              ...listObject,
            };
            updateList(newArmyData);
            enqueueSnackbar(`List successfully imported.`, {
              appearance: "success",
            });
          }
        })
        .catch((error) => {
          enqueueSnackbar(`List failed to import. ${error.message}`, {
            appearance: "error",
          });
        });
    }
    fileDialog.current.value = null;
  };
  const setLists = (listData) => {
    const newGameData = {
      ...someData,
      lists: {
        ...get(someData, "lists", {}),
        ...listData
      },
    };
    setData(newGameData);
  };
  const updateList = (newData) => {
    setLists({
      ...lists,
      [listId]: {
        ...list,
        ...newData,
      },
    });
  };
  const renderPrintMode = () => {
    const theme = createTheme(BASE_THEME);
    return (
      <ThemeProvider theme={theme}>
        <ScopedCssBaseline>
          <PrintView list={list} data={data} forces={forces} />
        </ScopedCssBaseline>
      </ThemeProvider>
    )
  };
  const updateForce = (forceId, newData) => {
    const mappedForces = get(list, "forces", []).map((force, index) =>
      index === forceId ? { ...force, ...newData } : force
    );
    updateList({
      forces: mappedForces,
    });
  };
  // const setFaction = (forceId, factionId) => {
  //   updateForce(forceId, {
  //     factionId,
  //   });
  // };
  const setSubFaction = (forceId, subFactionId) => {
    const factionId = get(list, `forces[${forceId}].factionId`, []);
    const forceFaction = data.getFactionWithSubfaction(
      factionId,
      subFactionId || "none"
    );
    const forceUnits = get(list, `forces[${forceId}].units`, []);
    const forceLegends = get(list, `forces[${forceId}].legends`, []);
    updateForce(forceId, {
      subFactionId,
      legends: forceLegends.filter(
        (relic) => !!data.getRelic(forceFaction, relic.id)
      ),
      units: forceUnits.filter((unit) => !!data.getUnit(forceFaction, unit.id)),
    });
  };
  const addLegend = (forceId, legend) => {
    let newArr = [];
    newArr = [...get(list, `forces[${forceId}].legends`, []), legend];
    updateForce(forceId, {
      legends: newArr,
    });
  };
  const addUnitToForce = (forceId, unit, index) => {
    const showingReserves = !!showReserves[forceId];
    const theForce = get(list, `forces[${forceId}]`, []);
    const factionId = get(theForce, "factionId");
    if (showingReserves) {
      let newArr = [];
      if (index) {
        newArr = insert(get(list, `reserves[${factionId}]`, []), index, unit);
      } else {
        newArr = [...get(list, `reserves[${factionId}]`, []), unit];
      }
      updateList({
        reserves: {
          ...get(list, `reserves`, []),
          [factionId]: newArr,
        },
      });
    } else {
      let newArr = [];
      if (index) {
        newArr = insert(get(list, `forces[${forceId}].units`, []), index, unit);
      } else {
        newArr = [...get(list, `forces[${forceId}].units`, []), unit];
      }
      updateForce(forceId, {
        units: newArr,
      });
    }
  };
  const updateUnit = (forceId, unitId, newData) => {
    const showingReserves = !!showReserves[forceId];
    const theForce = get(list, `forces[${forceId}]`, []);
    const factionId = get(theForce, "factionId");
    const forceReserves = get(list, `reserves[${factionId}]`, []);
    if (showingReserves) {
      updateList({
        reserves: {
          ...get(list, `reserves`, []),
          [factionId]: forceReserves.map((unit, index) =>
            index === unitId ? { ...unit, ...newData } : unit
          ),
        },
      });
    } else {
      updateForce(forceId, {
        units: get(list, `forces[${forceId}].units`, []).map((unit, index) =>
          index === unitId ? { ...unit, ...newData } : unit
        ),
      });
    }
  };
  const getUnit = (forceId, unitId) => {
    const showingReserves = !!showReserves[forceId];
    if (showingReserves) {
      return get(forces, `[${forceId}].reserves[${unitId}]`, {});
    } else {
      return get(forces, `[${forceId}].units[${unitId}]`, {});
    }
  };
  const deleteUnit = (forceId, unitId) => {
    const showingReserves = !!showReserves[forceId];
    const theForce = get(list, `forces[${forceId}]`, []);
    const factionId = get(theForce, "factionId");
    const forceReserves = get(list, `reserves[${factionId}]`, []);
    if (showingReserves) {
      updateList({
        reserves: {
          ...get(list, `reserves`, []),
          [factionId]: forceReserves.filter((unit, idx) => idx !== unitId),
        },
      });
    } else {
      updateForce(forceId, {
        units: get(list, `forces[${forceId}].units`, []).filter(
          (unit, idx) => idx !== unitId
        ),
      });
    }
  };
  const moveUnitReserves = (forceId, unitId) => {
    const theForce = get(list, `forces[${forceId}]`, []);
    const theUnit = get(list, `forces[${forceId}].units[${unitId}]`, []);
    const factionId = get(theForce, "factionId");
    const forceReserves = get(list, `reserves[${factionId}]`, []);
    updateList({
      reserves: {
        ...get(list, `reserves`, []),
        [factionId]: [...forceReserves, theUnit],
      },
      forces: get(list, "forces", []).map((force, index) =>
        index === forceId
          ? {
            ...force,
            units: get(list, `forces[${forceId}].units`, []).filter(
              (unit, idx) => idx !== unitId
            ),
          }
          : force
      ),
    });
  };
  const moveUnitForce = (forceId, unitId) => {
    const theForce = get(list, `forces[${forceId}]`, []);
    const factionId = get(theForce, "factionId");
    const theUnit = get(list, `reserves[${factionId}][${unitId}]`, []);
    const forceReserves = get(list, `reserves[${factionId}]`, []);
    updateList({
      forces: get(list, "forces", []).map((force, index) =>
        index === forceId
          ? {
            ...force,
            units: [...get(list, `forces[${forceId}].units`, []), theUnit],
          }
          : force
      ),
      reserves: {
        ...get(list, `reserves`, []),
        [factionId]: forceReserves.filter((unit, idx) => idx !== unitId),
      },
    });
  };
  const deleteLegend = (forceId, legendId) => {
    updateForce(forceId, {
      legends: get(list, `forces[${forceId}].legends`, []).filter(
        (unit, idx) => idx !== legendId
      ),
    });
  };
  const setUnitOptions = (forceId, unitId, data) => {
    updateUnit(forceId, unitId, {
      selectedOptions: data,
    });
  };
  const setUnitPowerSpecialty = (forceId, unitId, data) => {
    updateUnit(forceId, unitId, {
      powerSpecialty: data,
    });
  };
  const setUnitPerks = (forceId, unitId, data) => {
    updateUnit(forceId, unitId, {
      selectedPerks: data,
    });
  };
  const setUnitSetbacks = (forceId, unitId, data) => {
    updateUnit(forceId, unitId, {
      selectedSetbacks: data,
    });
  };
  const setUnitName = (forceId, unitId, data) => {
    updateUnit(forceId, unitId, {
      customName: data,
    });
  };
  const addForce = (force) => {
    updateList({
      forces: [...get(list, "forces", []), force],
    });
  };
  const deleteForce = (id) => {
    updateList({
      forces: get(list, "forces", []).filter((force, index) => index !== id),
    });
  };
  const [showChooseSubfaction, hideChooseSubfaction] = useModal(
    ({ extraProps }) => (
      <ChooseSubFaction
        hideModal={hideChooseSubfaction}
        data={data}
        setSubFaction={setSubFaction}
        {...extraProps}
      />
    ),
    [forces, list]
  );
  const [showAddUnit, hideAddUnit] = useModal(
    ({ extraProps }) => (
      <AddUnit
        hideModal={hideAddUnit}
        data={data}
        addUnit={addUnitToForce}
        {...extraProps}
      />
    ),
    [forces, list]
  );
  const [showAddLegend, hideAddLegend] = useModal(
    ({ extraProps }) => (
      <AddLegend
        hideModal={hideAddLegend}
        list={list}
        data={data}
        addLegend={addLegend}
        {...extraProps}
      />
    ),
    [forces, list]
  );
  const [showEditUnit, hideEditUnit] = useModal(
    ({ extraProps }) => (
      <EditUnit
        hideModal={hideEditUnit}
        data={data}
        list={list}
        forces={forces}
        setUnitName={setUnitName}
        setUnitPowerSpecialty={setUnitPowerSpecialty}
        setUnitOptions={setUnitOptions}
        getUnit={getUnit}
        {...extraProps}
      />
    ),
    [list, forces]
  );
  const [showEditUnitCampaign, hideEditUnitCampaign] = useModal(
    ({ extraProps }) => (
      <EditUnitCampaign
        editMode={editMode}
        hideModal={hideEditUnitCampaign}
        data={data}
        list={list}
        forces={forces}
        getUnit={getUnit}
        updateUnit={updateUnit}
        setUnitPerks={setUnitPerks}
        setUnitSetbacks={setUnitSetbacks}
        {...extraProps}
      />
    ),
    [list, forces]
  );
  const [showViewUnit, hideViewUnit] = useModal(
    ({ extraProps }) => (
      <ViewUnit
        hideModal={hideViewUnit}
        data={data}
        getUnit={getUnit}
        {...extraProps}
      />
    ),
    [forces, list]
  );
  const [showViewLegend, hideViewLegend] = useModal(
    ({ extraProps }) => (
      <ViewLegend hideModal={hideViewLegend} data={data} {...extraProps} />
    ),
    [forces, list]
  );
  const [showViewStrategies, hideViewStrategies] = useModal(
    ({ extraProps }) => (
      <ViewStrategies
        hideModal={hideViewStrategies}
        data={data}
        {...extraProps}
      />
    ),
    [forces, list]
  );
  const [showViewPowers, hideViewPowers] = useModal(
    ({ extraProps }) => (
      <ViewPowers hideModal={hideViewPowers} data={data} {...extraProps} />
    ),
    [forces, list]
  );
  const [showViewActionReference, hideViewActionReference] = useModal(
    ({ extraProps }) => (
      <ViewActionReference
        hideModal={hideViewActionReference}
        data={data}
        isSkirmish={isSkirmish}
        {...extraProps}
      />
    ),
    [forces, list, isSkirmish]
  );
  const [showUpdateList, hideUpdateList] = useModal(
    ({ extraProps }) => (
      <UpdateList
        hideModal={hideUpdateList}
        lists={lists}
        listId={listId}
        data={data}
        updateList={(listId, data) => {
          updateList(data);
        }}
        {...extraProps}
      />
    ),
    [forces, lists]
  );
  React.useEffect(() => {
    setAppState({
      contextActions: [
        ...(!editMode ? [
          {
            name: 'Edit',
            icon: <EditIcon />,
            onClick: () => setEditMode(true)
          }
        ] : []),
        ...(!!editMode ? [
          {
            name: 'View',
            icon: <VisibilityIcon />,
            onClick: () => setEditMode(false)
          }
        ] : []),
        ...(!!editMode ? [
          {
            name: 'Add',
            icon: <AddIcon />,
            onClick: () => showAddForce()
          }
        ] : []),
        ...(!editMode ? [
          {
            name: 'Reference',
            icon: <MenuBookIcon />,
            onClick: () => showViewActionReference()
          }
        ] : []),
        {
          name: 'Download',
          icon: <DownloadIcon />,
          onClick: () => downloadList()
        },
        {
          name: 'Print',
          icon: <PrintIcon />,
          onClick: () => handlePrint()
        },
        {
          name: 'Settings',
          icon: <SettingsIcon />,
          onClick: () => showUpdateList()
        }
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);
  if (!someData || !allFactionsLoaded) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <CustomCircularProgress />
      </Box>
    );
  }
  const listType = list.type || "competitive";
  const listTypeName =
    (find(LIST_TYPES, (myType) => myType.value === list.type) || {}).label ||
    "Competitive";
  const totalForcePoints = sum(
    forces.map((force) => {
      const unitPoints = sum(
        get(force, "units", []).map((unit) => unit.points)
      );
      const legendPoints = sum(
        get(force, "legends", []).map((legend) => legend.points)
      );
      return unitPoints + legendPoints;
    })
  );
  const totalForceReservePoints = sum(
    forces.map((force) => {
      const unitPoints = sum(
        get(force, "reserves", []).map((unit) => unit.points)
      );
      return unitPoints;
    })
  );
  const SPMult = isSkirmish ? 50 : 500;
  const LegendMult = isSkirmish ? 150 : 500;
  const totalSP =
    2 +
    Math.round(totalForcePoints / SPMult) -
    sum(forces.map((force) => force.cost));
  const legendLimit = Math.round(totalForcePoints / LegendMult);
  const validationErrors = [];
  if (listType !== "narrative") {
    const totalLegends = sum(
      forces.map((force) => {
        return get(force, "legends", []).length;
      })
    );
    if (totalLegends > legendLimit) {
      const exceededLegends = totalLegends - legendLimit;
      validationErrors.push({
        type: "error",
        text: `List has ${exceededLegends} too many legends`,
      });
    }
    forces.forEach((force) => {
      const forceFaction = get(force, "faction", {});
      const forceFactionId = get(force, "faction.id");
      const forceSubFactionId = get(force, "subFactionId");
      const forceSubfaction = data.getSubfaction(
        forceFactionId,
        forceSubFactionId
      );
      const name = `${forceFaction.name} ${!forceSubFactionId || forceSubFactionId === "none"
        ? ""
        : `(${forceSubfaction.name})`
        } - ${force.name}`;
      const forceCategories = Object.keys(get(force, "categories", {}));
      forceCategories.forEach((catKey) => {
        const forceUnits = get(force, "units", []);
        const category = data.getCategory(catKey);
        const categoryData = data.getOrganizationCategory(force, catKey);
        const unitCatCount =
          forceUnits.filter((myUnit) => myUnit.category === catKey).length || 0;
        if (unitCatCount < categoryData.min) {
          const unitDiff = categoryData.min - unitCatCount;
          validationErrors.push({
            type: "error",
            text: `${name} requires ${unitDiff} more ${category.name} unit${unitDiff > 1 ? "s" : ""
              }`,
          });
        }
        if (unitCatCount > categoryData.max) {
          const unitDiff = unitCatCount - categoryData.max;
          validationErrors.push({
            type: "error",
            text: `${name} has ${unitDiff} too many ${category.name} units`,
          });
        }
      });
    });
  }
  const allPowerSpecialties = [];
  forces.forEach((force) => {
    force?.units.forEach((unit) => {
      const powerSp = unit?.powerSpecialty;
      if (powerSp) {
        allPowerSpecialties.push(powerSp);
      }
    })
  });
  if (!gameName) {
    return (
      <Container>
        <Typography align="center">
          This list does not exist. Click <Link component={RouterLink}
            to={'/lists'}
          >here</Link> to return to the rosters screen.
        </Typography>
      </Container>
    );
  }
  return (
    <>
      <div style={{ display: "none" }}>
        <PrintStyles ref={componentRef}>{renderPrintMode()}</PrintStyles>
      </div>
      <Container>
        <Typography
          style={{ wordBreak: 'break-all' }}
          variant="h4"
          align="center"
          sx={{ mb: 1 }}
        >{`${list.name}`}</Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          {`${listTypeName}, ${totalForcePoints} pts`},
          {listType === "campaign"
            ? ` ${totalForceReservePoints} pts of reserves,`
            : ""}
          {` ${totalSP} SP`},{" "}
          {`${legendLimit} Legend${legendLimit > 1 ? "s" : ""}`}
        </Typography>
        {validationErrors.map((error, idx) => (
          <Alert
            key={idx}
            severity={error.type || "info"}
            variant="filled"
            sx={{ mb: 2 }}
          >
            {error.text}
          </Alert>
        ))}
        <Card
          className="no-break"
          sx={{
            border: `2px solid ${theme.palette.primary.main}`,
            mb: 2,
          }}
        >
          <CardHeader
            sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), py: 1 }}
            title={
              <Typography fontSize="1.25rem" fontWeight="bold" component="div">
                Game Trackers
              </Typography>
            }
          />
          <CardContent>
            <Stack direction="column" spacing={2}>
              <FormGroup>
                <InputNumber
                  fullWidth
                  label={"Strategy Points"}
                  min={0}
                  type="number"
                  color="primary"
                  value={list.strategyPoints || 0}
                  onChange={(value) => updateList({ strategyPoints: value })}
                  allowReset
                />
              </FormGroup>
              <FormGroup>
                <InputNumber
                  fullWidth
                  label={"Victory Points"}
                  min={0}
                  type="number"
                  color="primary"
                  value={list.victoryPoints || 0}
                  onChange={(value) => updateList({ victoryPoints: value })}
                  allowReset
                />
              </FormGroup>
            </Stack>
          </CardContent>
        </Card>

        {forces.map((force, index) => {
          const forceFactionId = get(force, "faction.id");
          const forceSubFactionId = get(force, "subFactionId");
          const forceFaction = data.getFactionWithSubfaction(
            forceFactionId,
            forceSubFactionId || "none"
          );
          const rawForceFaction = data.getRawFaction(forceFactionId);
          const forceSubfaction = data.getSubfaction(
            forceFactionId,
            forceSubFactionId || "none"
          );
          const {
            color: factionColor,
          } = forceFaction;
          const textColor = factionColor
            ? getTextColor(hexToRgb(factionColor))
            : "white";
          const forceCategories = Object.keys(get(force, "categories", {}));
          const showingReserves = !!showReserves[index];
          const forceUnits = showingReserves
            ? get(force, "reserves", [])
            : get(force, "units", []);
          const factionRelics = data.getRelics(forceFaction);
          const factionPowers = data.getPowers(forceFaction);
          const hasPowers =
            !isNil(rawForceFaction.powers) &&
            !isEqual(rawForceFaction.powers, {});
          const rawSubfactions = Object.values(forceFaction.subfactions || []);
          const hasSubfactions = !!rawSubfactions.length;
          const factionStrategies = data.getStrategies(forceFaction);
          const units = data.getUnits(forceFaction);
          const forceLegends = get(force, "legends", []);
          const listLegendSet = new Set(
            get(list, "forces", [])
              .map((force) => get(force, "legends", []).map((legend) => legend.id))
              .flat()
          );
          const filteredLegends =
            listType === "narrative"
              ? factionRelics
              : factionRelics.filter((legend) => !listLegendSet.has(legend.id));
          const filteredCategories = forceCategories
            .filter(
              (catKey) =>
                editMode ||
                forceUnits.filter((myUnit) => myUnit.category === catKey).length
            )
            .filter((catKey) => {
              const categoryData = data.getOrganizationCategory(force, catKey);
              return categoryData.max > 0 || listType === "narrative";
            });
          return (
            <Card
              className="no-break"
              sx={{
                border: `2px solid ${factionColor}`,
                mb: 2,
              }}
            >
              <CardHeader
                sx={{ backgroundColor: factionColor, color: textColor, py: 1 }}
                title={
                  <>
                    <Typography fontSize="1.25rem" fontWeight="bold" component="div">
                      {`${forceFaction.name} ${!forceSubFactionId || forceSubFactionId === "none"
                        ? ""
                        : `(${forceSubfaction.name})`
                        } - ${showingReserves ? "Reserves" : force.name}`}
                    </Typography>
                  </>
                }
                action={
                  <Dropdown>
                    {({ handleClose, open, handleOpen, anchorElement }) => (
                      <>
                        <IconButton sx={{ color: 'inherit', mr: 1 }} onClick={handleOpen}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          anchorEl={anchorElement}
                          id="basic-menu"
                          open={open}
                          onClose={handleClose}
                          MenuListProps={{
                            dense: true,
                            onClick: handleClose,
                            "aria-labelledby": "basic-button",
                          }}
                        >

                          {!!factionStrategies.length && (
                            <MenuItem onClick={() =>
                              showViewStrategies({
                                forceId: index,
                                faction: forceFaction,
                              })}>
                              <ListItemIcon>
                                <ChessPawnIcon />
                              </ListItemIcon>
                              <ListItemText>View Strategies</ListItemText>
                            </MenuItem>
                          )}
                          {!!factionPowers.length && hasPowers && (
                            <MenuItem onClick={() =>
                              showViewPowers({
                                forceId: index,
                                faction: forceFaction,
                                powerSpecialties: allPowerSpecialties
                              })
                            }>
                              <ListItemIcon>
                                <FlashOnIcon />
                              </ListItemIcon>
                              <ListItemText>View Powers</ListItemText>
                            </MenuItem>
                          )}

                          {listType === "campaign" && (
                            <>
                              <MenuItem onClick={() =>
                                setShowReserves({
                                  ...showReserves,
                                  [index]: !showReserves[index],
                                })
                              }>
                                <ListItemIcon>
                                  <FontAwesomeIcon icon={faUser} />
                                </ListItemIcon>
                                <ListItemText>{showingReserves ? "Force" : "Reserves"}</ListItemText>
                              </MenuItem>
                            </>
                          )}
                          {!!editMode && hasSubfactions && (
                            <MenuItem onClick={() =>
                              showChooseSubfaction({
                                forceId: index,
                                faction: forceFaction,
                              })
                            }>
                              <ListItemIcon>
                                <EditIcon />
                              </ListItemIcon>
                              <ListItemText>Change Focus</ListItemText>
                            </MenuItem>
                          )}

                          {!!editMode && (
                            <MenuItem onClick={() => deleteForce(index)
                            }>
                              <ListItemIcon>
                                <DeleteIcon />
                              </ListItemIcon>
                              <ListItemText>Delete</ListItemText>
                            </MenuItem>
                          )}
                        </Menu>
                      </>
                    )}
                  </Dropdown>

                }
              />
              <CardContent
                style={{ padding: (filteredCategories.length || forceLegends.length) ? 0 : undefined }}
              >
                <>
                  {!!factionRelics.length &&
                    !showingReserves &&
                    (!!editMode || !!forceLegends.length) && (
                      <>
                        <ListItem
                          key={index}
                          secondaryAction={
                            <>
                              {!!editMode && (
                                <IconButton
                                  disabled={filteredLegends?.length === 0}
                                  sx={{}}
                                  onClick={() =>
                                    showAddLegend({
                                      forceId: index,
                                      faction: forceFaction,
                                    })
                                  }
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </>
                          }
                          disablePadding
                        >
                          <ListSubheader sx={{ flex: 1, zIndex: 0, color: 'inherit' }}>
                            <Typography
                              sx={{ py: 1.5 }}
                              fontWeight="bold"
                              variant="h6"
                            >
                              Legends
                            </Typography>
                          </ListSubheader>
                        </ListItem>
                        {forceLegends.map((legend, unitIdx) => {
                          return (
                            <>
                              <ListItem
                                key={index}
                                secondaryAction={
                                  <Dropdown>
                                    {({ handleClose, open, handleOpen, anchorElement }) => (
                                      <>
                                        <IconButton sx={{}} onClick={handleOpen}>
                                          <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                          anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                          }}
                                          transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                          }}
                                          anchorEl={anchorElement}
                                          id="basic-menu"
                                          open={open}
                                          onClose={handleClose}
                                          MenuListProps={{
                                            dense: true,
                                            onClick: handleClose,
                                            "aria-labelledby": "basic-button",
                                          }}
                                        >
                                          <MenuItem onClick={() =>
                                            showViewLegend({
                                              faction: forceFaction,
                                              legend,
                                            })}>
                                            <ListItemIcon>
                                              <VisibilityIcon />
                                            </ListItemIcon>
                                            <ListItemText>View</ListItemText>
                                          </MenuItem>
                                          {!!editMode && (
                                            <MenuItem onClick={() =>
                                              deleteLegend(index, legend.id)
                                            }>
                                              <ListItemIcon>
                                                <DeleteIcon />
                                              </ListItemIcon>
                                              <ListItemText>Delete</ListItemText>
                                            </MenuItem>
                                          )}
                                        </Menu>
                                      </>
                                    )}
                                  </Dropdown>
                                }
                                disablePadding
                              >
                                <ListItemButton
                                  sx={{ py: 1.5 }}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    showViewLegend({
                                      faction: forceFaction,
                                      legend,
                                    });
                                  }}
                                >
                                  <>
                                    {legend.name} {`(${legend.points} pts)`}
                                  </>
                                </ListItemButton>
                              </ListItem>
                            </>
                          );
                        })}
                      </>
                    )}
                  {filteredCategories.map((catKey, catIndex) => {
                    const category = data.getCategory(catKey);
                    const categoryData = data.getOrganizationCategory(
                      force,
                      catKey
                    );
                    const unitCatCount = units.filter(
                      (unit) => unit.category === catKey
                    ).length;
                    return (
                      <>
                        <ListItem
                          key={index}
                          secondaryAction={
                            <>
                              {!!editMode && (
                                <IconButton
                                  sx={{}}
                                  disabled={unitCatCount === 0}
                                  onClick={() =>
                                    showAddUnit({
                                      forceId: index,
                                      faction: forceFaction,
                                      units: units.filter(
                                        (unit) => unit.category === catKey
                                      ),
                                    })
                                  }
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </>
                          }
                          disablePadding
                        >
                          <ListSubheader sx={{ flex: 1, zIndex: 0, backgroundColor: 'background.paper', color: 'inherit' }}>
                            <Typography
                              sx={{ py: 1.5 }}
                              fontWeight="bold"
                            >
                              {category.name}{" "}
                              {listType !== "narrative"
                                ? `${`(${categoryData.min || 0}-${categoryData.max
                                })`}`
                                : ""}
                            </Typography>
                          </ListSubheader>
                        </ListItem>
                        {forceUnits
                          .filter((unit) => unit.category === catKey)
                          .map((unit, unitIdx) => {
                            const unitCopy = showingReserves
                              ? get(
                                list,
                                `reserves[${forceFactionId}][${unit.id}]`
                              )
                              : get(list, `forces[${index}].units[${unit.id}]`);
                            const unitSetbacksCount = get(
                              unit,
                              "selectedSetbacks",
                              []
                            ).length;
                            const unitLevel = Math.floor(
                              get(unit, "experience", 0) / 5
                            );
                            return (
                              <>
                                <ListItem
                                  key={index}
                                  secondaryAction={
                                    <Dropdown>
                                      {({ handleClose, open, handleOpen, anchorElement }) => (
                                        <>
                                          <IconButton sx={{}} onClick={handleOpen}>
                                            <MoreVertIcon />
                                          </IconButton>
                                          <Menu
                                            anchorOrigin={{
                                              vertical: "bottom",
                                              horizontal: "right",
                                            }}
                                            transformOrigin={{
                                              vertical: "top",
                                              horizontal: "right",
                                            }}
                                            anchorEl={anchorElement}
                                            id="basic-menu"
                                            open={open}
                                            onClose={handleClose}
                                            MenuListProps={{
                                              dense: true,
                                              onClick: handleClose,
                                              "aria-labelledby": "basic-button",
                                            }}
                                          >
                                            <MenuItem onClick={() =>
                                              showViewUnit({
                                                unit,
                                                faction: forceFaction,
                                              })}>
                                              <ListItemIcon>
                                                <VisibilityIcon />
                                              </ListItemIcon>
                                              <ListItemText>View</ListItemText>
                                            </MenuItem>
                                            {!!editMode && (
                                              <MenuItem
                                                onClick={() =>
                                                  addUnitToForce(
                                                    index,
                                                    unitCopy,
                                                    unit.id + 1
                                                  )}
                                              >
                                                <ListItemIcon>
                                                  <ContentCopyIcon />
                                                </ListItemIcon>
                                                <ListItemText>Copy</ListItemText>
                                              </MenuItem>
                                            )}
                                            {!!editMode && (
                                              <MenuItem onClick={() => {
                                                showEditUnit({
                                                  faction: forceFaction,
                                                  unitId: unit.id,
                                                  forceId: index,
                                                });
                                              }}>
                                                <ListItemIcon>
                                                  <EditIcon />
                                                </ListItemIcon>
                                                <ListItemText>Edit</ListItemText>
                                              </MenuItem>
                                            )}
                                            {listType === "campaign" && (
                                              <MenuItem onClick={() => {
                                                showEditUnitCampaign({
                                                  faction: forceFaction,
                                                  unitId: unit.id,
                                                  forceId: index,
                                                });
                                              }}>
                                                <ListItemIcon>
                                                  <FontAwesomeIcon icon={faBook} />
                                                </ListItemIcon>
                                                <ListItemText>Campaign</ListItemText>
                                              </MenuItem>
                                            )}
                                            {!!editMode &&
                                              listType === "campaign" &&
                                              !showingReserves && (
                                                <MenuItem onClick={() =>
                                                  moveUnitReserves(index, unit.id)
                                                }>
                                                  <ListItemIcon>
                                                    <FontAwesomeIcon
                                                      icon={faArrowRight}
                                                    />
                                                  </ListItemIcon>
                                                  <ListItemText>To Reserves</ListItemText>
                                                </MenuItem>
                                              )}
                                            {!!editMode &&
                                              listType === "campaign" &&
                                              showingReserves && (
                                                <MenuItem onClick={() =>
                                                  moveUnitForce(index, unit.id)
                                                }>
                                                  <ListItemIcon>
                                                    <FontAwesomeIcon
                                                      icon={faArrowLeft}
                                                    />
                                                  </ListItemIcon>
                                                  <ListItemText>To Force</ListItemText>
                                                </MenuItem>
                                              )}
                                            {!!editMode && (
                                              <MenuItem onClick={() =>
                                                deleteUnit(index, unit.id)
                                              }>
                                                <ListItemIcon>
                                                  <DeleteIcon />
                                                </ListItemIcon>
                                                <ListItemText>Delete</ListItemText>
                                              </MenuItem>
                                            )}
                                          </Menu>
                                        </>
                                      )}
                                    </Dropdown>
                                  }
                                  disablePadding
                                >
                                  <ListItemButton
                                    sx={{ py: 1.5 }}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      showViewUnit({
                                        unit,
                                        faction: forceFaction,
                                      });
                                    }}
                                  >
                                    <>
                                      <span style={{ marginRight: '5px' }}>{unit.customName || unit.name}
                                      </span>{`(${unit.points} pts)`}
                                      <span className="badge badge-success">
                                        {listType === "campaign" &&
                                          unitLevel > 0
                                          ? ` ${formatLevel(unitLevel)}`
                                          : ""}
                                      </span>
                                      <span className="badge badge-danger">
                                        {listType === "campaign" &&
                                          unitSetbacksCount > 0
                                          ? `${unitSetbacksCount} ${unitSetbacksCount > 1
                                            ? "Injuries"
                                            : "Injury"
                                          }`
                                          : ""}
                                      </span>
                                    </>
                                  </ListItemButton>
                                </ListItem>
                              </>
                            );
                          })}
                      </>
                    );
                  })}
                  {(!filteredCategories.length && !forceLegends.length) && (
                    <>
                      Force is empty...
                    </>
                  )}
                </>
              </CardContent>
            </Card>
          );
        })}
        <input
          id="file-input"
          type="file"
          name="name"
          multiple
          ref={fileDialog}
          onChange={uploadList}
          style={{ height: "0", overflow: "hidden", display: "none" }}
        />
      </Container>
    </>
  );
});
