import { Box, Table, TableBody, TableCell, TableContainer, TableHead, Typography } from '@mui/material';
import { WeaponList } from 'components/print/weapon-list';
import { RelicCard } from 'components/roster/relic-card';
import { RuleList } from 'components/roster/rule-list';
import { UnitCard } from 'components/roster/unit-card';
import { StyledTableRow } from 'components/styled-table';
import { find, get, orderBy, sortBy, sum, uniqBy } from 'lodash';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getTextColor, hexToRgb } from 'utils/colors';

export const PrintView = (props) => {
  const { list, forces, data } = props;
  const LIST_TYPES = [
    { label: 'Competitive', value: 'competitive' },
    { label: 'Narrative', value: 'narrative' },
    { label: 'Campaign', value: 'campaign' }
  ];
  const listType = list.type || 'competitive';
  const listTypeName = (find(LIST_TYPES, myType => myType.value === list.type) || {}).label || 'Competitive';
  const currentForcePoints = sum(
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
  const totalForcePoints = list.pointLimit || sum(
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
  const totalSP = (1 + Math.ceil(totalForcePoints / 500)) - sum(forces.map((force) => force.cost));
  const totalForceReservePoints = sum(forces.map((force) => {
    const unitPoints = sum(get(force, 'reserves', []).map((unit) => unit.points));
    return unitPoints;
  }));
  const legendLimit = Math.ceil(totalForcePoints / 500);
  return (
    <div>
      <div>
        <div>
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 2 }}
          >{`${list.name}`}</Typography>
          <Typography align="center" sx={{ mb: 4 }}>
            {`${listTypeName}, ${currentForcePoints}/${totalForcePoints} pts`},
            {listType === "campaign"
              ? ` ${totalForceReservePoints} pts of reserves,`
              : ""}
            {` ${totalSP} SP`},{" "}
            {`${legendLimit} Legend${legendLimit > 1 ? "s" : ""}`}
          </Typography>
        </div>
      </div>
      <div>
        {forces.map((force, index) => {
          const forceFactionId = get(force, 'faction.id');
          const forceSubFactionId = get(force, 'subFactionId');
          const forceFaction = data.getFactionWithSubfaction(forceFactionId, forceSubFactionId || 'none');
          // const forceSubfaction = data.getSubfaction(forceFactionId, forceSubFactionId || 'none');
          const { color: factionColor, secondary_color: factionSecondaryColor } = forceFaction;
          const textColor = factionColor ? getTextColor(hexToRgb(factionColor)) : 'white';
          const textColorSecondary = factionSecondaryColor ? getTextColor(hexToRgb(factionSecondaryColor)) : 'white';
          const borderColor = (textColor !== 'white') ? textColor : factionColor;
          const btnStyle = { borderColor };
          const thStyle = { backgroundColor: factionColor, color: textColor };
          const thStyle2 = {
            backgroundColor: factionSecondaryColor || factionColor,
            color: factionSecondaryColor ? textColorSecondary : textColor,
          };
          const forceCategories = Object.keys(get(force, 'categories', {}));
          const forceUnits = get(force, 'units', []);
          const factionRelics = data.getRelics(forceFaction);
          // const factionPowers = data.getPowers(forceFaction);
          // const hasPowers = !isNil(forceFaction.powers) && !isEqual(forceFaction.powers, {})
          // const factionStrategies = data.getStrategies(forceFaction);
          const units = forceUnits || [];
          const forceLegends = get(force, 'legends', []);
          const filteredCategories = forceCategories.filter((catKey) => forceUnits.filter((myUnit) => myUnit.category === catKey).length);
          const faction = forceFaction;
          const flatWeps = units.map((unit) => {
            return data.getWeaponList(get(unit, 'selectedWeapons', []), faction);
          }).flat();
          const allWeapons = uniqBy(flatWeps, (rule) => rule.id || rule);
          const rules = uniqBy(units.map((unit) => {
            return data.getRulesList(get(unit, 'selectedRules', []), faction)
          }).flat(), (rule) => rule.id || rule);
          const allWeaponRules = data.getAllWeaponRules(allWeapons, faction);
          const weaponsRules = uniqBy(allWeaponRules, (rule) => rule.id || rule);
          const allRules = uniqBy([...weaponsRules, ...rules], (rule) => rule.id || rule);
          const allSortedRules = sortBy(allRules, (rule) => rule.name || rule);
          const allSortedWeapons = sortBy(allWeapons, (weapon) => weapon.name || weapon);
          const powerCategories = { ...data.getRawPowerCategories(faction) };
          const allPowerSpecialties = [];
          forces.forEach((force) => {
            force?.units.forEach((unit) => {
              const powerSp = unit?.powerSpecialty;
              if (powerSp) {
                allPowerSpecialties.push(powerSp);
              }
            })
          });
          const powerSpecialtySet = new Set(allPowerSpecialties);
          const powers = data.getPowers(faction).filter((power) => powerSpecialtySet.has(power?.category) || !power?.category);
          const sortedPowers = sortBy(powers, ['category', 'charge']).reverse();
          const strategies = orderBy(data.getStrategies(faction), ['phase', 'cost'], ['desc', 'asc']);
          const phases = { ...data.getRawPhases() };
          return (
            <div>
              <div>
                {/* <div className="d-flex justify-content-between align-items-center">
                  <h4 className="text-left">{`${forceFaction.name} ${(!forceSubFactionId || forceSubFactionId === "none") ? '' : `(${forceSubfaction.name})`} - ${force.name}`}<small>{` (${force.cost} SP)`}</small></h4>
                </div> */}
                <div>
                  {((factionRelics.length) && (!!forceLegends.length)) && <>
                    {forceLegends.map((relic, unitIdx) => {

                      return (
                        <Box sx={{ mb: 2 }}>
                          <RelicCard printMode faction={faction} relic={relic} data={data} />
                        </Box>
                      )
                    })}
                  </>}
                  {filteredCategories.map((catKey, catIndex) => {
                    // const category = data.getCategory(catKey);
                    // const categoryData = data.getOrganizationCategory(force, catKey);
                    // const unitCatCount = forceUnits.filter((myUnit) => myUnit.category === catKey).length;
                    return (
                      <>
                        {/* <div className="d-flex justify-content-between  align-items-center">
                          <h4 style={{ margin: '0', padding: '8px 0' }} className="text-left">{category.name} {listType !== 'narrative' ? `${`(${categoryData.min || 0}-${categoryData.max})`}` : ''}</h4>
                        </div> */}
                        {forceUnits.filter((unit) => unit.category === catKey).map((unit, unitIdx) => {
                          // const unitOptions = get(unit, 'optionList', []);
                          // const unitCopy = get(list, `forces[${index}].units[${unit.id}]`);
                          const models = [...get(unit, 'models', []), ...data.getModelList(unit.selectedModels, faction)];
                          const weapons = data.getWeaponList(unit.selectedWeapons, faction);
                          const rules = data.getRulesList(unit.selectedRules, faction);
                          const allWeaponRules = data.getAllWeaponRules(weapons, faction);
                          const weaponsRules = uniqBy(allWeaponRules, (rule) => rule.id || rule);
                          const unitSetbacks = get(unit, 'selectedSetbacks', []).map((setback) => data.getSetback(faction, setback));
                          const unitPerks = get(unit, 'selectedPerks', []).map((perk) => data.getPerk(faction, perk));
                          const unitLevel = Math.floor((unit.experience || 0) / 5);
                          return (
                            <div style={{ marginBottom: '0.5em' }}>
                              <UnitCard
                                printMode
                                perks={unitPerks}
                                level={unitLevel}
                                setbacks={unitSetbacks}
                                points={unit.points}
                                models={models}
                                weapons={weapons}
                                faction={faction}
                                data={data}
                                unit={unit}
                                rules={rules}
                                weaponRules={weaponsRules}
                                showOptions={false}
                                embeddedOptions={true}
                                unitOptions={unit.selectedOptionsList}
                              />
                            </div>
                          )
                        })}
                      </>
                    );
                  })}
                  {!!allSortedWeapons.length && <div style={{ breakInside: 'avoid', marginBottom: '15px' }}>
                    <div className="unit-card" style={btnStyle}>
                      <div style={thStyle} className="unit-card-title">
                        <h4>Weapons</h4>
                      </div>
                      <div>
                        <WeaponList faction={faction} data={data} weapons={allSortedWeapons} />
                      </div>
                    </div>
                  </div>}
                  {!!allSortedRules.length && <div style={{ breakInside: 'avoid', marginBottom: '15px' }}>
                    <div className="unit-card" style={btnStyle}>
                      <div style={thStyle} className="unit-card-title">
                        <h4>Rules</h4>
                      </div>
                      <div className="unit-card-body">
                        {allSortedRules.map((rule) => (
                          <div>
                            <RuleList faction={faction} twoColumn={false} rules={[rule]} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>}
                  {!!powers.length && <div style={{ breakInside: 'avoid', marginBottom: '15px' }}>
                    <div className="unit-card" style={btnStyle}>
                      <div style={thStyle} className="unit-card-title">
                        <h4>Powers</h4>
                      </div>
                      <div>
                        <TableContainer>
                          <Table size="small" aria-label="simple table" style={{ padding: 0 }}>
                            <TableHead>
                              <StyledTableRow style={thStyle2}>
                                <TableCell>{"Power"}</TableCell>
                                <TableCell>{"Specialty"}</TableCell>
                                <TableCell align="center">{"Charge"}</TableCell>
                                <TableCell>{"Description"}</TableCell>
                              </StyledTableRow>
                            </TableHead>
                            <TableBody>
                              {sortedPowers.map((power) => {
                                return (
                                  <StyledTableRow>
                                    <TableCell>
                                      {power.name}
                                    </TableCell>
                                    <TableCell align="center">
                                      {get(powerCategories, `[${power.category}].name`, 'Any')}
                                    </TableCell>
                                    <TableCell align="center">
                                      {power.charge}
                                    </TableCell>
                                    <TableCell>
                                      <ReactMarkdown children={power.description} className="rule-text" />
                                    </TableCell>
                                  </StyledTableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </div>
                  </div>}
                  {!!strategies.length && <div style={{ breakInside: 'avoid', marginBottom: '15px' }}>
                    <div className="unit-card" style={btnStyle}>
                      <div style={thStyle} className="unit-card-title">
                        <h4>Strategies</h4>
                      </div>
                      <div>
                      <TableContainer>
                        <Table size="small" aria-label="simple table" style={{ padding: 0 }}>
                          <TableHead>
                            <StyledTableRow style={thStyle2}>
                              <TableCell>{"Strategy"}</TableCell>
                              <TableCell align="center">{"SP"}</TableCell>
                              <TableCell>{"Phase"}</TableCell>
                              <TableCell>{"Description"}</TableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            {strategies.map((strategy) => {
                              return (
                                <StyledTableRow>
                                  <TableCell>
                                    {strategy.name}
                                  </TableCell>
                                  <TableCell align="center">
                                    {strategy.cost}
                                  </TableCell>
                                  <TableCell>
                                    {get(phases, `[${strategy.phase}].name`, 'Activation')}
                                  </TableCell>
                                  <TableCell>
                                    <ReactMarkdown children={strategy.description} className="rule-text" />
                                  </TableCell>
                                </StyledTableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        </TableContainer>
                      </div>
                    </div>
                  </div>}
                  {!filteredCategories.length && <>
                    <p>Force is empty...</p>
                  </>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}