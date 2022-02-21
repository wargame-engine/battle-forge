import {
  faCheck, faChevronDown,
  faChevronUp, faDice, faTimes
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddIcon from '@mui/icons-material/Add';
import {
  Button, Checkbox, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Divider, FormControl,
  FormControlLabel, FormGroup, IconButton, InputLabel, List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader, MenuItem, Paper, Select, TextField, Typography
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import ProgressBar from '@mui/material/LinearProgress';
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/system";
import { InputNumber } from "components/bootstrap";
import { PowerCard } from "components/roster/power-card";
import { RelicCard } from "components/roster/relic-card";
import { StrategyCard } from 'components/roster/strategy-card';
import { UnitCard } from "components/roster/unit-card";
import {
  find, get, groupBy, isEqual, sortBy, sum,
  toNumber, uniqBy, uniq
} from "lodash";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { formatLevel } from "utils/format";
import { MarkdownRenderer } from "utils/markdown";
import { getRandomItem } from "utils/math";

const PowerSpecialtySelector = (props) => {
  const { data: nope, faction, onChange = () => { }, value = 'none' } = props;
  const powerCats = { 'none': { name: 'None' }, ...nope.getRawPowerCategories(faction) };
  const specialtyOptions = Object.keys(powerCats).map((cat, index) => {
    return <MenuItem key={index} value={cat}>{powerCats[cat]?.name}</MenuItem>;
  });
  return (
    <FormGroup sx={{ my: 1 }}>
      <FormControl>
        <InputLabel id="specialty-label">Power Specialty</InputLabel>
        <Select
          size="small"
          labelId="specialty-label"
          id="specialty"
          value={value}
          label="Power Specialty"
          onChange={onChange}
        >
          {specialtyOptions}
        </Select>
      </FormControl>
    </FormGroup>
  );
};

export const ChooseSubFaction = (props) => {
  const { hideModal, setSubFaction, forceId, faction } = props;
  const rawSubfactions = Object.values(faction.subfactions || []);
  const subfactions = [
    {
      id: "none",
      name: "No Focus",
      description:
        "A generalist force which can take on many different enemies.",
    },
    ...rawSubfactions,
  ];
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog open onClose={hideModal} fullScreen={fullScreen} maxWidth="lg" fullWidth>
        <DialogTitle closeButton>Change Focus</DialogTitle>
        <DialogContent style={{ padding: 0 }} sx={{ backgroundColor: "background.paper" }}>
          <List style={{ height: '100%' }}>
            {subfactions.map((subfaction) => {
              return (
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      sx={{}}
                      onClick={() => {
                        setSubFaction(forceId, subfaction.id);
                        hideModal();
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => {
                      setSubFaction(forceId, subfaction.id);
                      hideModal();
                    }}
                  >
                    <ListItemText
                      primary={`${subfaction.name}`}
                      secondary={`${subfaction.description}`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AddLegend = (props) => {
  const { hideModal, data, forceId, faction, addLegend, list } = props;
  const legends = data.getRelics(faction);
  const RELIC_TYPES = {
    equipment: "Equipment",
    ability: "Abilities",
  };
  const sortedLegends = sortBy(
    legends.map((legend) => ({
      ...legend,
      points: data.getRelicCost(legend, faction),
    })),
    ["points", "name"]
  );
  const listType = list.type || "competitive";
  const listLegendSet = new Set(
    get(list, "forces", [])
      .map((force) => get(force, "legends", []).map((legend) => legend.id))
      .flat()
  );
  const filteredLegends =
    listType === "narrative"
      ? sortedLegends
      : sortedLegends.filter((legend) => !listLegendSet.has(legend.id));
  const groupedRelics = groupBy(filteredLegends, (relic) =>
    relic.type || relic.rule ? "ability" : "equipment"
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog open onClose={hideModal} fullScreen={fullScreen} maxWidth="lg" fullWidth>
        <DialogTitle>Add Legend</DialogTitle>
        <DialogContent style={{ padding: 0 }} sx={{ backgroundColor: "background.paper" }}>
          <Paper  style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            {Object.keys(RELIC_TYPES)
              .filter(
                (type) => !!groupedRelics[type] && !!groupedRelics[type].length
              )
              .map((relicType) => {
                const relicsType = get(groupedRelics, `[${relicType}]`, []);
                const sortedRelics = sortBy(relicsType, (relic) =>
                  data.getRelicCost(relic, faction)
                );
                return (
                  <>
                    <ListSubheader sx={{ flex: 1, backgroundColor: 'background.paper', color: 'inherit' }}>
                      <Typography
                        sx={{ py: 1 }}
                        fontWeight="bold"
                        variant="h5"
                      >
                        {RELIC_TYPES[relicType]}
                      </Typography>
                    </ListSubheader>
                    {sortedRelics.map((relic) => {
                      return (
                        <div key={relic.id}>
                          <ListItem
                            disablePadding
                            // secondaryAction={
                            //   <IconButton
                            //     sx={{}}
                            //     onClick={() => {
                            //       addLegend(forceId, { id: relic.id });
                            //       hideModal();
                            //     }}
                            //   >
                            //     <AddIcon />
                            //   </IconButton>
                            // }
                          >
                            <ListItemButton
                              onClick={() => {
                                addLegend(forceId, { id: relic.id });
                                hideModal();
                              }}
                            >
                              <ListItemText
                                primary={<Typography fontWeight="bold">{`${relic.name} (${relic.points} pts)`}</Typography>}
                                secondary={<Typography variant="body2"><ReactMarkdown
                                  children={relic.description}
                                  className="rule-text"
                                /></Typography>}
                              />
                            </ListItemButton>
                          </ListItem>
                        </div>
                      );
                    })}
                  </>
                );
              })}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const AddForce = (props) => {
  const { data, addForce, list, hideModal, userPrefs } = props;
  const showBeta = userPrefs.showBeta;
  const [faction, setFaction] = useState("");
  const [subFaction, setSubFaction] = useState("");
  const forces = get(list, "forces", []);
  const factions = data
    .getFactions()
    .filter((game) =>
      showBeta ? true : game.version && Number(game.version) >= 1
    );
  const organizations = data.getRawOrganizations();
  const alliances = data.getRawAlliances();
  const firstFaction = get(list, "forces[0].factionId", "");
  const listAlliance = data.getFaction(firstFaction).alliance;
  const unitCategories = groupBy(factions, "alliance");
  let filteredAlliances = [...Object.keys(alliances), "mercenaries", undefined];
  if (!listAlliance && forces.length > 0 && list.type !== "narrative") {
    filteredAlliances = ["mercenaries", undefined];
  } else if (listAlliance && forces.length > 0 && list.type !== "narrative") {
    filteredAlliances = [
      ...Object.keys(alliances).filter((alliance) => alliance === listAlliance),
      "mercenaries",
    ];
  }
  const categoryOrder = uniq(filteredAlliances.filter(
    (cat) => unitCategories[cat] && unitCategories[cat].length
  ));
  // Subfactions
  const rawSubfactions = Object.values(
    data.getFaction(faction).subfactions || []
  );
  const hasSubfactions = !!rawSubfactions.length;
  const subfactions = [
    {
      id: "none",
      name: "No Focus",
      description:
        "A generalist force which can take on many different enemies.",
    },
    ...rawSubfactions,
  ];
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog
        open
        fullScreen={fullScreen}
        fullWidth
        onClose={hideModal}
        maxWidth="lg"
      >
        {!faction && (
          <>
            <DialogTitle closeButton>Choose Faction</DialogTitle>
            <DialogContent style={{ padding: 0 }}>
              <Paper  style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
                <>
                  {categoryOrder.map((allianceKey) => {
                    const theFactions = sortBy(
                      get(unitCategories, `[${allianceKey}]`, []),
                      "name"
                    );
                    const filteredFactions =
                      forces.length > 0 &&
                        !listAlliance &&
                        list.type !== "narrative"
                        ? theFactions.filter(
                          (faction) => faction.id === firstFaction
                        )
                        : theFactions;
                    const allianceData = data.getAlliance(allianceKey);
                    return (
                      <>
                        <ListSubheader sx={{ flex: 1, color: 'inherit' }}>
                          <Typography
                            sx={{ py: 1 }}
                            fontWeight="bold"
                            variant="h5"
                          >
                            {allianceData.name || "Unaligned"}
                          </Typography>
                        </ListSubheader>
                        {Object.keys(filteredFactions).map((orgKey) => {
                          const org = filteredFactions[orgKey];
                          return (
                            <ListItem
                              disablePadding
                              // secondaryAction={
                              //   <IconButton
                              //     sx={{}}
                              //     onClick={() => {
                              //       setFaction(org.id);
                              //     }}
                              //   >
                              //     <AddIcon />
                              //   </IconButton>
                              // }
                            >
                              <ListItemButton
                                onClick={() => {
                                  setFaction(org.id);
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography fontWeight="bold">
                                      {`${org.name}`}
                                      <small>
                                        {org.version ? ` (${org.version})` : ""}
                                      </small>
                                    </Typography>
                                  }
                                  secondary={<Typography variant="body2">{`${org.description || ""}`}</Typography>}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </>
                    );
                  })}
                </>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={hideModal}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
        {!!faction && (subFaction || !hasSubfactions) && (
          <>
            <DialogTitle closeButton>Add Force Organization</DialogTitle>
            <DialogContent style={{ padding: 0 }} sx={{ backgroundColor: "background.paper" }}>
              <Paper style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
                {Object.keys(organizations).map((orgKey) => {
                  const org = organizations[orgKey];
                  return (
                    <ListItem
                      disablePadding
                      // secondaryAction={
                      //   <IconButton
                      //     sx={{}}
                      //     onClick={() => {
                      //       addForce({
                      //         id: orgKey,
                      //         factionId: faction,
                      //         subFactionId: subFaction || "none",
                      //       });
                      //       hideModal();
                      //     }}
                      //   >
                      //     <AddIcon />
                      //   </IconButton>
                      // }
                    >
                      <ListItemButton
                        onClick={() => {
                          addForce({
                            id: orgKey,
                            factionId: faction,
                            subFactionId: subFaction || "none",
                          });
                          hideModal();
                        }}
                      >
                        <ListItemText
                          primary={<Typography fontWeight="bold">{`${org.name} (Cost ${org.cost})`}</Typography>}
                          secondary={<Typography variant="body2">{org.description}</Typography>}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                onClick={() => {
                  hasSubfactions ? setSubFaction("") : setFaction("");
                }}
              >
                Back
              </Button>
              <Button color="primary" onClick={hideModal}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
        {hasSubfactions && !subFaction && !!faction && (
          <>
            <DialogTitle closeButton>Choose Focus</DialogTitle>
            <DialogContent style={{ padding: 0 }} sx={{ backgroundColor: "background.paper" }}>
              <Paper style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
                {subfactions.map((subfaction) => {
                  return (
                    <ListItem
                      disablePadding
                      // secondaryAction={
                      //   <IconButton
                      //     sx={{}}
                      //     onClick={() => {
                      //       setSubFaction(subfaction.id);
                      //     }}
                      //   >
                      //     <AddIcon />
                      //   </IconButton>
                      // }
                    >
                      <ListItemButton
                        onClick={() => {
                          setSubFaction(subfaction.id);
                        }}
                      >
                        <ListItemText
                          primary={<Typography fontWeight="bold">{subfaction.name}</Typography>}
                          secondary={<Typography variant="body2">{subfaction.description}</Typography>}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                onClick={() => {
                  setFaction("");
                }}
              >
                Back
              </Button>
              <Button color="primary" onClick={hideModal}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export const AddUnit = (props) => {
  const { hideModal, data, units, faction, addUnit, forceId } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const sortedUnits = sortBy(
    units.map((unit) => ({
      ...unit,
      points: data.getUnitPoints(unit, faction),
    })),
    ["points", "name"]
  );
  return (
    <>
      <Dialog open onClose={hideModal} fullScreen={fullScreen} maxWidth="lg" fullWidth>
        <DialogTitle closeButton>
          Add Unit
        </DialogTitle>
        <DialogContent style={{ padding: 0 }}>
          <Paper style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            {sortedUnits.map((unit, index) => {
              return (
                <ListItem
                  key={index}
                  disablePadding
                  // secondaryAction={
                  //   <IconButton
                  //     sx={{}}
                  //     onClick={() => {
                  //       addUnit(forceId, { id: unit.id });
                  //       hideModal();
                  //     }}
                  //   >
                  //     <AddIcon />
                  //   </IconButton>
                  // }
                >
                  <ListItemButton
                    onClick={() => {
                      addUnit(forceId, { id: unit.id });
                      hideModal();
                    }}
                  >
                    <ListItemText
                      primary={<Typography fontWeight="bold">{`${unit.name} (${unit.points} pts)`}</Typography>}
                      secondary={<Typography variant="body2">{unit.description}</Typography>}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ViewStrategies = (props) => {
  const { hideModal, data, faction } = props;
  const strategies = data.getStrategies(faction);
  const phases = { ...data.getRawPhases() };
  const unitPhases = { ...groupBy(strategies, "phase") };
  const phaseOrder = [...Object.keys(phases), undefined].filter(
    (cat) => unitPhases[cat] && unitPhases[cat]
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog open onClose={hideModal} maxWidth="lg" fullWidth fullScreen={fullScreen}>
        <DialogTitle closeButton>
          Strategies
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "background.paper" }}>
          {phaseOrder.map((phaseId, phaseIndex) => {
            const phaseStrategies = get(unitPhases, `[${phaseId}]`, []).map(
              (strat) => ({ ...strat, sourceLength: strat.source.length })
            );
            const sortedStrategies = sortBy(phaseStrategies, [
              "sourceLength",
              "source",
              "cost",
            ]);
            const phaseData = data.getPhase(phaseId);
            return (
              <div key={phaseIndex}>
                <Typography
                  sx={{ my: 2 }}
                  variant="h5"
                  component="div"
                  align="center"
                >
                  {phaseData.name || "Any Phase"}
                </Typography>
                <div className="two-columns">
                  {sortedStrategies.map((strategy, index) => (
                    <div key={index} className="no-break">
                      <Box sx={{ mb: 2 }}>
                        <StrategyCard strategy={strategy} faction={faction} />
                      </Box>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ViewPowers = (props) => {
  const { hideModal, data, faction, powerSpecialties } = props;
  const powerCatSet = new Set(powerSpecialties);
  const strategies = data.getPowers(faction);
  const phases = { ...data.getRawPowerCategories(faction) };
  const unitPhases = { ...groupBy(strategies, "category") };
  const phaseOrder = [undefined, ...Object.keys(phases)].filter(
    (cat) => unitPhases[cat] && unitPhases[cat]
  ).filter((cat) => powerCatSet.has(cat) || !cat);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Dialog open onClose={hideModal} maxWidth="lg" fullWidth fullScreen={fullScreen}>
      <DialogTitle closeButton>
        Powers
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: 'background.paper' }}>
        <>
          {!strategies.length && <p>{"No strategies found..."}</p>}
          {phaseOrder.map((phaseId, phaseIdx) => {
            const phaseStrategies = get(unitPhases, `[${phaseId}]`, []).map(
              (strat) => ({ ...strat, sourceLength: strat.source.length })
            );
            const sortedStrategies = sortBy(phaseStrategies, [
              "sourceLength",
              "source",
              "charge",
            ]);
            const phaseData = data.getPowerCategory(phaseId, faction);
            return (
              <>
                <div key={phaseIdx}>
                  <Typography
                    sx={{ my: 2 }}
                    variant="h4"
                    component="div"
                    align="center"
                  >
                    {phaseData.name || "Any Specialty"}
                  </Typography>
                </div>
                <div className="two-columns">
                  {sortedStrategies.map((power, index) => (
                    <div key={index} className="no-break">
                      <Box sx={{ mb: 2 }}>
                        <PowerCard faction={faction} power={power} />
                      </Box>
                    </div>
                  ))}
                </div>
              </>
            );
          })}
        </>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={hideModal}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ViewUnit = (props) => {
  const { hideModal, data, unit, faction } = props;
  const models = [
    ...get(unit, "models", []),
    ...data.getModelList(unit.selectedModels, faction),
  ];
  const weapons = data.getWeaponList(unit.selectedWeapons, faction);
  const rules = data.getRulesList(unit.selectedRules, faction);
  const allWeaponRules = data.getAllWeaponRules(weapons, faction);
  const weaponsRules = uniqBy(allWeaponRules, (rule) => rule.id || rule);
  const unitSetbacks = get(unit, "selectedSetbacks", []).map((setback) =>
    data.getSetback(faction, setback)
  );
  const unitPerks = get(unit, "selectedPerks", []).map((perk) =>
    data.getPerk(faction, perk)
  );
  const unitLevel = Math.floor((unit.experience || 0) / 5);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const unitPowerSpecialty = unit?.powerSpecialty ? data.getPowerCategory(unit?.powerSpecialty, faction)?.name : undefined;
  return (
    <>
      <Dialog open maxWidth="lg" fullScreen={fullScreen} onClose={hideModal}>
        <DialogTitle>
          View Unit
        </DialogTitle>
        <DialogContent sx={{ p: 1, backgroundColor: 'background.paper' }}>
          <Box sx={{ mt: 1 }}>
            <UnitCard
              toggler={false}
              points={unit.points}
              models={models}
              weapons={weapons}
              faction={faction}
              data={data}
              unit={unit}
              rules={rules}
              setbacks={unitSetbacks}
              powerSpecialty={unitPowerSpecialty}
              perks={unitPerks}
              level={unitLevel}
              weaponRules={weaponsRules}
              showOptions={false}
              embeddedOptions={true}
              unitOptions={unit.selectedOptionsList}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const injuryText = `
# Injuries
When this model would be killed, roll a D10 adding the amount it failed the save by plus the number of critical damage tokens it has and refer to the following:

* Shaken(5+): Take one additional shock.
* Panic(8+): Take 2 additional shock and immediately take a Courage test. If failed the unit is destroyed.
* Destroyed(10+): It is instantly destroyed.

Mark each time the unit rolls on the chart with a critical damage token. While a unit has one or more damage tokens, it may not remove that amount of Shock.
`;

export const ViewInjuryTable = (props) => {
  const { hideModal } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog open maxWidth="lg" fullScreen={fullScreen} onClose={hideModal}>
        <DialogTitle closeButton>
          <DialogTitle>Injury Chart</DialogTitle>
        </DialogTitle>
        <DialogContent>
          <ReactMarkdown className="rule-text" children={injuryText} />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const actionReference = `
# Actions
The following actions are available to all units.

### Focus
The unit focuses and gains +1 Accuracy and Strength with its next attack.
### Shoot
The unit attacks with all equipped Ranged weapons. Units may only shoot once per round.
### Fight
The unit fights will all equipped melee weapons in close combat. A unit may only fight once per round. If a unit has no Melee weapons, it may not perform Fight actions.
### Move
All models in the unit move up to their movement characteristic.
#### Rushing
When performing a move action, a unit may attempt to rush. The unit takes an Initiative skill check. If passed, the unit may move an additional number of inches equal to half its movement characteristic rounded down with that Move action. If failed, the unit takes a Shock at the end of the Move and does not gain any benefit. Units may never rush across obstacles or through difficult terrain.
### Charge
The unit declares a target and makes a move action into base contact with it and may make a free fight action. A unit may not charge if already in close combat. A unit may only use a Charge action if it is in range of an enemy unit it can reach with its move action.
### Hold
The unit prepares itself and may perform a reaction later in the round. It may automatically perform an Overwatch or Counter Attack reaction without having to test. All other reactions will require the unit to test.
### Evade
The unit attemps to evade incoming attacks. Mark that the unit has Evaded with a token. When the unit is targeted by a Shooting or Fighting attack, that unit may spend the token to gain +1 Save against that attack.
### Rally
The unit attempts to regroup and prepare to fight on. Roll a Courage check for each Shock on the unit and any successes remove one Shock.

# Reactions
Units may make any of the following reactions.

### Dodge
When a unit is targeted by an attack it may attempt a Dodge reaction. With a Dodge reaction, a unit attempts to dodge out of the way of the attack and avoid being hit. If successful, immediately make an Evade action.

### Overwatch
Units may react when a Charge action is declared against them or a Move action is performed in their line of sight by attempting an Overwatch reaction. If successful, the unit may make a full shooting attack against the Charging or Moving unit measured from any point in the unit's Move. A unit that is on Hold may automatically perform an Overwatch reaction. No test is required for this reaction as a Hold action has already been performed.

### Counter Attack
When a Fight or Shoot action is declared against a unit, it may attempt a Counter Attack reaction. If successful, the unit may simultaneously make a Fight or Shoot action against the attacking unit. A unit that is on Hold may automatically perform a Counter Attack reaction against an enemy unit that Fights or Shoots it. No test is required for this reaction as a Hold action has already been performed.

### Escape
When a Fight, Shoot, or Charge action is declared against a unit, it may attempt an Escape reaction. If successful, the target unit may make a full move action before the Shoot, Fight or Charge action is performed.
`;
const ReferenceRules = styled.div`
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0.25rem;
  }
  h1 {
    font-size: 18pt;
    font-weight: bold;
  }
  h2 {
    font-size: 16pt;
    margin-top: 0.5em;
  }
  h3 {
    font-size: 14pt;
  }
  h4 {
    font-weight: bold;
    font-size: 12pt;
  }
  h5 {
    font-weight: bold;
    font-size: 12pt;
  }
  p {
    margin-top: 0;
    break-inside: "avoid-column";
    page-break-inside: avoid; /* For Firefox. */
    -webkit-column-break-inside: avoid; /* For Chrome & friends. */
    break-inside: avoid; /* For standard browsers like IE. :-) */
  }
`;

export const ViewActionReference = (props) => {
  const { hideModal, isSkirmish } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const rules = isSkirmish ? injuryText + actionReference : actionReference;
  return (
    <>
      <Dialog open maxWidth="lg" fullScreen={fullScreen} onClose={hideModal}>
        <DialogTitle>Rules Reference</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ px: 3 }} style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            <ReferenceRules>
              <ReactMarkdown
                className="reference-text"
                children={rules}
              />
            </ReferenceRules>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
const StyledRules = styled.div`
  h1 {
    font-size: 20pt;
    font-weight: bold;
    border-bottom: 4px solid rgb(57, 110, 158);
    padding-bottom: 0.25rem;
  }
  h2 {
    font-size: 18pt;
    border-bottom: 2px solid rgb(57, 110, 158);
    padding-bottom: 0.25rem;
  }
  h3 {
    font-size: 16pt;
  }
  h4 {
    font-weight: bold;
    font-size: 12pt;
  }
  h5 {
    font-weight: bold;
    font-size: 12pt;
  }
  p {
    break-inside: "avoid-column";
    page-break-inside: avoid; /* For Firefox. */
    -webkit-column-break-inside: avoid; /* For Chrome & friends. */
    break-inside: avoid; /* For standard browsers like IE. :-) */
  }
`;

export const ViewFullRules = (props) => {
  const { rawData, game, hideModal } = props;
  const { gameRules, skirmishRules } = rawData;
  const gameType = get(game, "gameType", "battle");
  const gameTypeData = get(rawData, `gameData.gameTypes[${gameType}]`, {});
  const gameTypeName = get(gameTypeData, "name", "Unknown Game");
  const isSkirmish = isEqual(gameType, "battle");
  const rules = isSkirmish ? gameRules : skirmishRules;
  const mdRenderer = React.useMemo(() => MarkdownRenderer(), []);
  return (
    <>
      <Dialog open onClose={hideModal}>
        <DialogTitle closeButton>
          <DialogTitle>{`${gameTypeName} Rules`}</DialogTitle>
        </DialogTitle>
        <DialogContent>
          <StyledRules>
            <ReactMarkdown renderers={mdRenderer} children={rules} />
          </StyledRules>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hideModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ViewLegend = (props) => {
  const { hideModal, data, faction, legend: relic } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open maxWidth="lg" onClose={hideModal} fullScreen={fullScreen}>
      <DialogTitle>
        View Legend
      </DialogTitle>
      <DialogContent sx={{ p: 1, backgroundColor: "background.paper" }}>
        <Box sx={{ mt: 1 }} height="100%" display="flex" justifyContent="center" alignItems="center">
          <RelicCard faction={faction} relic={relic} data={data} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={hideModal}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const EditUnit = (props) => {
  const {
    hideModal,
    data,
    getUnit,
    faction,
    setUnitOptions,
    setUnitPowerSpecialty,
    setUnitName,
    forceId,
    unitId
  } = props;
  const unit = getUnit(forceId, unitId);
  const options = get(unit, "optionList", []);
  const selectedOptions = get(unit, "selectedOptions", []);
  const unitModels = sum(Object.values(get(unit, "modelCounts", {})));
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const hasPowerRule = find(get(unit, 'selectedRules', []), (rule) => rule.id === 'power' || rule === 'power');
  if (!unit) {
    return <div></div>;
  }
  const renderOption = (option, index) => {
    if (option.list) {
      return (
        <>
          {option.list.length !== 1 && <div>{`${option.option}: `}</div>}
          {option.list.map((opt, optIndex) => {
            const limit = opt.limit;
            const choiceLimit = opt.choiceLimit;
            // Get total selected choices minus the current context
            const selectedChoices = sum(
              selectedOptions[index].filter((option, idx) => idx !== optIndex)
            );
            const changeFuncCheck = () => {
              const val = selectedOptions[index][optIndex];
              const newVal = val === 0 ? 1 : 0;
              if (selectedChoices + newVal > choiceLimit) {
                return;
              }
              selectedOptions[index][optIndex] = newVal;
              setUnitOptions(forceId, unitId, selectedOptions);
            };
            const changeFunc = (newValue) => {
              const value = toNumber(newValue);
              if (selectedChoices + value > choiceLimit) {
                return;
              }
              selectedOptions[index][optIndex] = value;
              setUnitOptions(forceId, unitId, selectedOptions);
            };
            const value = selectedOptions[index][optIndex];
            const shouldDisable = selectedChoices >= choiceLimit && value === 0;
            return (
              <>
                {!choiceLimit && limit === 0 && (
                  <FormGroup
                    controlId={`${index}${optIndex}`}
                  >
                    <FormControlLabel control={
                      <Checkbox
                        type="checkbox"
                        color="primary"
                        checked={value}
                        disabled={shouldDisable}
                        onChange={changeFuncCheck}
                      />
                    } label={`${option.list.length === 1 ? option.option : ""
                      } ${opt.text}`} />
                  </FormGroup>
                )}
                {limit > 1 && choiceLimit > 1 && (
                  <FormGroup
                    controlId={`${index}${optIndex}`}
                    sx={{ mb: 1 }}
                  >
                    <label style={{ marginBottom: 0 }}>
                      {option.list.length === 1 && <>{option.option}</>}{" "}
                      {opt.text}
                    </label>
                    <InputNumber
                      fullWidth
                      min={0}
                      max={limit}
                      type="number"
                      color="primary"
                      disabled={shouldDisable}
                      value={value}
                      onChange={changeFunc}
                    />
                  </FormGroup>
                )}
                {(choiceLimit === 1 || limit === 1) && (
                  <FormGroup
                    controlId={`${index}${optIndex}`}
                  >
                    <FormControlLabel control={
                      <Checkbox
                        type="checkbox"
                        color="primary"

                        checked={value}
                        disabled={shouldDisable}
                        onChange={changeFuncCheck}
                      />}
                      label={`${option.list.length === 1 ? option.option : ""
                        } ${opt.text}`} />
                  </FormGroup>
                )}
              </>
            );
          })}
        </>
      );
    }
    return <></>;
  };
  return (
    <>
      <Dialog open onClose={hideModal} fullScreen={fullScreen} maxWidth="lg" fullWidth>
        <DialogTitle>
          {`${unit.customName || unit.name} `}{" "}
          <small>
            {`(${unitModels} ${unitModels > 1 ? "models" : "model"})`}{" "}
            {`(${unit.points} pts)`}
          </small>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper style={{ height: '100%', borderRadius: 0, overflow: 'auto' }} sx={{ px: 2 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Custom Name"
                value={unit.customName}
                onChange={(event) =>
                  setUnitName(forceId, unitId, event.target.value)
                }
              />
              <Divider />
            </FormControl>
            <FormGroup>
              <div>
                {!!hasPowerRule && <div>
                  <div className="d-flex justify-content-center flex-column">
                    <PowerSpecialtySelector value={unit?.powerSpecialty} onChange={(event) => setUnitPowerSpecialty(forceId, unitId, event.target.value)} data={data} faction={faction} />
                  </div>
                  <Divider />
                </div>}
                {options.map((option, index) => {
                  return (
                    <div>
                      <div className="d-flex justify-content-center flex-column">
                        {renderOption(option, index)}
                      </div>
                      <Divider />
                    </div>
                  );
                })}
              </div>
            </FormGroup>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              hideModal();
            }}
          >
            Done
          </Button>{" "}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const EditUnitCampaign = (props) => {
  const {
    hideModal,
    data,
    getUnit,
    faction,
    setUnitPerks,
    setUnitSetbacks,
    forceId,
    unitId,
    updateUnit,
  } = props;
  const [showPerkLevel, setShowPerkLevel] = useState({});
  const unit = getUnit(forceId, unitId);
  const unitPerks = get(unit, "selectedPerks", []);
  const unitSetbacks = get(unit, "selectedSetbacks", []);
  const unitPerksData = unitPerks.map((perk) => {
    return { id: perk, ...data.getPerk(faction, perk) };
  });
  const unitSetbacksData = unitSetbacks.map((setback) => {
    return { id: setback, ...data.getSetback(faction, setback) };
  });
  const selectedSetbacks = new Set(unitSetbacks);
  const selectedPerks = new Set(unitPerks);
  const setbacks = data.getSetbacks(faction);
  const filteredSetbacks = setbacks.filter(
    (setback) => !selectedSetbacks.has(setback.id)
  );
  const getRandomSetback = () => {
    return get(getRandomItem(filteredSetbacks), "id");
  };
  const perks = data.getPerks(faction);
  const perksByLevel = groupBy(perks, "level");
  const perkOrder = Object.keys(perksByLevel);
  const unitExperience = unit.experience || 0;
  const levelProgress = unitExperience % 5;
  const unitLevel = Math.floor((unit.experience || 0) / 5);
  const formattedLevel = formatLevel(unitLevel);
  const perksLeft =
    unitLevel - (sum(unitPerksData.map((perk) => perk.level)) || 0);
  const canGetPerk = (level) => {
    return perksLeft - level >= 0;
  };
  if (!unit) {
    return <div></div>;
  }
  return (
    <>
      <Dialog open onClose={hideModal}>
        <DialogTitle closeButton>
          <DialogTitle>
            {`${unit.customName || unit.name}`}{" "}
            <small>
              {`(${unit.points} pts)`}
              {unitLevel > 0 ? ` (${formattedLevel})` : ""}
            </small>
          </DialogTitle>
        </DialogTitle>
        <DialogContent>
          <div>
            <h4 className="text-left">
              <b>{"Level Progress"}</b>
            </h4>
            <ProgressBar
              style={{ height: "2em" }}
              now={levelProgress}
              min={0}
              max={5}
              label={`${levelProgress} xp`}
            />
            <Divider />
            <div>
              <Button
                size="sm"
                style={{ marginRight: "5px" }}
                color="primary"
                onClick={() =>
                  updateUnit(forceId, unitId, {
                    experience: Math.max((unit.experience || 0) - 5, 0),
                  })
                }
              >
                {"-5 xp"}
              </Button>
              <Button
                size="sm"
                style={{ marginRight: "5px" }}
                color="primary"
                onClick={() =>
                  updateUnit(forceId, unitId, {
                    experience: Math.max((unit.experience || 0) - 1, 0),
                  })
                }
              >
                {"-1 xp"}
              </Button>
              <Button
                size="sm"
                style={{ marginRight: "5px" }}
                color="primary"
                onClick={() =>
                  updateUnit(forceId, unitId, {
                    experience: Math.max((unit.experience || 0) + 1, 0),
                  })
                }
              >
                {"+1 xp"}
              </Button>
              <Button
                size="sm"
                style={{ marginRight: "5px" }}
                color="primary"
                onClick={() =>
                  updateUnit(forceId, unitId, {
                    experience: Math.max((unit.experience || 0) + 5, 0),
                  })
                }
              >
                {"+5 xp"}
              </Button>
              <hr />
            </div>
          </div>
          <div>
            <h4 className="text-left">
              <b>{"Injuries"}</b>
            </h4>
            {unitSetbacksData.map((setback) => {
              const setbackCost = data.resolvePoints(setback.points, { unit });
              return (
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-left">
                      <b>{`${setback.name} (${setbackCost} pts)`}</b>
                      <p
                        style={{ marginBottom: 0, marginRight: "5px" }}
                        className="text-left"
                      >{`${setback.description}`}</p>
                    </span>
                    <div className="d-flex justify-content-end">
                      <Button
                        style={{}}
                        color="primary"
                        onClick={() => {
                          selectedSetbacks.delete(setback.id);
                          updateUnit(forceId, unitId, {
                            experience: Math.max((unit.experience || 0) - 5, 0),
                            selectedSetbacks: Array.from(selectedSetbacks),
                          });
                        }}
                      >
                        {"-5 xp"}
                      </Button>
                    </div>
                  </div>
                  <hr />
                </div>
              );
            })}
            {!!filteredSetbacks.length && (
              <Button
                color="primary"
                onClick={() => {
                  selectedSetbacks.add(getRandomSetback());
                  setUnitSetbacks(
                    forceId,
                    unitId,
                    Array.from(selectedSetbacks)
                  );
                }}
              >
                Generate <FontAwesomeIcon icon={faDice} />
              </Button>
            )}
          </div>
          <hr />
          <div>
            {perkOrder.map((level) => {
              const thePerks = sortBy(
                get(perksByLevel, `[${level}]`, []),
                "name"
              );
              const availablePerks = Math.floor(perksLeft / level);
              return (
                <>
                  <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-left">
                        <h4 className="text-left" style={{ marginBottom: 0 }}>
                          <b>{`${formatLevel(level)} Perks`}</b>{" "}
                          <small className="badge badge-secondary">
                            {" "}
                            {`${availablePerks} Available`}
                          </small>
                        </h4>
                      </span>
                      <div className="d-flex justify-content-end">
                        {!showPerkLevel[level] && (
                          <Button
                            style={{ width: "40px" }}
                            variant="outline-secondary"
                            color="primary"
                            onClick={() => {
                              setShowPerkLevel({
                                ...showPerkLevel,
                                [level]: true,
                              });
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronDown} />
                          </Button>
                        )}
                        {!!showPerkLevel[level] && (
                          <Button
                            style={{ width: "40px" }}
                            variant="outline-secondary"
                            color="primary"
                            onClick={() => {
                              setShowPerkLevel({
                                ...showPerkLevel,
                                [level]: false,
                              });
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronUp} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <hr />
                  </div>
                  <Collapse in={showPerkLevel[level]}>
                    <div>
                      {thePerks.map((perk) => {
                        const perkCost = data.resolvePoints(perk.points, {
                          unit,
                        });
                        return (
                          <div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-left">
                                <b>{`${perk.name} (${perkCost} pts)`}</b>
                                <p
                                  style={{
                                    marginBottom: 0,
                                    marginRight: "5px",
                                  }}
                                  className="text-left"
                                >{`${perk.description}`}</p>
                              </span>
                              <div className="d-flex justify-content-end">
                                {!selectedPerks.has(perk.id) && (
                                  <Button
                                    style={{ width: "40px" }}
                                    disabled={!canGetPerk(level)}
                                    color="primary"
                                    onClick={() => {
                                      selectedPerks.add(perk.id);
                                      setUnitPerks(
                                        forceId,
                                        unitId,
                                        Array.from(selectedPerks)
                                      );
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
                                {!!selectedPerks.has(perk.id) && (
                                  <Button
                                    style={{ width: "40px" }}
                                    color="primary"
                                    onClick={() => {
                                      selectedPerks.delete(perk.id);
                                      setUnitPerks(
                                        forceId,
                                        unitId,
                                        Array.from(selectedPerks)
                                      );
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <hr />
                          </div>
                        );
                      })}
                    </div>
                  </Collapse>
                </>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              hideModal();
            }}
          >
            Done
          </Button>{" "}
        </DialogActions>
      </Dialog>
    </>
  );
};
