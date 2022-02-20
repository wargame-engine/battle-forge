import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { OptionList } from "components/roster/option-list";
import { StyledTableRow } from "components/styled-table";
import { isNumber } from "lodash";
import React, { useState } from "react";
import { getTextColor, hexToRgb } from "utils/colors";
import { formatModel } from "utils/format";

export const UnitStats = (props) => {
  const { data, unit, faction, toggler, models, options, perks, setbacks, powerSpecialty } =
    props;
  const [showOptions, setShowOptions] = useState(false);
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
  const btnStyle = { borderColor };
  const unitModels = (models ? models : data.getModels(unit, faction)).filter(
    (model) =>
      !(model.shoot === "-" && model.fight === "-" && model.save === "-")
  );
  const perkString =
    perks && perks.length
      ? `${perks.length > 1 ? "perks" : "the perk"} (${perks
        .map((perk) => perk.name)
        .join(", ")})`
      : "";
  const setbackString =
    setbacks && setbacks.length
      ? `${setbacks.length > 1 ? "injuries" : "the injury"} (${setbacks
        .map((setback) => setback.name)
        .join(", ")})`
      : "";
  const combinedString = [perkString, setbackString]
    .filter((str) => str.length)
    .join(" and ");
  const unitPowerSpecialty = powerSpecialty;
  const renderAdditionalModels = (unit, faction) => {
    return (
      <ul className="ul-indent" style={{ marginBottom: 0, marginTop: 0 }}>
        {(unit.models || [])
          .filter((model) => model.min > 0)
          .map((model) => formatModel(model, unit, faction, data))
          .map((modelString) => (
            <li>{modelString}</li>
          ))}
      </ul>
    );
  };
  if (!unit) {
    return null;
  }
  return (
    <div>
      {!!toggler && (
        <div align="center" style={{ padding: "0.5rem 0px" }}>
          <Button
            variant="outline-primary"
            size="sm"
            style={btnStyle}
            block
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? "Hide" : "Unit Stats"}
          </Button>
        </div>
      )}
      <Collapse in={!toggler || showOptions}>
        <div>
          <>{renderAdditionalModels(unit, faction)}</>
          <div>
            {!!options && (
              <OptionList
                twoColumn={false}
                faction={faction}
                options={options}
                toggler={false}
              />
            )}
          </div>
          {!!unitPowerSpecialty && <div style={{ marginBottom: '0.5rem' }}><ul className="optionUl">{!!unitPowerSpecialty && <li>The unit has the "{unitPowerSpecialty}" Power specialty</li>}</ul></div>}
          <div style={{ marginBottom: "0.5rem" }}>
            <ul className="optionUl">
              {!!combinedString && <li>The unit has {combinedString}</li>}
            </ul>
          </div>
          {!!unitModels.length && (
            <>
              <TableContainer sx={{ borderRadius: '2px' }}>
                <Table size="small" aria-label="simple table" style={{ padding: 0 }}>
                  <TableHead>
                    <StyledTableRow style={thStyle}>
                      <TableCell>{"Model"}</TableCell>
                      <TableCell align="center">{"Mov"}</TableCell>
                      <TableCell align="center">{"Acc"}</TableCell>
                      <TableCell align="center">{"Str"}</TableCell>
                      <TableCell align="center">{"Sav"}</TableCell>
                      <TableCell align="center">{"Init"}</TableCell>
                      <TableCell align="center">{"Co"}</TableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {unitModels.map((model) => (
                      <StyledTableRow>
                        <TableCell>{model.name}</TableCell>
                        <TableCell align="center">
                          {`${isNumber(model.movement)
                              ? `${model.movement}"`
                              : model.movement
                            }`}
                        </TableCell>
                        <TableCell align="center">
                          {`${!!model.shoot ? `${model.shoot}` : "-"}`}
                        </TableCell>
                        <TableCell align="center">
                          {`${!!model.fight ? `${model.fight}` : "-"}`}
                        </TableCell>
                        <TableCell align="center">
                          {`${!!model.defense ? `${model.defense}` : "-"}`}
                        </TableCell>
                        <TableCell align="center">
                          {`${!!model.reflexes ? `${model.reflexes}` : "-"}`}
                        </TableCell>
                        <TableCell align="center">
                          {`${!!model.courage ? `${model.courage}` : "-"}`}
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};
