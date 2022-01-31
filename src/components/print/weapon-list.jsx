import React, { useState } from 'react';
import { getTextColor, hexToRgb } from 'utils/colors';
import { get } from 'lodash';
import { RuleList } from 'components/roster/rule-list';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { StyledTableRow } from "components/styled-table";

export const WeaponList = (props) => {
  const { weapons, faction, data, toggler, rules, twoColumns = true } = props;
  const { color: factionColor, secondary_color: factionSecondaryColor } = faction;
  const textColor = factionColor ? getTextColor(hexToRgb(factionColor)) : 'white';
  const textColorSecondary = factionSecondaryColor ? getTextColor(hexToRgb(factionSecondaryColor)) : 'white';
  const borderColor = (textColor !== 'white') ? textColor : factionColor;
  const btnStyle = { borderColor };
  const thStyle = { backgroundColor: factionSecondaryColor || factionColor, color: factionSecondaryColor ? textColorSecondary : textColor };
  const [showWeapons, setShowWeapons] = useState(false);
  const renderRules = (rules) => {
    if (!rules || !rules.length) {
      return;
    }
    return (
      <div>
        <RuleList twoColumn={twoColumns} faction={faction} rules={rules} />
      </div>
    )
  }
  return (
    <div>
      {!!toggler && <div className="text-center">
        <div style={{ marginBottom: '0.5rem' }}>
          <Button variant="outline-primary" size="sm" block style={btnStyle} onClick={() => setShowWeapons(!showWeapons)}>{showWeapons ? 'Hide' : 'Weapons'}</Button>
        </div>
      </div>}
      <Collapse in={!toggler || showWeapons}>
        <div>
          <TableContainer>
            <Table size="small" aria-label="simple table" style={{ padding: 0 }}>
              <TableHead>
                <StyledTableRow style={thStyle}>
                  <TableCell>{"Weapon"}</TableCell>
                  <TableCell className="text-center">{"Range"}</TableCell>
                  <TableCell className="text-center">{"A"}</TableCell>
                  <TableCell className="text-center">{"AP"}</TableCell>
                  <TableCell>{"Special"}</TableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {weapons.map((weapon) => {
                  if (weapon.profiles) {
                    return weapon.profiles.map((weaponProfile) => {
                      return (
                        <StyledTableRow>
                          <TableCell>
                            {`${weapon.name} (${weaponProfile.name})`}
                          </TableCell>
                          <TableCell className="text-center">
                            {`${weapon.short !== "Melee" ? `${weaponProfile.short}"` : weaponProfile.short || '-'}/${weaponProfile.medium ? `${weaponProfile.medium}"` : '-'}`}
                          </TableCell>
                          <TableCell className="text-center">
                            {weaponProfile.attacks ? weaponProfile.attacks : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {weaponProfile.ap || '-'}
                          </TableCell>
                          <TableCell>
                            {[...get(weapon, 'rules', []), ...get(weaponProfile, 'rules', [])].map((rule) => {
                              const ruleData = data.getRule(rule.id || rule, faction);
                              return (ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => rule[input]).join(', ')})` : ruleData.name);
                            }).join(', ') || "-"}
                          </TableCell>
                        </StyledTableRow>
                      )
                    })
                  }
                  return (
                    <StyledTableRow>
                      <TableCell>
                        {weapon.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {`${weapon.short !== "Melee" ? `${weapon.short}"` : weapon.short || '-'}/${weapon.medium ? `${weapon.medium}"` : '-'}`}
                      </TableCell>
                      <TableCell className="text-center">
                        {weapon.attacks ? weapon.attacks : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {weapon.ap || '-'}
                      </TableCell>
                      <TableCell>
                        {get(weapon, 'rules', []).map((rule) => {
                          const ruleData = data.getRule(rule.id || rule, faction);
                          return (ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => rule[input]).join(', ')})` : ruleData.name);
                        }).join(', ') || "-"}
                      </TableCell>
                    </StyledTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {!!(rules && rules.length) && <>
            {renderRules(rules)}
          </>
          }
        </div>
      </Collapse>
    </div>
  );
}