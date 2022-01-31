import React, { useState } from "react";
import { getTextColor, hexToRgb } from "utils/colors";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import './option-list.css';

export const OptionList = (props) => {
  const { options, faction, toggler = true, twoColumn = true } = props;
  const [showOptions, setShowOptions] = useState(false);
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const borderColor = textColor !== "white" ? textColor : factionColor;
  const btnStyle = { borderColor };

  const renderOptionList = (option) => {
    if (!option.list) {
      return null;
    }
    if (option.list.length === 1) {
      return ` ${option.list[0].text}`;
    }
    return (
      <ul className="optionSubUl">
        {!!option.list &&
          option.list.map((opt, index) => <li key={index}>{opt.text}</li>)}
      </ul>
    );
  };

  if (!options || !options.length) {
    return null;
  }
  return (
    <div>
      {!!toggler && (
        <div className="text-center" style={{ marginBottom: "0.5rem" }}>
          <Button
            sx={{ color: 'inherit', textTransform: 'none' }}
            size="small"
            fullWidth
            variant="outlined"
            block
            style={btnStyle}
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? "Hide" : "Unit Options"}
          </Button>
        </div>
      )}
      <Collapse in={!toggler || showOptions}>
        <div>
          <div className={twoColumn ? "two-columns" : ""}>
            <ul className="optionUl">
              {options.map((option) => {
                return (
                  <div className="no-break">
                    <li>
                      <div className="no-break">
                        {option.option || option}
                        {renderOptionList(option)}
                      </div>
                    </li>
                  </div>
                );
              })}
            </ul>
          </div>
        </div>
      </Collapse>
    </div>
  );
};
