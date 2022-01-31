import React, { useMemo } from 'react';
import { getTextColor, hexToRgb } from 'utils/colors';
import { formatLevel } from 'utils/format';
import { WeaponList } from 'components/roster/weapon-list';
import ReactMarkdown from 'react-markdown';
import { RuleList } from 'components/roster/rule-list';
import { OptionList } from 'components/roster/option-list';
import { UnitStats } from 'components/roster/unit-stats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get, uniq } from 'lodash';
import Button from '@mui/material/Button'

export const UnitCard = (props) => {
  const { unit, data, faction, subfactionId = "none", pinned, showOptions = true, unitOptions, points, weapons, rules, weaponRules, models, embeddedOptions = false, toggler = true, focusView = true, perks, level, setbacks, powerSpecialty } = props;
  const handlePinUnit = props.onPinUnit || function () { };
  const { color: factionColor } = faction;
  const textColor = factionColor ? getTextColor(hexToRgb(factionColor)) : 'white';
  const borderColor = (textColor !== 'white') ? textColor : factionColor;
  const pinColorActive = (textColor !== 'white') ? 'black' : 'white';
  const pinColorOff = (textColor !== 'white') ? `rgb(62, 62, 62)` : 'black';
  const thStyle = { backgroundColor: factionColor || '#376f8c', color: textColor, borderColor };
  const cardStyle = { border: `2px solid ${borderColor}` }
  const unitPoints = useMemo(() => { return points ? points : (data.getUnitPoints(unit, faction)) }, [unit, faction]);
  const unitWeapons = weapons ? weapons : data.getWeapons(unit, faction) || [];
  const unitRules = rules ? rules : data.getModelRules([unit], faction);
  const weaponRuleList = weaponRules ? weaponRules : data.getWeaponRules([unit], faction);
  const unitSubfactions = focusView ? [subfactionId !== "none" ? `${({ ...data.getSubfaction(faction.id, subfactionId) }.name || 'No')} Focus` : ''].filter((name) => !!name) : uniq(get(unit, 'subfactions', []).map((subfactionId) => data.getSubfaction(faction.id, subfactionId)).map((subfac) => `${subfac.name || "No"} Focus`));
  const unitSetbacksCount = (setbacks || []).length;
  const renderModelRules = (rules) => {
    if (!rules.length) {
      return;
    }
    return (
      <>
        {!toggler && <hr style={thStyle} />}
        <RuleList twoColumn toggler={toggler} faction={faction} rules={rules} />
      </>
    )
  }
  const renderModelExtraRules = (perks) => {
    if (!perks.length) {
      return;
    }
    return (
      <>
        <hr style={thStyle} />
        <div className={'two-columns'}>
          {perks.map((perk) => {
            const ruleName = `${perk.name}: `;
            return (
              <div className="no-break">
                <>
                  <ReactMarkdown children={`**${ruleName}**${perk.description}`} className="rule-text" /></>
              </div>
            )
          })}
        </div>
      </>
    )
  }
  function renderOptions(data, unit, faction) {
    let options = unitOptions ? unitOptions : data.getOptionsList(unit, faction);
    if (!options.length) {
      return;
    }
    return (
      <div style={{ marginBottom: '0.5em' }}>
        <OptionList faction={faction} options={options} />
      </div>
    );
  }
  return (
    <div id={unit.id} className="unit-card" style={{ borderColor: factionColor, pageBreakInside: 'avoid' }}>
      <div className="unit-card-title" style={thStyle}>
        <div className="d-flex justify-content-start align-items-end">
          <h3 className="text-left">
            <span style={{ marginRight: '5px' }}>{unit.customName || unit.name}</span>
            <small class="unit-points">{`(${unitPoints}pts)`}</small>
            <span style={{ marginLeft: '5px' }} className="badge badge-success">{level ? `${formatLevel(level)}` : ''}</span>
            <span style={{ marginLeft: '5px' }} className="badge badge-danger">{(unitSetbacksCount > 0) ? `${unitSetbacksCount} ${unitSetbacksCount > 1 ? 'Injuries' : 'Injury'}` : ''}</span>
          </h3>
          <div className="d-flex justify-content-end">
          </div>
        </div>
      </div>
      <div className="unit-card-body">
        {!!unit.description && <>
          <p style={{ marginBottom: '0.5em' }}><i>{unit.description}</i></p>
          <hr style={thStyle} />
        </>}
        <div style={{ marginBottom: '0.5em' }}>
          <UnitStats powerSpecialty={powerSpecialty} models={models} unit={unit} faction={faction} data={data} perks={perks} setbacks={setbacks} options={embeddedOptions ? unitOptions : undefined} />
        </div>
        {/* {!!showOptions && renderOptions(data, unit, faction)} */}
        {/* {!!unitWeapons.length && <div style={{ marginBottom: '0.5em' }}><WeaponList toggler={toggler} weapons={unitWeapons} faction={faction} data={data} rules={weaponRuleList} /></div>} */}
        {/* {renderModelRules(unitRules)} */}
        {/* {renderModelExtraRules([...(perks || []), ...(setbacks || [])])} */}
        <hr style={thStyle} />
        <span><b>Keywords: </b>
          {([faction.name, ...unitSubfactions, ...(unit.keywords || ["Infantry"])]).join(', ')}
        </span>
      </div>
    </div>
  )
}