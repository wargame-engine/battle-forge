import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, useMediaQuery, useTheme
} from "@mui/material";
import { StyledTableRow } from "components/styled-table";
import {
  get
} from "lodash";
import React, {
  useMemo, useState
} from "react";
import ReactMarkdown from "react-markdown";
import { getTextColor, hexToRgb } from "utils/colors";
import { formatRule, formatWeapon } from "utils/format";

export const DescriptionModal = (props) => {
  const { hideModal, unit } = props;
  return (
    <>
      <Dialog open onClose={hideModal}>
        <DialogTitle closeButton>{unit.name}</DialogTitle>
        <DialogContent>
          <ReactMarkdown children={unit.background} className="rule-text" />
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

export const UnitDebugModal = (props) => {
  const { hideModal, unit, data, faction } = props;
  const { color: factionColor, secondary_color: factionSecondaryColor } =
    faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const textColorSecondary = factionSecondaryColor
    ? getTextColor(hexToRgb(factionSecondaryColor))
    : "white";
  const borderColor = textColor !== "white" ? textColor : factionColor;
  const thStyle = {
    backgroundColor: factionSecondaryColor || factionColor,
    color: factionSecondaryColor ? textColorSecondary : textColor,
  };
  const [modelSelection, setModelSelection] = useState(0);
  const unitPoints = useMemo(() => {
    return data.getUnitPoints(unit, faction);
  }, [data, unit, faction]);
  const unitModels = useMemo(() => {
    return data.getModels(unit, faction);
  }, [data, unit, faction]);
  const selectedModels =
    modelSelection === 0 ? unitModels : [unitModels[modelSelection - 1]];
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
        <DialogTitle>
          {unit.name} <small>{`(${unitPoints} pts)`}</small>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ px: 2, py: 1 }} style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
            <FormControl>
              <RadioGroup
                row
                aria-label="gender"
                name="row-radio-buttons-group"
                onChange={(event) => setModelSelection(parseInt(event.target.value))}
                value={modelSelection}
              >
                {[{ name: "All" }, ...unitModels].map((model, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={model.name}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <TableContainer sx={{ borderRadius: '2px', mb: 2 }}>
              <Table size="small" style={{ borderColor: borderColor }}>
                <TableHead>
                  <StyledTableRow style={thStyle}>
                    <TableCell>{"Models"}</TableCell>
                    <TableCell className="text-center">
                      {"Model Points"}
                    </TableCell>
                    <TableCell className="text-center">{"Rule Points"}</TableCell>
                    <TableCell className="text-center">
                      {"Weapon Points"}
                    </TableCell>
                    <TableCell className="text-center">
                      {"Total Points"}
                    </TableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {selectedModels.map((model, index) => {
                    const modelPoints = Math.round(
                      data.getModelTotalPoints(
                        {
                          ...model,
                          rules: [...(model?.rules || []), ...(unit.rules || [])],
                        },
                        faction
                      )
                    );
                    const baseModelPoints = Math.round(
                      data.getModelPoints(
                        {
                          ...model,
                          rules: [...(model?.rules || []), ...(unit.rules || [])],
                        },
                        faction
                      )
                    );
                    const modelWeaponPoints = Math.round(
                      data.getModelWeaponPoints(
                        {
                          ...model,
                          rules: [...(model?.rules || []), ...(unit.rules || [])],
                        },
                        faction
                      )
                    );
                    const modelRulePoints = Math.round(
                      data.getModelRulePoints(
                        {
                          ...model,
                          rules: [...(model?.rules || []), ...(unit.rules || [])],
                        },
                        faction
                      )
                    );
                    return (
                      <StyledTableRow>
                        <TableCell>{`${model.name} x${model.min || 1
                          }`}</TableCell>
                        <TableCell className="text-center">
                          {baseModelPoints} pts (
                          {Math.round((baseModelPoints / modelPoints) * 100)}
                          %)
                        </TableCell>
                        <TableCell className="text-center">
                          {modelRulePoints} pts (
                          {Math.round((modelRulePoints / modelPoints) * 100)}
                          %)
                        </TableCell>
                        <TableCell className="text-center">
                          {modelWeaponPoints} pts (
                          {Math.round((modelWeaponPoints / modelPoints) * 100)}
                          %)
                        </TableCell>
                        <TableCell className="text-center">
                          {modelPoints} pts
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {selectedModels.map((model, index) => {
              const modelWeapons = get(model, "weapons", []);
              const modelRules = [
                ...get(unit, "rules", []),
                ...get(model, "rules", []),
              ];
              return (
                <>
                  {!!modelWeapons.length && (
                    <TableContainer sx={{ borderRadius: '2px', mb: 2 }}>
                      <Table
                        striped
                        responsive
                        size="small"
                        style={{ borderColor: borderColor }}
                      >
                        <TableHead>
                          <StyledTableRow style={thStyle}>
                            <TableCell>{`${model.name} Weapons`}</TableCell>
                            <TableCell className="text-center">{`Weapon Points`}</TableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {modelWeapons.map((weapon) => {
                            const weaponPointsForModel = Math.trunc(
                              data.getWeaponCostForModel(weapon, model, faction)
                            );
                            const weaponName = formatWeapon(
                              weapon,
                              faction,
                              data
                            );
                            return (
                              <StyledTableRow>
                                <TableCell>{weaponName}</TableCell>
                                <TableCell className="text-center">
                                  {weaponPointsForModel} pts
                                </TableCell>
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {!!modelRules.length && (
                    <TableContainer sx={{ borderRadius: '2px' }}>
                      <Table
                        striped
                        responsive
                        size="small"
                        style={{ borderColor: borderColor }}
                      >
                        <TableHead>
                          <StyledTableRow style={thStyle}>
                            <TableCell>{`${model.name} Rules`}</TableCell>
                            <TableCell className="text-center">
                              {"Rule Points"}
                            </TableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {modelRules.map((rule) => {
                            const rulePointsForModel = Math.trunc(
                              data.getRuleCostForModel(rule, model, faction)
                            );
                            const ruleName = formatRule(rule, faction, data);
                            return (
                              <StyledTableRow>
                                <TableCell>{ruleName}</TableCell>
                                <TableCell className="text-center">
                                  {rulePointsForModel} pts
                                </TableCell>
                              </StyledTableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              );
            })}
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
