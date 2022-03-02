import { orderBy, get } from 'lodash';

export const formatModel = (model, unit, faction, data, options = {}) => {
  const weaponOrderer = (weapon) => {
    return get(data.getWeapon(weapon.id || weapon, faction), 'name');
  }
  const ruleOrderer = (rule) => {
    return get(data.getRule(rule.id || rule, faction), 'name');
  }
  const { hideCount } = options;
  const rules = [...(unit.rules || []), ...(model.rules || [])];
  const equipString = (model.weapons && model.weapons.length) ? ` equipped with (${orderBy((model.weapons || []), weaponOrderer, ['asc']).map((weapon) => {
    return formatWeapon(weapon, faction, data);
  }).join(', ') || "No Weapons"})` : '';
  const rulesString = (rules && rules.length) ? ` with specials (${orderBy((rules || []), ruleOrderer, ['asc']).map((rule) => {
    return formatRule(rule, faction, data);
  }).join(', ') || "-"})` : '';
  const modelCount = hideCount ? '' : `${model.min || 1}x `;
  return (
    `${modelCount}${model.name} ${equipString}${rulesString}`
  );
}

export const formatRule = (rule, faction, data) => {
  const ruleId = rule.id || rule;
  const ruleData = data.getRule(ruleId, faction);
  return (ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => rule[input]).join(', ')})` : ruleData.name);
}

export const formatWeapon = (weapon, faction, data, options={}) => {
  const weaponData = data.getWeapon(weapon.id || weapon, faction);
  const weaponCount = weapon.count;
  const weaponMount = weapon.mount;
  const wepName = weapon.name ? ` ${weapon.name} (${weaponData.name})` : weaponData.name;
  const wepMount = weaponMount ? ` [${weaponMount.join ? weaponMount.join(', ') : weaponMount}]` : '';
  return `${`${wepName}${weaponCount ? `(${weaponCount})` : ''}`}${wepMount}`;
}

export const LEVEL_TO_NAME = {
  0: 'No Rank',
  1: 'Rank I',
  2: 'Rank II',
  3: 'Rank III',
  4: 'Rank IV',
  5: 'Rank V',
  6: 'Rank VI',
  7: 'Rank VII',
  8: 'Rank VIII',
  9: 'Rank IX',
  10: 'Rank X',
  11: 'Rank XI',
  12: 'Rank XII',
}

export const formatLevel = (level) => {
  return LEVEL_TO_NAME[level];
}