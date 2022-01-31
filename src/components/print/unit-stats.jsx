import React, { useState } from 'react';
import { getTextColor, hexToRgb } from 'utils/colors';
import { isNil, isNumber } from 'lodash';
import { formatModel } from 'utils/format';
import { OptionList } from 'components/roster/option-list';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';

export const UnitStats = (props) => {
  const { data, unit, faction, toggler, models, options, perks, setbacks, powerSpecialty } = props;
  const [showOptions, setShowOptions] = useState(false);
  const { color: factionColor, secondary_color: factionSecondaryColor } = faction;
  const textColor = factionColor ? getTextColor(hexToRgb(factionColor)) : 'white';
  const textColorSecondary = factionSecondaryColor ? getTextColor(hexToRgb(factionSecondaryColor)) : 'white';
  const borderColor = (textColor !== 'white') ? textColor : factionColor;
  const thStyle = { backgroundColor: factionSecondaryColor || factionColor, color: factionSecondaryColor ? textColorSecondary : textColor };
  const btnStyle = { borderColor };
  const unitModels = models ? models : data.getModels(unit, faction)
    .filter((model) => !(model.shoot === "-" && model.fight === "-" && model.save === "-"));
  const perkString = (perks && perks.length) ? `${perks.length > 1 ? 'perks' : 'the perk'} (${(perks.map((perk) => perk.name)).join(', ')})` : '';
  const setbackString = (setbacks && setbacks.length) ? `${setbacks.length > 1 ? 'injuries' : 'the injury'} (${(setbacks.map((setback) => setback.name)).join(', ')})` : '';
  const combinedString = [ perkString, setbackString ].filter((str) => str.length).join(' and ');
  const unitPowerSpecialty = powerSpecialty ? powerSpecialty : '';
  const renderAdditionalModels = (unit, faction) => {
    return (
      <ul className="ul-indent" style={{ marginBottom: '0'}}>
        {(unit.models || []).filter(model => model.min > 0).map((model) => formatModel(model, unit, faction, data)).map((modelString) => (
          <li>{modelString}</li>
        ))}
      </ul>
    )
  }
  if (!unit) {
    return null;
  }
  return (
    <div>
      {!!toggler && <div className="text-center" style={{ padding: '0.5rem 0px' }}>
        <Button variant="outline-primary" size="sm" style={btnStyle} block onClick={() => setShowOptions(!showOptions)}>{showOptions ? 'Hide' : 'Unit Stats'}</Button>
      </div>}
      <Collapse in={!toggler || showOptions}>
        <div>
          {/*<p><b>{'Category:'}</b> {`${data.getCategory(unit.category).name || data.getCategories()[0].name || 'No Category'}`}</p>*/}
          <>{renderAdditionalModels(unit, faction)}</>
          <div>{!!options && <OptionList twoColumn={false} faction={faction} options={options} toggler={false} />}</div>
          <div style={{ marginBottom: '0.5rem' }}><ul className="optionUl">{!!unitPowerSpecialty && <li>The unit has the Power specialty {unitPowerSpecialty}</li>}</ul></div>
          <div style={{ marginBottom: '0.5rem' }}><ul className="optionUl">{!!combinedString && <li>The unit has {combinedString}</li>}</ul></div>
          {!!unitModels.length && <table striped responsive size="sm" style={{ marginBottom: 0}}>
            <thead style={thStyle}>
              <tr>
                <th>{"Model"}</th>
                <th className="text-center">{"Mov"}</th>
                <th className="text-center">{"Acc"}</th>
                <th className="text-center">{"Str"}</th>
                <th className="text-center">{"Sav"}</th>
                <th className="text-center">{"Init"}</th>
                <th className="text-center">{"Co"}</th>
              </tr>
            </thead>
            <tbody>
              {unitModels.map((model) => (
                <tr>
                  <td>
                    {model.name}
                  </td>
                  <td className="text-center">
                    {`${isNumber(model.movement) ? `${model.movement}"` : model.movement}`}
                  </td>
                  <td className="text-center">
                    {`${!!(model.shoot) ? `${model.shoot}` : '-'}`}
                  </td>
                  <td className="text-center">
                    {`${!!(model.fight) ? `${model.fight}` : '-'}`}
                  </td>
                  <td className="text-center">
                    {`${!!(model.defense) ? `${model.defense}` : '-'}`}
                  </td>
                  <td className="text-center">
                    {`${!!(model.reflexes) ? `${model.reflexes}` : '-'}`}
                  </td>
                  <td className="text-center">
                    {`${!!(model.courage) ? `${model.courage}` : '-'}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      </Collapse>
    </div>
  );
}