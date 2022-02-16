import { castArray, clamp, get, intersection, isArray, isNil, isNumber, isString, mapValues, mean, mergeWith, pickBy, sortBy, sum, toNumber, uniq } from 'lodash';
import { formatModel, formatWeapon } from 'utils/format';
import { getRandomItem, round5 } from 'utils/math';

export const DataAPI = (data, root={}) => {
  const factionList = Object.values(data.factions || {});
  const globalWeapons = data.weapons || {};
  const globalUnits = data.units || {};
  const globalRules = data.rules || {};
  const globalPowers = data.powers || {};
  const globalStrategies = data.strategies || {};
  const globalPerks = data.perks || {};
  const globalSetbacks = data.setbacks || {};
  const globalRelics = data.relics || {};
  const globalModels = data.models || {};
  const globalTerrain = data.terrain || {};
  const globalPowerCategories = data.powerCategories || {};
  const rootWeapons = root.weapons || {};
  const rootRules = root.rules || {};
  const rootPhases = root.phases || {};
  const rootStrategies = root.strategies || {};
  const rootPerks = root.perks || {};
  const rootSetbacks = root.setbacks || {};
  const rootGameTypes = root.gameTypes || {};
  const rootTerrain = root.terrain || {};
  const rootMissions = root.missions || {};
  const rootPowerCategories = root.powerCategories || {};

  const CONSTANTS = {
    baseStats: {
      movement: 6,
      shoot: 5,
      fight: 5,
      courage: 5,
      reflexes: 5,
      wounds: 1,
      defense: 5,
      baseCost: 5
    },
    woundsCost: 5,
    courageCost: 2,
    defenseCost: 2,
    apCost: 1,
    damageCost: 5,
    movementCost: 1
  }

  const dummyTarget = {
    name: "Battle Brother",
    courage: 7,
    shoot: 6,
    fight: 6,
    defense: 8,
    movement: 5,
    reflexes: 7,
    agility: 6,
    wounds: 1,
    weapons: [{ "id": "marine_rifle" }, "at_grenade", "ccw", "marine_pistol"],
    min: 4,
    max: 9
  };

  // const dummyFaction = {
  //   units: {}
  // }

  const getGameType = (gameType) => {
    return rootGameTypes[gameType] || {};
  }

  const getRawCategories = () => {
    return data.categories || {};
  }

  const getNameLists = () => {
    const nameLists = {...get(root, 'nameLists', {})};
    return sortBy(Object.keys(nameLists).map((key) => ({
      id: key,
      ...nameLists[key]
    })), 'name');
  }

  const getNameList = (listId) => {
    return get(root, `nameLists[${listId}]`, {});
  }

  const getRandomName = (listId) => {
    const list = getNameList(listId);
    const firstNames = uniq([...get(list, 'male.first', []), ...get(list, 'any.first', []), ...get(list, 'female.first', [])]);
    const middleNames = uniq([...get(list, 'male.middle', []), ...get(list, 'any.middle', []), ...get(list, 'female.middle', [])]);
    const lastNames = uniq([...get(list, 'male.last', []), ...get(list, 'any.last', []), ...get(list, 'female.last', [])]);
    return `${getRandomItem(firstNames)}${middleNames.length ? ' ' + getRandomItem(middleNames) : ''}${lastNames.length ? ' ' + getRandomItem(lastNames) : ''}`;
  }

  const getRandomMaleName = (listId) => {
    const list = getNameList(listId);
    const firstNames = uniq([...get(list, 'male.first', []), ...get(list, 'any.first', [])]);
    const middleNames = uniq([...get(list, 'male.middle', []), ...get(list, 'any.middle', [])]);
    const lastNames = uniq([...get(list, 'male.last', []), ...get(list, 'any.last', [])]);
    return `${getRandomItem(firstNames)}${middleNames.length ? ' ' + getRandomItem(middleNames) : ''}${lastNames.length ? ' ' + getRandomItem(lastNames) : ''}`;
  }

  const getRandomFemaleName = (listId) => {
    const list = getNameList(listId);
    const firstNames = uniq([...get(list, 'female.first', []), ...get(list, 'any.first', [])]);
    const middleNames = uniq([...get(list, 'female.middle', []), ...get(list, 'any.middle', [])]);
    const lastNames = uniq([...get(list, 'female.last', []), ...get(list, 'any.last', [])]);
    return `${getRandomItem(firstNames)}${middleNames.length ? ' ' + getRandomItem(middleNames) : ''}${lastNames.length ? ' ' + getRandomItem(lastNames) : ''}`;
  }

  const getRawPhases = () => {
    return { ...rootPhases, ...(data.phases || {}) };
  }

  const getPhase = (categoryId) => {
    return rootPhases[categoryId] || (data.phases || {})[categoryId] || {};
  }

  const getOrganizations = () => {
    return Object.values(data.organizations || {});
  }

  const getRawOrganizations = () => {
    return data.organizations || {};
  }

  const getOrganizationSlotsRaw = (organization) => {
    return Object.keys(organization.categories || {});
  }

  const getOrganizationCategory = (organization, category) => {
    return get(organization, `categories[${category}]`, {});
  }

  const getCategories = () => {
    return Object.values(data.categories || {});
  }

  const getRawPowerCategories = (faction) => {
    return { ...rootPowerCategories, ...(faction.powerCategories || {}) };
  }

  const getPowerCategories = (faction) => {
    return Object.values(faction.powerCategories || {});
  }

  const getPowerCategory = (categoryId, faction) => {
    return (faction.powerCategories || {})[categoryId] || {};
  }

  const getTerrain = () => {
    return Object.values({ ...rootTerrain, ...globalTerrain });
  }

  const getCategory = (categoryId) => {
    return (data.categories || {})[categoryId] || {};
  }

  const getRule = (ruleName, faction) => {
    const ruleId = ruleName.id || ruleName;
    return (faction.rules || {})[ruleId] || { name: `${ruleId} not found`, id: ruleId };
  };

  const getWeapon = (weaponName, faction) => {
    const weaponId = weaponName.id || weaponName;
    return faction.weapons[weaponId] || { id: `${weaponId} not found`, name: `${weaponId} not found` };
  };

  const getModel = (modelName, faction) => {
    const modelId = modelName.id || modelName;
    return (faction.models || {})[modelId] || { id: `${modelId} not found`, name: `${modelId} not found` };
  };

  const getModelList = (modelList, faction) => {
    const models = modelList.map((modelName) => getModel(modelName, faction)).filter(model => !!model);
    return sortBy(models, 'name');
  };

  const getPower = (powerName, faction) => {
    const powerId = powerName.id || powerName;
    return faction.powers[powerId] || { name: `${powerId} not found`, description: `Could not find power ${powerId}` };
  }

  const getStrategy = (strategyName, faction) => {
    const strategyId = strategyName.id || strategyName;
    return faction.strategies[strategyId] || { name: `${strategyId} not found` };
  }

  const getRawAlliances = () => {
    return data.alliances || {};
  }

  const getAlliance = (allianceName) => {
    return get(data, `alliances[${allianceName}]`, {});
  };

  const getAlliances = () => {
    return Object.values(data.alliances || {});
  }

  const getFactions = () => {
    return factionList;
  };

  const getRawFaction = (factionName) => {
    return get(data, `factions[${factionName}]`, {});
  };

  const getSubfactionNameList = (subfactionList, subfactions) => {
    if (new Set(subfactionList).has('none')) {
      return '';
    }
    const listString = subfactionList.map((subfactionKey) => subfactions[subfactionKey] || '')
      .filter((name) => !!name)
      .map((subfaction) => subfaction.name).join(', ');
    return listString;
  }

  const hasSubfactions = (thing) => {
    if (!thing.subfactions) {
      return false;
    }
    if (new Set(thing.subfactions).has('none')) {
      return false;
    }
    return thing.subfactions.length;
  }

  const getFaction = (factionName) => {
    const faction = get(data, `factions[${factionName}]`, {});
    const subfactionList = get(faction, `subfactions`, {});
    return {
      ...faction,
      powerCategories: { ...rootPowerCategories, ...globalPowerCategories, ...(faction.powerCategories || {}) },
      models: { ...globalModels, ...(faction.models || {}) },
      powers: {
        ...mapValues(globalPowers, (strat) => ({
          ...strat,
          source: `${data.name} - Core`
        })),
        ...mapValues((faction.powers || {}), (strat) => ({
          ...strat,
          source: hasSubfactions(strat) ? `${data.name} - ${faction.name} - ${getSubfactionNameList(strat.subfactions, subfactionList)}` : `${data.name} - ${faction.name}`
        })),
      },
      strategies: {
        ...mapValues(rootStrategies, (strat) => ({
          ...strat,
          source: `${data.name} - Core`
        })),
        ...mapValues(globalStrategies, (strat) => ({
          ...strat,
          source: `${data.name} - Core`
        })),
        ...mapValues((faction.strategies || {}), (strat) => ({
          ...strat,
          source: hasSubfactions(strat) ? `${data.name} - ${faction.name} - ${getSubfactionNameList(strat.subfactions, subfactionList)}` : `${data.name} - ${faction.name}`
        })),
      },
      perks: { ...rootPerks, ...globalPerks, ...(faction.perks || {}) },
      setbacks: { ...rootSetbacks, ...globalSetbacks, ...(faction.setbacks || {}) },
      weapons: { ...rootWeapons, ...globalWeapons, ...(faction.weapons || {}) },
      rules: { ...rootRules, ...globalRules, ...(faction.rules || {}) },
      units: { ...globalUnits, ...(faction.units || {}) },
      relics: {
        ...mapValues(globalRelics, (strat) => ({
          ...strat,
          source: `${data.name} - Core`
        })),
        ...mapValues((faction.relics || {}), (strat) => ({
          ...strat,
          source: hasSubfactions(strat) ? `${data.name} - ${faction.name} - ${getSubfactionNameList(strat.subfactions, subfactionList)}` : `${data.name} - ${faction.name}`
        })),
      }
    };
  };

  const getSubfaction = (factionName, subfactionName) => {
    return get(data, `factions[${factionName}].subfactions[${subfactionName}]`, {});
  };

  const getFactionWithSubfaction = (factionName, subfaction) => {
    const subfactionName = subfaction;
    const faction = getFaction(factionName);
    // const subfactionList = get(faction, `subfactions`, {});
    const subfactionData = get(faction, `subfactions[${subfactionName}]`, {});
    const subfactionFilter = (thing) => {
      const subfactionset = new Set(get(thing, 'subfactions', []));
      return subfactionset.has(subfaction) || (subfactionset.size === 0) || (subfactionset.has('none') && !subfactionData.restricted);
    };
    // const nonefilter = (thing) => {
    //   const subfactionset = new Set(get(thing, 'subfactions', []));
    //   return subfactionset.has('none') || (subfactionset.size === 0) || (subfactionset.has('none') && !subfactionData.restricted);
    // };
    // Filter unit options by subfaction
    const units = mapValues(pickBy(get(faction, 'units', {}), subfactionFilter), ((unit) => {
      return {
        ...unit,
        options: get(unit, 'options', []).filter(subfactionFilter),
        models: get(unit, 'models', []).map((model) => {
          return {
            ...model,
            options: get(model, 'options', []).filter(subfactionFilter)
          }
        })
      }
    }));
    const dataWithSubfaction = {
      ...faction,
      color: faction.color,
      units: units,
      powers: mapValues(pickBy(get(faction, 'powers', {}), subfactionFilter), (strat) => ({
        ...strat
      })),
      relics: mapValues(pickBy(get(faction, 'relics', {}), subfactionFilter), (strat) => ({
        ...strat
      })),
      strategies: mapValues(pickBy(get(faction, 'strategies', {}), subfactionFilter), (strat) => ({
        ...strat
      }))
    };
    return dataWithSubfaction;
  };

  const getAllKeywords = (faction) => {
    const keywords = new Set();
    getUnits(faction).forEach((unit) => {
      (unit.keywords || []).forEach((keyword) => {
        if (!keywords.has(keyword)) {
          keywords.add(keyword);
        }
      })
    });
    return Array.from(keywords);
  }

  const getPowers = (faction) => {
    return Object.values({ ...(faction.powers || {}) });
  }

  const getStrategies = (faction) => {
    return Object.values({ ...(faction.strategies || {})});
  }

  const getPerks = (faction) => {
    const perks = {...get(faction, 'perks', {})};
    return sortBy(Object.keys(perks).map((key) => ({
      id: key,
      ...perks[key]
    })), 'name');
  }

  const getSetbacks = (faction) => {
    const setbacks = {...get(faction, 'setbacks', {})};
    return sortBy(Object.keys(setbacks).map((key) => ({
      id: key,
      ...setbacks[key]
    })), 'name');
  }

  const getSetback = (faction, setbackId) => {
    if (!faction || !setbackId) {
      return {};
    }
    const setbacks = { ...get(faction, 'setbacks', {})};
    return setbacks[setbackId];
  }

  const getPerk = (faction, perkId) => {
    if (!faction || !perkId) {
      return {};
    }
    const perks = { ...get(faction, 'perks', {})};
    return perks[perkId];
  }

  const getRelics = (faction) => {
    if (!faction) {
      return [];
    }
    const relics = {...globalRelics, ...get(faction, 'relics', {})};
    return sortBy(Object.keys(relics).map((key) => ({
      id: key,
      ...relics[key]
    })), 'name');
  }

  const getRelic = (faction, relicId) => {
    if (!faction || !relicId) {
      return {};
    }
    const relics = { ...get(faction, 'relics', {})};
    return relics[relicId];
  }

  const getRelicCost = (relic, faction) => {
    if (!relic) {
      console.log(relic, 'not found');
      return 0;
    }
    return get(relic, 'points', 0);
  }

  const getUnits = (faction) => {
    if (!faction || !faction.units) {
      return [];
    }
    const units = {...faction.units};
    return sortBy(Object.keys(units).map((key) => ({
      id: key,
      ...units[key]
    })), 'name');
  };

  const getUnit = (faction, unitId) => {
    if (!faction || !faction.units) {
      return {};
    }
    const units = {...faction.units};
    return units[unitId];
  };

  const getModels = (unit, faction) => {
    const modelMap = [];
    const models = (unit.models || []);
    models.forEach((model) => {
      modelMap.push(model);
      (model.options || []).forEach((option) => {
        if (option.replaceModel) {
          const addModels = castArray(option.replaceModel);
          addModels.forEach((addedModel) => {
            const theModel = getModel(addedModel, faction);
            const modelData = { id: addedModel, ...theModel };
            modelMap.push(modelData);
          })
        }
      })
    });
    (unit.options || []).forEach((option) => {
      if (option.addModel) {
        const addModels = castArray(option.addModel);
        addModels.forEach((addedModel) => {
          const theModel = getModel(addedModel, faction);
          const modelData = { id: addedModel, ...theModel };
          if (theModel) {
            modelMap.push(modelData);
          }
        })
      }
    })
    // models.forEach((model) => {
    //   const optionalRules = (model.options || []).map((option) => option.addRule || option.replaceRule).reduce(concat, []).filter((rule) => !!rule);
    //   const rules = [...(model.rules || []), ...optionalRules];
    //   rules.forEach((rule) => {
    //     const ruleData = getRule(rule, faction);
    //     const ruleEffects = ruleData.effects || [];
    //     ruleEffects.forEach((effect) => {
    //       if (effect.type === 'spawnModel') {
    //         const spawnedModelsList = castArray(effect.model || []);
    //         spawnedModelsList.forEach((modelId) => {
    //           const modelData = getModel(modelId, faction);
    //           modelMap.push(modelData);
    //         });
    //       }
    //     })
    //   });
    // });
    return uniq(modelMap);
  }

  const getAllModels = (faction, options = { filter: {} }) => {
    const { filter } = options;
    const keywords = filter.keywords || [];
    return getUnits(faction)
      .filter((unit) => {
        return (keywords.length) ? intersection(keywords, (unit.keywords || ["Infantry"])).length : true
      })
      .reduce((currModels, unit) => {
        return currModels.concat(getModels(unit, faction).map((model) => ({ ...model, rules: [...(model.rules || []), ...(unit.rules || [])] })));
      }, []);
  };

  const getAddTerm = (addLimit) => {
    let addTerm = '';
    if (addLimit && addLimit > 1) {
      addTerm = ` up to ${addLimit}x`;
    }
    if (addLimit && addLimit === 1) {
      addTerm = ' one';
    }
    return addTerm;
  }

  const getModelAddTerm = (modelLimit, model) => {
    let addTerm = '';
    const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
    if (!modelLimit && model.max > 1) {
      addTerm = ' any';
    }
    if (modelLimit === 'all') {
      addTerm = 'all ';
    }
    if (modelLimit && modelLimit > 1) {
      addTerm = ` up to ${modelLimit}x `;
    }
    if (modelLimit && modelLimit === 1 && model.max > 1) {
      addTerm = ` ${modelLimit}x `;
    }
    if (limitSplit && limitSplit.length === 2) {
      addTerm = ` ${limitSplit[0]}x for each ${limitSplit[1]}x `;
    }
    return addTerm;
  }

  const getAddLimitTermUnit = (addLimit) => {
    let addTerm = ' any model';
    const limitSplit = typeof addLimit === "string" ? addLimit.split('/') : null;
    if (addLimit && addLimit > 1) {
      addTerm = ` up to ${addLimit}x models`;
    }
    if (addLimit && addLimit === 1) {
      addTerm = ' one model';
    }
    if (addLimit && addLimit === 'all') {
      addTerm = ' all models';
    }
    if (limitSplit && limitSplit.length === 2) {
      addTerm = ` ${limitSplit[0]}x for each ${limitSplit[1]}x models in the unit`;
    }
    return addTerm;
  }

  const getAddTermUnit = (addLimit) => {
    let addTerm = '';
    if (addLimit && addLimit > 1) {
      addTerm = ` up to ${addLimit}x of`;
    }
    if (addLimit && addLimit === 1) {
      addTerm = ' one';
    }
    return addTerm;
  }

  // const canSpawnModel = (rule, faction) => {
  //   const ruleData = getRule(rule, faction);
  //   const models = (ruleData.effects || []).map((effect) => effect.model).filter((model) => !!model);
  //   return models.map((model) => {
  //     const rules = model.rules || [];
  //     // Additional Models
  //     const modelStats = `${(model.weapons || []).map((weapon) => {
  //       const weaponData = getWeapon(weapon.id || weapon, faction);
  //       const weaponCount = weapon.count || 1;
  //       return `${weaponCount > 1 ? `${weapon.count}x ` : ''}(${weaponData.name}${weapon.mount ? ` [${weapon.mount.join(', ')}]` : ''}`;
  //     }).join(', ') || "No Weapons"})${rules && rules.length ? ` with specials (${(rules || []).map((rule) => {
  //       const ruleId = rule.id || rule;
  //       const ruleData = getRule(ruleId, faction);
  //       return (ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => rule[input]).join(', ')})` : ruleData.name);
  //     }).join(', ') || "-"})` : ''}`;
  //     return `${model.name} equipped with ${modelStats}`;
  //   });
  // }

  const getAdditionalModelsList = (unit, faction) => {
    const upgrades = [];
    (unit.models || []).forEach((model, modelIndex) => {
      // const rules = [...(unit.rules || []), ...(model.rules || [])];
      const min = get(model, 'min', 1);
      const max = get(model, 'max', 1);
      // Additional Models
      if (min < max) {
        const upgradeCount = max - min === 1 ? undefined : max - min;
        const addTerm = getAddTerm(upgradeCount);
        const modelPoints = Math.trunc(getModelTotalPoints({
          ...model,
          rules: [
            ...(model.rules || []),
            ...(unit.rules || [])
          ]
        }, faction));
        const modelStats = formatModel(model, unit, faction, {getWeapon, getRule}, { hideCount: true });
        const addList = [
          {
            text: `${modelStats} for ${modelPoints}pts${upgradeCount > 1 ? ` each` : ''}`,
            points: modelPoints,
            modelIds: [ modelIndex ],
            limit: max - min,
            choiceLimit: max - min,
            models: true,
          }
        ]
        upgrades.push({ option: `Add ${addTerm}`, list: sortBy(addList, 'points') })
      }
    });
    return upgrades;
  };

  const getOptionsList = (unit, faction, unitData = { selectedModels: {}, selectedModelsRaw: {} }) => {
    const { selectedModels, selectedModelsRaw } = unitData;
    const unitTotalModels = sum(Object.values(selectedModels));
    let upgrades = [];
    upgrades = upgrades.concat(getAdditionalModelsList(unit, faction));
    // Check any additional model first
    if (unit.options) {
      (unit.options || []).forEach((option) => {
        if (option.addModel) {
          const model = castArray(option.addModel || []);
          const modelLimit = option.modelLimit;
          const modelAddTerm = getAddTerm(modelLimit);
          const isEach = modelLimit > 1 || typeof modelLimit === 'string' || (model.max > 1 && !modelLimit);
          const addList = model.map((addedList) => {
            let totalCost = 0;
            const addedWeaponList = castArray(addedList);
            const addedListString = addedWeaponList.map((addedMod) => {
              const addedModel = getModel(addedMod, faction);
              const rules = [...(unit.rules || []), ...(addedModel.rules || [])];
              const modelPoints = Math.trunc(getModelTotalPoints({
                ...addedModel,
                rules
              }, faction));
              totalCost += modelPoints;
              const modelStats = formatModel(addedModel, unit, faction, {getWeapon, getRule}, { hideCount: true });
              return `${modelStats}`;
            }).join(' and ');
            return {
              text: `${addedListString} for ${Math.trunc(totalCost)}pts${isEach ? ' each' : ''}`,
              points: totalCost,
              limit: (modelLimit || 1) * (model.max || 1),
              choiceLimit: (modelLimit || 1) * (model.max || 1),
              model: addedWeaponList,
              modelIds: addedWeaponList,
              models: true
            };
          });
          upgrades.push({ option: `Add ${modelAddTerm}`, list: sortBy(addList, 'points') })
        }
      })
    }
    getModels(unit, faction).forEach((mod, modelIndex) => {
      const modelId = mod.id || modelIndex;
      const numThisModel = selectedModels[modelId];
      const numThisModelRaw = selectedModelsRaw[modelId];
      const model = {
        ...mod,
        rules: [
          ...(mod.rules || []),
          ...(unit.rules || [])
        ]
      };
      if (model.options) {
        model.options.forEach((option) => {
          if (option.replaceModel) {
            let totalOldCost = 0;
            const replaceLimit = option.limit;
            let modelReplaceLimit = option.modelLimit;
            const replaceTerm = getAddTerm(replaceLimit, model);
            const modelReplaceTerm = getModelAddTerm(modelReplaceLimit, model);
            const isEach = replaceLimit > 1 || modelReplaceLimit > 1 || typeof modelReplaceLimit === 'string' || (model.max > 1 && !modelReplaceLimit);
            // Get current model cost
            const moddedModel = {
              ...model,
              rules: [
                ...(model.rules || []),
                ...(unit.rules || [])
              ]
            };
            totalOldCost += Math.trunc(getModelTotalPoints(moddedModel, faction, false));
            const replaceTarget = castArray(option.replaceModel || [])
              .map((replacedWith) => {
                let totalCost = 0;
                const replacedWithList = castArray(replacedWith);
                const replaceList = replacedWithList.map((addedMod) => {
                  const addedModel = getModel(addedMod, faction);
                  const rules = [...(unit.rules || []), ...(addedModel.rules || [])];
                  const newModModel = {
                    ...addedModel,
                    rules
                  };
                  const modelPoints = Math.trunc(getModelTotalPoints(newModModel, faction, false));
                  totalCost += modelPoints;
                  const modelStats = formatModel(addedModel, unit, faction, {getWeapon, getRule}, { hideCount: true });
                  return `${modelStats}`;
                }).join(' and ');
                const totalCostDiff = Math.trunc(totalCost - totalOldCost);
                const limitSplit = typeof modelReplaceLimit === "string" ? modelReplaceLimit.split('/') : null;
                if (limitSplit && limitSplit.length === 2) {
                  modelReplaceLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModelRaw);
                }
                return {
                  text: `${replaceList} for ${totalCostDiff}pts${isEach ? ' each' : ''}`,
                  points: totalCostDiff,
                  all: modelReplaceLimit === 'all',
                  model: replacedWithList,
                  replacedModel: [ modelIndex ],
                  modelIds: replacedWithList,
                  models: false,
                  limit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModelRaw) * (replaceLimit || 1),
                  choiceLimit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModelRaw) * (replaceLimit || 1)
                };
              });
              upgrades.push({ option: `Replace ${modelReplaceTerm} ${model.name} with${replaceTerm}`, list: sortBy(replaceTarget, 'points') });
          }
          if (option.replaceWeapon) {
            let totalOldCost = 0;
            const count = option.count || 1;
            const replaceTermCount = getAddTerm(count, model);
            const replaceLimit = option.limit;
            let modelReplaceLimit = option.modelLimit;
            const replaceTerm = getAddTerm(replaceLimit, model);
            const modelReplaceTerm = getModelAddTerm(modelReplaceLimit, model);
            const isEach = replaceLimit > 1 || modelReplaceLimit > 1 || typeof modelReplaceLimit === 'string' || (model.max > 1 && !modelReplaceLimit);
            const replaceWeaponList = castArray(option.replaceWeapon);
            const replaceThingList = replaceWeaponList.map((replacedWeapon) => {
              totalOldCost += getWeaponCostForModel(replacedWeapon, model, faction);
              return formatWeapon(replacedWeapon, faction, { getWeapon });
            }).join(' and ');
            const replaceTarget = castArray(option.withWeapon || [])
              .map((replacedWith) => {
                let totalCost = 0;
                const replacedWithList = castArray(replacedWith);
                const replaceList = replacedWithList.map((replaceWith) => {
                  totalCost += getWeaponCostForModel(replaceWith, model, faction);
                  return formatWeapon(replaceWith, faction, { getWeapon });
                }).join(' and ');
                const cost = Math.trunc(totalCost - totalOldCost);
                const limitSplit = typeof modelReplaceLimit === "string" ? modelReplaceLimit.split('/') : null;
                if (limitSplit && limitSplit.length === 2) {
                  modelReplaceLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModel);
                }
                return {
                  text: `${replaceList} for ${cost}pts${isEach ? ' each' : ''}`,
                  points: cost,
                  all: modelReplaceLimit === 'all',
                  weapons: replacedWithList,
                  limit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModel) * (replaceLimit || 1) * count,
                  choiceLimit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModel) * (replaceLimit || 1) * count
                };
              });
              upgrades.push({ option: `Replace ${modelReplaceTerm} ${model.name} ${replaceTerm === 'all ' || replaceLimit > 1 ? `models` : `model`}${count > 1 ? ` ${replaceTermCount}` : ''} ${replaceThingList} with${replaceTerm}`, list: sortBy(replaceTarget, 'points') });
          }
          if (option.replaceRule) {
            let totalOldCost = 0;
            const count = option.count || 1;
            const replaceTermCount = getAddTerm(count, model);
            const replaceLimit = option.limit;
            let modelReplaceLimit = option.modelLimit;
            let replaceTerm = '';
            if (replaceLimit && replaceLimit > 1) {
              replaceTerm = `up to ${replaceLimit}x `;
            }
            if (!replaceLimit && model.max > 1) {
              replaceTerm = 'any ';
            }
            if (!replaceLimit === 'all') {
              replaceTerm = 'all ';
            }
            const isEach = replaceLimit > 1 || modelReplaceLimit > 1 || typeof modelReplaceLimit === 'string' || (model.max > 1 && !modelReplaceLimit);
            const replaceWeaponList = castArray(option.replaceRule);
            const replaceThingList = replaceWeaponList.map((replacedWeapon) => {
              const replace = replacedWeapon.id || replacedWeapon;
              const ruleData = getRule(replace, faction);
              totalOldCost += getRuleCostForModel(replacedWeapon, model, faction);
              return `${ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => replacedWeapon[input]).join(', ')})` : ruleData.name}`;
            }).join(' and ');
            const replaceTarget = castArray(option.withRule)
              .map((replacedWith) => {
                let totalCost = 0;
                const replacedWithList = castArray(replacedWith);
                const replaceList = replacedWithList.map((replaceWith) => {
                  const replaceWithId = replaceWith.id || replaceWith;
                  let ruleData = getRule(replaceWithId, faction);
                  const shortDescription = ruleData.description_short ? ` (${ruleData.description_short})` : '';
                  const ruleInputs = ruleData.inputs ? `(${(ruleData.inputs || []).map((input) => replaceWith[input]).join(', ')})` : '';
                  const ruleDescription = shortDescription || ruleInputs || '';
                  totalCost += getRuleCostForModel(replacedWith, model, faction);
                  return `${ruleData.name}${ruleDescription}`;
                }).join(' and ');
                const totalCostDiff = Math.trunc(totalCost - totalOldCost);
                const limitSplit = typeof modelReplaceLimit === "string" ? modelReplaceLimit.split('/') : null;
                if (limitSplit && limitSplit.length === 2) {
                  modelReplaceLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModel);
                }
                return {
                  text: `${replaceList} for ${totalCostDiff}pts${isEach ? ' each' : ''}`,
                  points: totalCostDiff,
                  rules: replacedWithList,
                  all: modelReplaceLimit === 'all',
                  limit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModel) * (replaceLimit || 1) * count,
                  choiceLimit: ((modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || numThisModel) * (replaceLimit || 1) * count
                };
              });
              upgrades.push({ option: `Replace ${replaceTerm}${model.name} ${replaceTerm === 'all ' || replaceTerm === 'any ' ? 'models' : 'model'}${count > 1 ? ` ${replaceTermCount}` : ''} ${replaceThingList} with`, list: sortBy(replaceTarget, 'points') });
          }
          if (option.addWeapon) {
            const count = option.count || 1;
            const replaceTermCount = getAddTerm(count, model);
            const addLimit = option.limit;
            let modelLimit = option.modelLimit;
            const addTerm = getAddTerm(addLimit);
            let modelAddTerm = getModelAddTerm(modelLimit, model);
            const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (model.max > 1 && !modelLimit);
            const weapon = castArray(option.addWeapon);
            const addList = weapon.map((addedList) => {
              let totalCost = 0;
              const addedWeaponList = castArray(addedList);
              const addedListString = addedWeaponList.map((added) => {
                const newCost = getWeaponCostForModel(added, model, faction);
                totalCost += newCost;
                return formatWeapon(added, faction, { getWeapon });
              }).join(' and ');
              const cost = Math.trunc(totalCost);
              const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
              if (limitSplit && limitSplit.length === 2) {
                modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModel);
              }
              return {
                text: `${addedListString} for ${cost}pts${isEach ? ' each' : ''}`,
                points: cost,
                all: modelLimit === 'all',
                weapons: addedWeaponList,
                limit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || 1) * count,
                choiceLimit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || weapon.length) * count
              };
            });
            upgrades.push({ option: `Upgrade ${modelAddTerm} ${model.name}${count > 1 ? ` ${replaceTermCount}` : ''} with${addTerm}`, list: sortBy(addList, 'points') });
          }
          if (option.addRule) {
            const weapon = castArray(option.addRule || []);
            const count = option.count || 1;
            const replaceTermCount = getAddTerm(count, model);
            const addLimit = option.limit;
            let modelLimit = option.modelLimit;
            const addTerm = getAddTerm(addLimit, model);
            let modelAddTerm = getModelAddTerm(modelLimit, model);
            const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (model.max > 1 && !modelLimit);
            const addList = weapon.map((addedList) => {
              let totalCost = 0;
              const addedWeaponList = castArray(addedList);
              const addedListString = addedWeaponList.map((added) => {
                const addedThing = added.id || added;
                let thing = getRule(addedThing, faction);
                const newCost = getRuleCostForModel(added, model, faction);
                totalCost += newCost;
                const shortDescription = thing.description_short ? ` (${thing.description_short})` : '';
                const ruleInputs = thing.inputs ? `(${(thing.inputs || []).map((input) => added[input]).join(', ')})` : '';
                const ruleDescription = shortDescription || ruleInputs || '';
                const ruleName = `${thing.name}${ruleDescription}`;
                return `${ruleName}`;
              }).join(' and ');
              const name = addedList.name ? `${addedList.name} (${addedListString})` : `${addedListString}`;
              const cost = Math.trunc(totalCost);
              const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
              if (limitSplit && limitSplit.length === 2) {
                modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModel);
              }
              return {
                text: `${name} for ${cost}pts${isEach ? ' each' : ''}`,
                points: cost,
                all: modelLimit === 'all',
                rules: addedWeaponList,
                limit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || 1) * count,
                choiceLimit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || weapon.length) * count
              };
            });
            upgrades.push({ option: `Upgrade ${modelAddTerm} ${model.name} ${modelAddTerm === 'all ' || modelAddTerm === 'any ' ? 'models' : 'model'}${count > 1 ? ` ${replaceTermCount}` : ''} with${addTerm}`, list: sortBy(addList, 'points') })
          }
          if (option.removeRule) {
            const weapon = castArray(option.removeRule || []);
            const count = option.count || 1;
            const replaceTermCount = getAddTerm(count, model);
            const addLimit = option.limit;
            let modelLimit = option.modelLimit;
            const addTerm = getAddTerm(addLimit, model);
            let modelAddTerm = getModelAddTerm(modelLimit, model);
            const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (model.max > 1 && !modelLimit);
            const addList = weapon.map((addedList) => {
              let totalCost = 0;
              const addedWeaponList = castArray(addedList);
              const addedListString = addedWeaponList.map((added) => {
                const addedThing = added.id || added;
                let thing = getRule(addedThing, faction);
                const newCost = getRuleCostForModel(added, model, faction);
                totalCost += newCost;
                const shortDescription = thing.description_short ? ` (${thing.description_short})` : '';
                const ruleInputs = thing.inputs ? `(${(thing.inputs || []).map((input) => added[input]).join(', ')})` : '';
                const ruleDescription = shortDescription || ruleInputs || '';
                const ruleName = `${thing.name}${ruleDescription}`;
                return `${ruleName}`;
              }).join(' and ');
              const name = addedList.name ? `${addedList.name} (${addedListString})` : `${addedListString}`;
              const cost = Math.trunc(totalCost) * -1;
              const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
              if (limitSplit && limitSplit.length === 2) {
                modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * numThisModel);
              }
              return {
                text: `${name} for ${cost}pts${isEach ? ' each' : ''}`,
                points: cost,
                all: modelLimit === 'all',
                rules: addedWeaponList,
                limit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || 1) * count,
                choiceLimit: ((modelLimit === "all" ? 1 : modelLimit) || numThisModel) * (addLimit || weapon.length) * count
              };
            });
            upgrades.push({ option: `Remove ${modelAddTerm} ${model.name} ${modelAddTerm === 'all ' || modelAddTerm === 'any ' ? 'models' : 'model'}${count > 1 ? ` ${replaceTermCount}` : ''} ${addTerm}`, list: sortBy(addList, 'points') })
          }
        });
      }
    });
    // Handle unit options here with average costs
    if (unit.options) {
      (unit.options || []).forEach((option) => {
        if (option.replaceWeapon) {
          let totalOldCost = 0;
          const count = option.count || 1;
          const replaceTermCount = getAddTerm(count);
          const replaceLimit = option.limit;
          const replaceTerm = getAddTermUnit(replaceLimit);
          let modelReplaceLimit = option.modelLimit;
          const modelReplaceTerm = getAddLimitTermUnit(modelReplaceLimit);
          const replaceWeaponList = castArray(option.replaceWeapon);
          const isEach = replaceLimit > 1 || modelReplaceLimit > 1 || typeof modelReplaceLimit === 'string' || (sum(unit.models.map((model) => model.max)) > 1 && !modelReplaceLimit);
          const replaceThingList = replaceWeaponList.map((replacedWeapon) => {
            const avgCost = mean(getModels(unit, faction).filter((model) => model.shoot !== '-' && model.fight !== '-').map((model) => {
              return getWeaponCostForModel(replacedWeapon, {
                ...model,
                rules: [...(unit.rules || []), ...(model.rules || [])]
              }, faction);
            }));
            totalOldCost += avgCost;
            return formatWeapon(replacedWeapon, faction, { getWeapon });
          }).join(' and ');
          const replaceTarget = castArray(option.withWeapon || [])
            .map((replacedWith) => {
              let totalCost = 0;
              const replacedWithList = castArray(replacedWith);
              const replaceList = replacedWithList.map((replaceWith) => {
                const avgCost = mean(getModels(unit, faction).filter((model) => model.shoot !== '-' && model.fight !== '-').map((model) => {
                  return getWeaponCostForModel(replaceWith, {
                    ...model,
                    rules: [...(unit.rules || []), ...(model.rules || [])]
                  }, faction);
                }));
                totalCost += avgCost;
                return formatWeapon(replaceWith, faction, { getWeapon });
              }).join(' and ');
              const totalCostDiff = Math.trunc(totalCost - totalOldCost);
              const limitSplit = typeof modelReplaceLimit === "string" ? modelReplaceLimit.split('/') : null;
              if (limitSplit && limitSplit.length === 2) {
                modelReplaceLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * unitTotalModels);
              }
              return {
                text: `${replaceList} for ${totalCostDiff}pts${isEach ? ' each' : ''}`,
                points: totalCostDiff,
                weapons: replacedWithList,
                all: modelReplaceLimit === 'all',
                limit: (modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || unitTotalModels * (replaceLimit || 1) * count,
                choiceLimit: (modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || unitTotalModels * (replaceLimit || 1) * count
              };
            });
            upgrades.push({ option: `Replace ${modelReplaceTerm}${count > 1 ? ` ${replaceTermCount}` : ''} ${replaceThingList} with${replaceTerm}`, list: sortBy(replaceTarget, 'points') });
        }
        if (option.replaceRule) {
          let totalOldCost = 0;
          const count = option.count || 1;
          const replaceTermCount = getAddTerm(count);
          const replaceLimit = option.limit;
          const replaceTerm = getAddTermUnit(replaceLimit);
          let modelReplaceLimit = option.modelLimit;
          // const modelReplaceTerm = getAddLimitTermUnit(modelReplaceLimit);
          const isEach = replaceLimit > 1 || modelReplaceLimit > 1 || typeof modelReplaceLimit === 'string' || (sum(unit.models.map((model) => model.max)) > 1 && !modelReplaceLimit);
          const replaceWeaponList = castArray(option.replaceRule);
          const replaceThingList = replaceWeaponList.map((replacedWeapon) => {
            const replace = replacedWeapon.id || replacedWeapon;
            const ruleData = getRule(replace, faction);
            const avgCost = Math.trunc(mean(getModels(unit, faction).map((model) => {
              return getRuleCostForModel(replacedWeapon, {
                ...model,
                rules: [...(unit.rules || []), ...(model.rules || [])]
              }, faction);
            })));
            totalOldCost += avgCost;
            return `${ruleData.inputs ? `${ruleData.name}(${ruleData.inputs.map((input) => replacedWeapon[input]).join(', ')})` : ruleData.name}`;
          }).join(' and ');
          const replaceTarget = castArray(option.withRule)
            .map((replacedWith) => {
              let totalCost = 0;
              const replacedWithList = castArray(replacedWith);
              const replaceList = replacedWithList.map((replaceWith) => {
                const replaceWithId = replaceWith.id || replaceWith;
                let ruleData = getRule(replaceWithId, faction);
                const shortDescription = ruleData.description_short ? ` (${ruleData.description_short})` : '';
                const ruleInputs = ruleData.inputs ? `(${(ruleData.inputs || []).map((input) => replaceWith[input]).join(', ')})` : '';
                const ruleDescription = shortDescription || ruleInputs || '';
                const avgCost = Math.trunc(mean(getModels(unit, faction).map((model) => {
                  return getRuleCostForModel(replacedWith, {
                    ...model,
                    rules: [...(unit.rules || []), ...(model.rules || [])]
                  }, faction);
                })));
                totalCost += avgCost;
                return `${ruleData.name}${ruleDescription}`;
              }).join(' and ');
              const totalCostDiff = Math.trunc(totalCost - totalOldCost);
              const limitSplit = typeof modelReplaceLimit === "string" ? modelReplaceLimit.split('/') : null;
              if (limitSplit && limitSplit.length === 2) {
                modelReplaceLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * unitTotalModels);
              }
              return {
                text: `${replaceList} for ${totalCostDiff}pts${isEach ? ' each' : ''}`,
                points: totalCostDiff,
                rules: replacedWithList,
                all: modelReplaceLimit === 'all',
                limit: (modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || unitTotalModels * (replaceLimit || 1) * count,
                choiceLimit: (modelReplaceLimit === "all" ? 1 : modelReplaceLimit) || unitTotalModels * (replaceLimit || 1) * count
              };
            });
            upgrades.push({ option: `Replace ${replaceTerm}${count > 1 ? ` ${replaceTermCount}` : ''} ${replaceThingList} with`, list: sortBy(replaceTarget, 'points') });
        }
        if (option.addWeapon) {
          const count = option.count || 1;
          const replaceTermCount = getAddTerm(count);
          const addLimit = option.limit;
          let modelLimit = option.modelLimit;
          const addTerm = getAddTermUnit(addLimit);
          const modelAddTerm = getAddLimitTermUnit(modelLimit);
          const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (sum(unit.models.map((model) => model.max)) > 1 && !modelLimit);
          const weapon = castArray(option.addWeapon);
          const addList = weapon.map((addedList) => {
            let totalCost = 0;
            const addedWeaponList = castArray(addedList);
            const addedListString = addedWeaponList.map((added) => {
              const avgCost = Math.trunc(mean(getModels(unit, faction).filter((model) => model.shoot !== '-' && model.fight !== '-').map((model) => {
                return getWeaponCostForModel(added, {
                  ...model,
                  rules: [...(unit.rules || []), ...(model.rules || [])]
                }, faction);
              })));
              const newCost = avgCost;
              totalCost += newCost;
              return formatWeapon(added, faction, { getWeapon });
            }).join(' and ');
            const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
            if (limitSplit && limitSplit.length === 2) {
              modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * unitTotalModels);
            }
            return {
              text: `${addedListString} for ${totalCost}pts${isEach ? ' each' : ''}`,
              points: totalCost,
              weapons: addedWeaponList,
              all: modelLimit === 'all',
              limit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count,
              choiceLimit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count
            };
          });
          upgrades.push({ option: `Upgrade ${modelAddTerm}${count > 1 ? ` ${replaceTermCount}` : ''} with${addTerm}`, list: sortBy(addList, 'points') });
        }
        if (option.addRule) {
          const weapon = castArray(option.addRule || []);
          const count = option.count || 1;
          const replaceTermCount = getAddTerm(count);
          const addLimit = option.limit;
          let modelLimit = option.modelLimit;
          const addTerm = getAddTermUnit(addLimit);
          const modelAddTerm = getAddLimitTermUnit(modelLimit);
          const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (sum(unit.models.map((model) => model.max)) > 1 && !modelLimit);
          const addList = weapon.map((addedList) => {
            let totalCost = 0;
            const addedWeaponList = castArray(addedList);
            const addedListString = addedWeaponList.map((added) => {
              const addedThing = added.id || added;
              let thing = getRule(addedThing, faction);
              const avgCost = Math.trunc(mean(getModels(unit, faction).map((model) => {
                return getRuleCostForModel(added, {
                  ...model,
                  rules: [...(unit.rules || []), ...(model.rules || [])]
                }, faction);
              })));
              totalCost += avgCost;
              const shortDescription = thing.description_short ? ` (${thing.description_short})` : '';
              const ruleInputs = thing.inputs ? `(${(thing.inputs || []).map((input) => added[input]).join(', ')})` : '';
              const ruleDescription = shortDescription || ruleInputs || '';
              const ruleName = `${thing.name}${ruleDescription}`;
              return `${ruleName}`;
            }).join(' and ');
            const name = addedList.name ? `${addedList.name} (${addedListString})` : `${addedListString}`;
            const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
            if (limitSplit && limitSplit.length === 2) {
              modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * unitTotalModels);
            }
            return {
              text: `${name} for ${Math.trunc(totalCost)}pts${isEach ? ' each' : ''}`,
              points: Math.trunc(totalCost),
              rules: addedWeaponList,
              all: modelLimit === 'all',
              limit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count,
              choiceLimit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count
            };
          });
          upgrades.push({ option: `Upgrade ${modelAddTerm}${count > 1 ? ` ${replaceTermCount}` : ''} with${addTerm}`, list: sortBy(addList, 'points') })
        }
        if (option.removeRule) {
          const weapon = castArray(option.removeRule || []);
          const count = option.count || 1;
          const replaceTermCount = getAddTerm(count);
          const addLimit = option.limit;
          let modelLimit = option.modelLimit;
          const addTerm = getAddTermUnit(addLimit);
          const modelAddTerm = getAddLimitTermUnit(modelLimit);
          const isEach = addLimit > 1 || modelLimit > 1 || typeof modelLimit === 'string' || (sum(unit.models.map((model) => model.max)) > 1 && !modelLimit);
          const addList = weapon.map((addedList) => {
            let totalCost = 0;
            const addedWeaponList = castArray(addedList);
            const addedListString = addedWeaponList.map((added) => {
              const addedThing = added.id || added;
              let thing = getRule(addedThing, faction);
              const avgCost = Math.trunc(mean(getModels(unit, faction).map((model) => {
                return getRuleCostForModel(added, {
                  ...model,
                  rules: [...(unit.rules || []), ...(model.rules || [])]
                }, faction);
              })));
              totalCost += avgCost;
              const shortDescription = thing.description_short ? ` (${thing.description_short})` : '';
              const ruleInputs = thing.inputs ? `(${(thing.inputs || []).map((input) => added[input]).join(', ')})` : '';
              const ruleDescription = shortDescription || ruleInputs || '';
              const ruleName = `${thing.name}${ruleDescription}`;
              return `${ruleName}`;
            }).join(' and ');
            const name = addedList.name ? `${addedList.name} (${addedListString})` : `${addedListString}`;
            const limitSplit = typeof modelLimit === "string" ? modelLimit.split('/') : null;
            if (limitSplit && limitSplit.length === 2) {
              modelLimit = Math.floor((toNumber(limitSplit[0]) / toNumber(limitSplit[1])) * unitTotalModels);
            }
            const cost = Math.trunc(totalCost) * -1;
            return {
              text: `${name} for ${cost}pts${isEach ? ' each' : ''}`,
              points: cost,
              rules: addedWeaponList,
              all: modelLimit === 'all',
              limit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count,
              choiceLimit: (modelLimit === "all" ? 1 : modelLimit) || unitTotalModels * (addLimit || 1) * count
            };
          });
          upgrades.push({ option: `Remove ${modelAddTerm}${count > 1 ? ` ${replaceTermCount}` : ''} ${addTerm}`, list: sortBy(addList, 'points') })
        }
      });
    }
    return upgrades;
  }

  const getPowerCharge = (power, faction) => {
    let points = 0;
    const dummyShooter = {
      shoot: 10
    }
    const psychicCost = getRuleCostForModel({ "id": "psychic" }, dummyTarget, faction);
    (power.effects || []).forEach((effect) => {
      if (effect.weapon) {
        const weapon = effect.weapon.id || effect.weapon;
        const pts = getWeaponCostForModel(weapon, dummyShooter, faction);
        points += pts;
      }
      if (effect.rule) {
        const rule = effect.rule.id || effect.rule;
        const pts = getRuleCostForModel(rule, dummyShooter, faction);
        points += pts;
      }
    });
    const charge = psychicCost / points * 10;
    const finalCharge = clamp(Math.trunc(charge), 1, 9);
    return finalCharge;
  }

  const getUnitPoints = (unit, faction) => {
    let points = 0;
    (unit.models || []).forEach((model) => {
      const min = get(model, 'min', 1);
      const modelWithUnitRules = {
        ...model,
        rules: [...(model.rules || []), ...(unit.rules || [])]
      };
      const modelPts = getModelTotalPoints(modelWithUnitRules, faction) * min;
      points += Math.trunc(modelPts);
    });
    // const allModelsMaxed = every(unit.models, (model) => {
    //  return model.min === model.max;
    // });
    const gameType = get(data, 'gameType', 'battle');
    const isSkirmish = gameType === 'skirmish';
    if (!isSkirmish) {
      points = round5(points);
    }
    return points;
  }

  const resolveVariable = (variableName, variables) => {
    const combinedVars = {...variables, constants: CONSTANTS};
    const val = typeof variableName === 'string' ? get(combinedVars, variableName) : variableName;
    if (isNil(val) || !isNumber(val)) {
      // console.log(`Couldn't resolve ${variableName}`);
      return 0;
    }
    return val;
  }

  const resolvePointsRecurse = (pointsArray, variables) => {
    if (isArray(pointsArray)) {
      let total = 0;
      pointsArray.forEach((arrItem) => {
        if (!isNil(arrItem.add)) {
          total += resolvePointsRecurse(arrItem.add, variables);
        } else if (!isNil(arrItem.multiply)) {
          total *= resolvePointsRecurse(arrItem.multiply, variables);
        } else if (!isNil(arrItem.subtract)) {
          total -= resolvePointsRecurse(arrItem.subtract, variables);
        } else if (!isNil(arrItem.divide)) {
          total /= resolvePointsRecurse(arrItem.divide, variables);
        } else if (!isNil(arrItem.max)) {
          total = Math.max(total, resolvePointsRecurse(arrItem.max, variables));
        } else if (!isNil(arrItem.min)) {
          total = Math.min(total, resolvePointsRecurse(arrItem.min, variables));
        } else {
          total += resolvePointsRecurse(arrItem, variables);
        }
      });
      return total;
    } else {
      return resolveVariable(pointsArray, variables);
    }
  }

  const resolvePoints = (pointsArray, variables) => {
    return resolvePointsRecurse(castArray(pointsArray), variables);
  }

  const getModelTotalPoints = (model, faction, doRound=true) => {
    let points = 0;
    const modelPoints = getModelPoints(model, faction);
    const weaponPoints = getModelWeaponPoints(model, faction);
    const rulePoints = getModelRulePoints(model, faction);
    const ptsTotal = modelPoints + weaponPoints + rulePoints;
    points += Math.trunc(ptsTotal);
    //console.log(model.name, 'model', modelPoints, 'weps', weaponPoints, 'rules', rulePoints, 'total', points);
    return points;
  }

  const getModelPoints = (model, faction) => {
    if (model.shoot === "-" && model.fight === "-" && model.courage === "-" && model.defense !== "-") {
      const defense = model.defense || CONSTANTS.baseStats.defense;
      const defenseIncrease = (defense - 5);
      const defenseCost = model.defense === '-' ? 0 : (defenseIncrease * 2);
      return defenseCost;
    }
    if (model.shoot === "-" && model.fight === "-" && model.courage === "-") {
      return 0;
    }
    if (model.defense === "-" && model.courage === "-" && model.reflexes === "-") {
      return 0;
    }
    let points = 0;
    // const wounds = model.wounds || CONSTANTS.baseStats.wounds;
    const defense = model.defense || CONSTANTS.baseStats.defense;
    const courage = model.courage || CONSTANTS.baseStats.courage;
    const movement = isNil(model.movement) ? CONSTANTS.baseStats.movement : model.movement;
    const reflexes = model.reflexes || CONSTANTS.baseStats.reflexes;
    // const shoot = model.shoot || CONSTANTS.baseStats.shoot;
    // const fight = model.fight || CONSTANTS.baseStats.fight;
    // const shootCost = (shoot - 5);
    // const fightCost = (fight - 5);
    //const woundsCost = (wounds > 1) ? ((wounds - 1) * 2 * (defenseIncrease || 1)) : 0;
    const defenseIncrease = (defense - 5);
    // const woundsCost = (wounds > 1) ? ((wounds - 1) * CONSTANTS.woundsCost * (defenseIncrease || 1)) : 0;
    const defenseCost = model.defense === '-' ? 0 : (defenseIncrease * 2);
    const courageCost = model.courage === '-' ? 0 : (courage - 5) * 2;
    const movementCost = (movement - 6);
    const reflexCost = model.reflexes === '-' ? 0 : (reflexes - 5);
    // console.log(model.name, 'w', woundsCost, 'r',defenseCost, 'co',courageCost, 'm',movementCost, 'ref',reflexCost);
    points += (defenseCost + courageCost + reflexCost + movementCost + CONSTANTS.baseStats.baseCost);
    return points;
  }

  const getModelWeaponPoints = (model, faction) => {
    let points = 0;
    (model.weapons || []).forEach((weapon) => {
      points += getWeaponCostForModel(weapon, model, faction);
    });
    return points;
  }

  const getWeaponCostAverage = (weapon, models, faction) => {
    const cost = mean((models).map((model) => {
      return getWeaponCostForModel(weapon, model, faction);
    }));
    return cost;
  }

  const getRuleCostAverage = (rule, models, faction) => {
    const cost = mean((models).map((model) => {
      return getRuleCostForModel(rule, model, faction);
    }));
    return cost;
  }

  const getWeaponCostForModel = (weapon, model, faction, modifiedWeapon) => {
    let points = 0;
    const weaponData = modifiedWeapon || getWeapon(weapon, faction);
    const weaponCount = weapon.count || 1;
    let weaponMountMult = 1;
    if ((weapon.mount && weapon?.mount?.length === 1) || isString(weapon?.mount)) {
      weaponMountMult = 0.8;
    }
    if (weapon.mount && weapon.mount.length === 2) {
      weaponMountMult = 0.9;
    }
    //const weaponModelMult = (weaponData.short === "Melee" ? (model.fight - CONSTANTS.baseStats.fight) : (model.shoot * CONSTANTS.baseStats.shoot));
    const weaponBase = getWeaponPoints(weaponData, model, faction);
    const weaponPoints = weaponBase * weaponCount * weaponMountMult;
    points += weaponPoints;
    // if (points > 0) {
    //   // Cost weapon rules that do not scale with weapon
    //   const weaponRules = weaponData.rules || [];
    //   weaponRules.forEach((rule) => {
    //     const weaponsWithoutCurr = (model.weapons || []).filter((wep) => (wep.id || wep) !== (weapon.id || weapon));
    //     const ruleCost = getRuleCostForModel(rule, {
    //       ...model,
    //       weapons: weaponsWithoutCurr
    //     }, faction);

    //     points += ruleCost;
    //   });
    // }
    //console.log(model.name, weaponData.name, points);
    return points;
  }

  /*
 * Find cost of a single weapon
 */
  const getWeaponPoints = (wep, model, faction) => {
    // Merge weapon profiles into one master list
    const weps = [wep, ...get(wep, 'profiles', [])];
    // Keep track of most expensive profile
    const weaponPoints = sortBy(weps.map((weapon) => {
      let points = 0;
      const weaponModelMult = (weapon.short === "Melee" ? (model.fight - CONSTANTS.baseStats.fight) : (model.shoot - CONSTANTS.baseStats.shoot));
      const weaponAP = weapon.ap || 0;
      const weaponRules = weapon.rules || [];
      const range = weapon.short;
      const rangeCost = ((range === "Melee") ? (model.movement || 6) / 6 : range / 6);
      // const weaponDamage = weapon.damage || 1;
      points += weaponModelMult;
      // points += (weaponDamage - 1) * CONSTANTS.damageCost;
      const rangePoints = (weapon.medium || (range === "Melee")) ? rangeCost : rangeCost / 2;
      points += rangePoints;
      points += weaponAP * CONSTANTS.apCost;
      let isPistol = false;
      let isGrenade = false;
      //Multiply weapon cost by number of attacks
      const attacks = isNil(weapon.attacks) ? 1 : weapon.attacks;
      points *= attacks;
      // Calculate weapon rules that don't scale with damage or attacks
      weaponRules.forEach((rule) => {
        const ruleId = rule.id || rule;
        const ruleData = getRule(ruleId, faction);
        const resolvedPoints = resolvePoints(ruleData.points || 0, {
          weapon: {
            ...weapon,
            ap: weapon.ap || 0,
            damage: weapon.damage || 1,
            range,
            rangeCost,
            points
          },
          rule,
          model,
          faction
        });
        if (resolvedPoints) {
          points += resolvedPoints;
        }
        // if (ruleId === 'pistol') {
        //   isPistol = true;
        // }
        if (ruleId === 'grenade') {
          isGrenade = true;
        }
      });
      // If it's a pistol or grenade and not the cheapest weapon, zero out the cost
      // Ignore for now. Too many problems.
      // Logic is expensive. Yikes.
      if (isPistol) {
        points *= 0.5;
      }
      if (isGrenade) {
        points *= 0;
      }
      return points;
    }).filter((number) => isFinite(number))).reverse();
    const mostExpensiveWeapon = weaponPoints[0] || 0;
    const otherPoints = sum(weaponPoints.slice(1).map((pts) => pts * 0.5));
    const totalPts = mostExpensiveWeapon + otherPoints;
    // console.log(model.name, wep.name, 'pts', mostExpensiveWeapon, totalPts);
    return totalPts;
  }

  const getModelRulePoints = (model, faction) => {
    let points = 0;
    (model.rules || []).forEach((rule) => {
      points += getRuleCostForModel(rule, model, faction);
    })
    return points;
  }

  const getRuleCostForModel = (rule, model, faction) => {
    let points = 0;
    const ruleId = rule.id || rule;
    const ruleData = getRule(ruleId, faction);
    const resolvedPoints = resolvePoints(ruleData.points || 0, {
      rule,
      model,
      faction
    });
    if (resolvedPoints) {
      points += resolvedPoints;
    }
    // (ruleData.effects || []).forEach((effect) => {
    //   // How often the ability will trigger (frequency / 10 is the percentage time it's active)
    //   let frequency = (typeof effect.frequency === 'string' ? rule[effect.frequency] : effect.frequency) || 10;
    //   const value = (typeof effect.value === 'string' ? rule[effect.value] : effect.value) || 1;
    //   // Ignore terrain penalties
    //   if (effect.type === "ignoreTerrain") {
    //     const modelWounds = model.wounds || 1;
    //     points += modelWounds * 2 * (frequency / 10);
    //   }
    //   // Ignore terrain penalties
    //   if (effect.type === "ambush") {
    //     const modelWounds = model.wounds || 1;
    //     points += modelWounds * 2 * (frequency / 10);
    //   }
    //   // Ignore terrain penalties
    //   if (effect.type === "stealth") {
    //     const modelWounds = model.wounds || 1;
    //     points += modelWounds * 3 * value * (frequency / 10);
    //   }
    //   if (effect.type === "activateUnit") {
    //     const modelWounds = model.wounds || 1;
    //     points += (modelWounds / 2) * value * (frequency / 10);
    //   }
    //   if (effect.type === "regeneration") {
    //     const modelWounds = model.wounds || 1;
    //     points += modelWounds * frequency;
    //   }
    //   if (effect.type === "invulnerable") {
    //     const modelDefense = model.defense || 1;
    //     points += modelDefense * value * (frequency / 10);
    //   }
    //   if (effect.type === "transport") {
    //     const size = (typeof effect.size === 'string' ? rule[effect.size] : effect.size) || 1;
    //     points += size * (frequency / 10);
    //   }
    //   if (effect.type === "open_topped") {
    //     points += value * (frequency / 10);
    //   }
    //   if (effect.type === "psychic") {
    //     points += (15 * value) * (frequency / 10);
    //   }
    //   if (effect.type === "heal") {
    //     points += 5 * value * (frequency / 10);
    //   }
    //   if (effect.type === "spawnModel") {
    //     const spawnedModel = effect.model || {};
    //     const modelData = getModel(spawnedModel, faction);
    //     const cost = getModelTotalPoints({
    //       ...modelData,
    //     }, faction);
    //     points += cost * 0.8 * (frequency / 10);
    //   }
    //   // Give a new rule
    //   if (effect.type === "grantRule") {
    //     const ruleName = effect.rule;
    //     if (ruleName === ruleId) {
    //       console.log('cycle detected wot you doing m8');
    //       return 0;
    //     };
    //     const target = effect.target || "self";
    //     if (target !== "self") {
    //       const auraCost = getAuraCost(model, effect, (modelTarget) => {
    //         //const modelRulesWithoutCurr = (modelTarget.rules || []).filter((filterRule) => filterRule.id !== ruleId && filterRule !== ruleId);
    //         const modelRulesWithoutCurr = [];
    //         const oldCost = getModelTotalPoints({
    //           ...modelTarget,
    //           rules: modelRulesWithoutCurr
    //         }, faction);
    //         const modelRulesWithNew = uniq([...modelRulesWithoutCurr, ruleName]);
    //         const newCost = getModelTotalPoints({
    //           ...modelTarget,
    //           rules: modelRulesWithNew
    //         }, faction);
    //         const cost = (newCost - oldCost) * (effect.targetModels || modelTarget.min || 1);
    //         return cost;
    //       }, faction);
    //       points += auraCost * (frequency / 10);
    //     } else {
    //       const modelRulesWithoutCurr = (model.rules || []).filter((filterRule) => filterRule.id !== ruleId && filterRule !== ruleId);
    //       const oldCost = getModelTotalPoints({
    //         ...model,
    //         rules: modelRulesWithoutCurr
    //       }, faction);
    //       const modelRulesWithNew = uniq([...modelRulesWithoutCurr, ruleName]);
    //       const newCost = getModelTotalPoints({
    //         ...model,
    //         rules: modelRulesWithNew
    //       }, faction);
    //       const cost = (newCost - oldCost) * (frequency / 10);
    //       points += cost;
    //     }
    //   }
    //   // Modify stat by some amount
    //   if (effect.type === "alterStat") {
    //     const target = effect.target || "self";
    //     const improvedValue = (typeof effect.value === 'string' ? rule[effect.value] : effect.value) || 1;
    //     const improvedStat = effect.statName;
    //     if (target !== "self") {
    //       const auraCost = getAuraCost(model, effect, (modelTarget) => {
    //         const oldCost = getModelTotalPoints({
    //           ...modelTarget,
    //           rules: [],
    //         }, faction);
    //         const newCost = getModelTotalPoints({
    //           ...modelTarget,
    //           [improvedStat]: (modelTarget[improvedStat] || CONSTANTS[improvedStat] || 0) + improvedValue,
    //           rules: [],
    //         }, faction);
    //         const cost = (newCost - oldCost) * (effect.targetModels || modelTarget.min || 1);
    //         return cost;
    //       }, faction);
    //       // Tweak this cost up for possible upgrade interactions
    //       points += auraCost * (frequency / 10) * 1.25;
    //     } else {
    //       const oldCost = getModelTotalPoints({
    //         ...model,
    //         weapons: [],
    //         rules: []
    //       }, faction);
    //       const newCost = getModelTotalPoints({
    //         ...model,
    //         [improvedStat]: (model[improvedStat] || CONSTANTS[improvedStat] || 0) + improvedValue,
    //         rules: [],
    //         weapons: [],
    //       }, faction);
    //       const cost = (newCost - oldCost) * (frequency / 10);
    //       points += cost;
    //     }
    //   }
    //   // Modify stat by some amount
    //   if (effect.type === "changeStat") {
    //     const target = effect.target || "self";
    //     const improvedValue = (typeof effect.value === 'string' ? rule[effect.value] : effect.value) || 1;
    //     const improvedStat = effect.statName;
    //     if (target !== "self") {
    //       const auraCost = getAuraCost(model, effect, (modelTarget) => {
    //         const oldCost = getModelTotalPoints({
    //           ...modelTarget,
    //           rules: []
    //         }, faction);
    //         const newCost = getModelTotalPoints({
    //           ...modelTarget,
    //           [improvedStat]: improvedValue,
    //           rules: []
    //         }, faction);
    //         const cost = (newCost - oldCost) * (effect.targetModels || modelTarget.min || 1);
    //         return cost;
    //       }, faction);
    //       // Tweak this cost up for possible upgrade interactions
    //       points += auraCost * (frequency / 10) * 1.25;
    //     } else {
    //       const oldCost = getModelTotalPoints({
    //         ...model,
    //         rules: []
    //       }, faction);
    //       const newCost = getModelTotalPoints({
    //         ...model,
    //         [improvedStat]: improvedValue,
    //         rules: []
    //       }, faction);
    //       const cost = (newCost - oldCost) * (frequency / 10);
    //       points += cost;
    //     }
    //   }
    //   // Give free attacks
    //   if (effect.type === "freeAttacks") {
    //     const weaponName = effect.weapon;
    //     const fight = (typeof effect.fight === 'string' ? rule[effect.fight] : effect.fight) || 5;
    //     const shoot = (typeof effect.shoot === 'string' ? rule[effect.shoot] : effect.shoot) || 5;
    //     const numAttacks = (typeof effect.attacks === 'string' ? rule[effect.attacks] : effect.attacks) || 1;
    //     const newMod = { ...model };
    //     if (effect.shoot) {
    //       newMod.shoot = shoot;
    //     }
    //     if (effect.fight) {
    //       newMod.fight = fight;
    //     }
    //     const attackCost = getWeaponCostForModel(weaponName, newMod, faction);
    //     const cost = numAttacks * attackCost * (frequency / 10);
    //     points += cost;
    //   }
    //   // Alter a rule
    //   if (effect.type === "alterRule") {
    //     const target = effect.target || "self";
    //     const improvedValue = (typeof effect.value === 'string' ? rule[effect.value] : effect.value) || 1;
    //     const improvedInput = effect.input;
    //     const ruleName = effect.ruleName;
    //     if (target !== "self") {
    //       const auraCost = getAuraCost(model, effect, (modelTarget) => {
    //         const oldCost = getModelTotalPoints({
    //           ...modelTarget,
    //           rules: []
    //         }, faction);
    //         const modelRule = find(modelTarget.rules, ['id', ruleName]);
    //         if (modelRule) {
    //           const newCost = getModelTotalPoints({
    //             ...modelTarget,
    //             rules: [{ ...modelRule, [improvedInput]: modelRule[improvedInput] + improvedValue }]
    //           }, faction);
    //           return (newCost - oldCost) * (effect.targetModels || modelTarget.min || 1);
    //         }
    //         return 0;
    //       }, faction);
    //       points += auraCost * (frequency / 10) * 1.25;
    //     } else {
    //       const oldCost = getModelTotalPoints({
    //         ...model,
    //         rules: []
    //       }, faction);
    //       const modelRule = find(model.rules, ['id', ruleName]);
    //       if (modelRule) {
    //         const newCost = getModelTotalPoints({
    //           ...model,
    //           rules: [{ ...modelRule, [improvedInput]: modelRule[improvedInput] + improvedValue }]
    //         }, faction);
    //         const cost = (newCost - oldCost) * (frequency / 10);
    //         points += cost;
    //       }
    //     }
    //   }
    //   // Give bonus attacks with any weapon of that type
    //   if (effect.type === "bonusAttack") {
    //     const weaponType = effect.weaponType || "shoot";
    //     const weaponFilter = weaponType === "fight" ? (wep) => getWeapon(wep, faction).short === "Melee" : (wep) => getWeapon(wep, faction).short !== "Melee";
    //     let mostExpensiveWeaponDiff = 0;
    //     const improvedWeaponStat = "attacks";
    //     (model.weapons || []).filter(weaponFilter).forEach((wep) => {
    //       const weapon = getWeapon(wep, faction);
    //       const newCost = getWeaponCostForModel(wep.id ? { ...wep, count: 1 } : wep, model, faction, {
    //         ...weapon,
    //         [improvedWeaponStat]: (weapon[improvedWeaponStat] || 0) + value,
    //         profiles: get(weapon, 'profiles', []).map((profile) => ({ ...profile, [improvedWeaponStat]: (profile[improvedWeaponStat] || 0) + value }))
    //       });
    //       mostExpensiveWeaponDiff = Math.max(mostExpensiveWeaponDiff, newCost);
    //     });
    //     points += mostExpensiveWeaponDiff * (frequency / 10);
    //   }
    //   // change all weapons
    //   if (effect.type === "alterWeapon") {
    //     const improvedInput = effect.statName;
    //     const target = effect.target || "self";
    //     if (target !== "self") {
    //       const auraCost = getAuraCost(model, effect, (modelTarget) => {
    //         let weaponCostTotal = 0;
    //         (modelTarget.weapons || []).forEach((wep) => {
    //           const weaponData = getWeapon(wep, faction);
    //           const wepRulesWithoutCurrent = (weaponData.rules || []).filter((rule) => rule.id !== ruleId && rule !== ruleId);
    //           if (weaponData[improvedInput]) {
    //             const oldCost = getWeaponCostForModel(wep, modelTarget, faction, {
    //               ...weaponData,
    //               rules: wepRulesWithoutCurrent
    //             });
    //             const newCost = getWeaponCostForModel(wep, modelTarget, faction, {
    //               ...weaponData,
    //               rules: wepRulesWithoutCurrent,
    //               [improvedInput]: (weaponData[improvedInput] || 0) + value,
    //               profiles: get(weaponData, 'profiles', []).map((profile) => ({ ...profile, [improvedInput]: (profile[improvedInput] || 0) + value }))
    //             });
    //             const cost = (newCost - oldCost) * (frequency / 10);
    //             weaponCostTotal += cost;
    //           }
    //         });
    //         return weaponCostTotal * (effect.targetModels || modelTarget.min || 1);
    //       }, faction);
    //       points += auraCost * (frequency / 10) * 1.25;
    //     } else {
    //       const modelTarget = model;
    //       let weaponCostTotal = 0;
    //       (modelTarget.weapons || []).forEach((wep) => {
    //         const weaponData = getWeapon(wep, faction);
    //         const wepRulesWithoutCurrent = (weaponData.rules || []).filter((rule) => rule.id !== ruleId && rule !== ruleId);
    //         if (weaponData[improvedInput]) {
    //           const oldCost = getWeaponCostForModel(wep, modelTarget, faction, {
    //             ...weaponData,
    //             rules: wepRulesWithoutCurrent
    //           });
    //           const newCost = getWeaponCostForModel(wep, modelTarget, faction, {
    //             ...weaponData,
    //             rules: wepRulesWithoutCurrent,
    //             [improvedInput]: (weaponData[improvedInput] || 0) + value,
    //             profiles: get(weaponData, 'profiles', []).map((profile) => ({ ...profile, [improvedInput]: (profile[improvedInput] || 0) + value }))
    //           });
    //           const cost = (newCost - oldCost);
    //           weaponCostTotal += cost;
    //         }
    //       });
    //       points += weaponCostTotal * (frequency / 10);
    //     }
    //   }
    // });
    return points;
  }

  const getWeaponList = (weaponList, faction) => {
    const weapons = weaponList.map((weaponName) => getWeapon(weaponName, faction)).filter(weapon => !!weapon);
    return sortBy(weapons, 'name');
  }

  const getRulesList = (ruleList, faction) => {
    const weapons = ruleList.map((ruleName) => getRule(ruleName, faction)).filter(rule => !!rule);
    return sortBy(weapons, 'name');
  }

  const getWeapons = (unit, faction) => {
    const weaponsSet = new Set();
    const weaponsList = [];
    (unit.options || []).forEach((option) => {
      const wepsArray = castArray(option.withWeapon || option.addWeapon || []);
      wepsArray.forEach((wepList) => {
        const wepListArr = castArray(wepList);
        wepListArr.forEach((wep) => {
          const weaponId = wep.id || wep;
          if (!weaponsSet.has(weaponId)) {
            weaponsSet.add(weaponId);
            weaponsList.push(weaponId);
          }
        });
      });
    });
    getModels(unit, faction).forEach((model) => {
      if (model.options) {
        model.options.forEach((option) => {
          const wepsArray = castArray(option.withWeapon || option.addWeapon || []);
          wepsArray.forEach((wepList) => {
            const wepListArr = castArray(wepList);
            wepListArr.forEach((wep) => {
              const weaponId = wep.id || wep;
              if (!weaponsSet.has(weaponId)) {
                weaponsSet.add(weaponId);
                weaponsList.push(weaponId);
              }
            });
          });
        });
      }
      (model.weapons || []).forEach((weapon) => {
        const weaponId = weapon.id || weapon;
        if (!weaponsSet.has(weaponId)) {
          weaponsSet.add(weaponId);
          weaponsList.push(weaponId);
        }
      });
    });
    const weapons = weaponsList.map((weaponName) => getWeapon(weaponName, faction)).filter(weapon => !!weapon);
    return sortBy(weapons, 'name');
  }

  const getAllWeapons2 = (faction) => {
    const allWeapons = {};
    Object.keys(get(faction, 'weapons', {})).forEach((key) => {
      allWeapons[key] = {
        id: key,
        ...faction.weapons[key]
      }
    });
    Object.keys(globalWeapons).forEach((key) => {
      allWeapons[key] = {
        id: key,
        ...globalWeapons[key]
      }
    });
    return allWeapons;
  };

  const getAllWeapons = (faction) => {
    const weaponsSet = new Set();
    const weaponsList = [];
    Object.values((faction.units || []) || {}).forEach((unit) => {
      const weps = getWeapons(unit, faction);
      weps.forEach((weapon) => {
        if (!weaponsSet.has(weapon.name)) {
          weaponsSet.add(weapon.name);
          weaponsList.push(weapon);
        }
      });
    });
    return weaponsList;
  };

  const getAllRules = (faction) => {
    const allRules = {};
    Object.keys(get(faction, 'rules', {})).forEach((key) => {
      allRules[key] = {
        id: key,
        ...faction.rules[key]
      }
    });
    Object.keys(globalRules).forEach((key) => {
      allRules[key] = {
        id: key,
        ...globalRules[key]
      }
    });
    return Object.values(allRules);
  }

  const getAllWeaponRules = (weapons, faction) => {
    const rulesSet = new Set();
    const rulesList = [];
    const wepArray = castArray(weapons);
    wepArray.forEach((wepy) => {
      const profiles = get(wepy, 'profiles', []);
      const weaponAndProfiles = [...profiles, wepy];
      weaponAndProfiles.forEach((weapon) => {
        get(weapon, 'rules', []).forEach((rule) => {
          const ruleId = rule.id || rule;
          if (!rulesSet.has(ruleId)) {
            rulesSet.add(ruleId);
            rulesList.push(ruleId);
          }
        });
      });
    });
    const rules = rulesList.map((rule) => getRule(rule, faction)).filter(rule => !rule.hidden);
    return rules;
  };

  const getWeaponRules = (units, faction) => {
    const rulesSet = new Set();
    const rulesList = [];
    units.forEach((unit) => {
      getModels(unit, faction).forEach((model) => {
        get(model, 'weapons', []).forEach((weaponName) => {
          const weaponId = weaponName.id || weaponName;
          const wep = getWeapon(weaponId, faction);
          const profiles = get(wep, 'profiles', []);
          const weaponAndProfiles = [...profiles, wep];
          weaponAndProfiles.forEach((weapon) => {
            get(weapon, 'rules', []).forEach((rule) => {
              const ruleId = rule.id || rule;
              if (!rulesSet.has(ruleId)) {
                rulesSet.add(ruleId);
                rulesList.push(ruleId);
              }
            });
          });
        });
        if (model.options || unit.options) {
          [...get(unit, 'options', []), ...get(model, 'options', [])].forEach((option) => {
            const wepArray = castArray(option.withWeapon || option.addWeapon || []).flat();
            wepArray.forEach((wepList) => {
              const wepListArr = castArray(wepList);
              wepListArr.forEach((wep) => {
                const weaponId = wep.id || wep;
                const wepy = getWeapon(weaponId, faction);
                const profiles = get(wepy, 'profiles', []);
                const weaponAndProfiles = [...profiles, wepy];
                weaponAndProfiles.forEach((weapon) => {
                  get(weapon, 'rules', []).forEach((rule) => {
                    const ruleId = rule.id || rule;
                    if (!rulesSet.has(ruleId)) {
                      rulesSet.add(ruleId);
                      rulesList.push(ruleId);
                    }
                  });
                });
              });
            });
          });
        }
      });
    });
    const rules = rulesList.map((rule) => getRule(rule, faction)).filter(rule => !rule.hidden);
    return rules;
  };

  const getModelRules = (units, faction) => {
    const rulesSet = new Set();
    const rulesList = [];
    units.forEach((unit) => {
      const unitRules = unit.rules || [];
      unitRules.forEach((rule) => {
        const ruleId = rule.id || rule;
        if (!rulesSet.has(ruleId)) {
          rulesSet.add(ruleId);
          rulesList.push(ruleId);
        }
      });
      getModels(unit, faction).forEach((model) => {
        (model.rules || []).forEach((rule) => {
          const ruleId = rule.id || rule;
          if (!rulesSet.has(ruleId)) {
            rulesSet.add(ruleId);
            rulesList.push(ruleId);
          }
        });
        if (model.options || unit.options) {
          [...get(unit, 'options', []), ...get(model, 'options', [])].forEach((option) => {
            const addRule = castArray(option.addRule || option.withRule || []).flat();
            addRule.forEach((rule) => {
              // const ruleData = getRule(rule, faction);
              // (ruleData.effects || []).forEach((effect) => {
              //   const ruleId = get(effect, 'rule.id') || get(effect, 'rule');
              //   if (ruleId) {
              //     if (!rulesSet.has(ruleId)) {
              //       rulesSet.add(ruleId);
              //       rulesList.push(ruleId);
              //     }
              //   }
              // })
              const ruleId = rule.id || rule;
              if (!rulesSet.has(ruleId)) {
                rulesSet.add(ruleId);
                rulesList.push(ruleId);
              }
            });
          });
        }
      });
    });
    const rules = rulesList.map((rule) => getRule(rule, faction)).filter(rule => !rule.hidden);
    return rules;
  };

  const getRules = (units, faction) => {
    let rulesList = [];
    const modelRules = getModelRules(units, faction);
    rulesList = rulesList.concat(modelRules);
    const weaponRules = getWeaponRules(units, faction);
    rulesList = rulesList.concat(weaponRules);
    return uniq(rulesList);
  };

  const getMissions = () => {
    return rootMissions || {};
  }

  const getMissionScenarios = () => {
    return Object.values(getMissions().missions || {});
  }

  const getMissionWeather = () => {
    return Object.values(getMissions().weather || {});
  }

  const getMissionConditions = () => {
    return Object.values(getMissions().conditions || {});
  }

  const getMissionSecondaries = () => {
    return Object.values(getMissions().secondaries || {});
  }

  return {
    getNameLists,
    getNameList,
    getRandomName,
    getRandomFemaleName,
    getRandomMaleName,
    resolvePoints,
    getSetbacks,
    getSetback,
    getGameType,
    getPerks,
    getPerk,
    getRawFaction,
    getAllKeywords,
    getOrganizationCategory,
    getOrganizationSlotsRaw,
    getRawOrganizations,
    getOrganizations,
    getAllWeaponRules,
    getModels,
    getModel,
    getModelTotalPoints,
    getModelPoints,
    getModelWeaponPoints,
    getModelRulePoints,
    getWeaponCostForModel,
    getModelList,
    getAlliance,
    getAlliances,
    getRawAlliances,
    getRelicCost,
    getAllRules,
    getPowerCharge,
    getPhase,
    getUnits,
    getUnit,
    getAllWeapons,
    getAllWeapons2,
    getRules,
    getRulesList,
    getWeaponRules,
    getModelRules,
    getFactions,
    getRawPhases,
    getWeaponCostAverage,
    getRuleCostAverage,
    getRule,
    getUnitPoints,
    getWeapon,
    getWeapons,
    getWeaponList,
    getOptionsList,
    getAdditionalModelsList,
    getRuleCostForModel,
    getPowers,
    getFactionWithSubfaction,
    getPower,
    getAllModels,
    getStrategies,
    getStrategy,
    getRelics,
    getRelic,
    getFaction,
    getSubfaction,
    getPowerCategories,
    getCategories,
    getRawPowerCategories,
    getRawCategories,
    getPowerCategory,
    getCategory,
    getMissions,
    getMissionScenarios,
    getMissionSecondaries,
    getMissionWeather,
    getMissionConditions,
    getTerrain
  }
}

export const mergeGlobalData = (game, gameData) => {
  const gameType = get(game, 'gameType', 'battle');
  return mergeWith(get(gameData, `gameData.globalData.all`, {}), get(gameData, `gameData.globalData[${gameType}]`, {}))
}