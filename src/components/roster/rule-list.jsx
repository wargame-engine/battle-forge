import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getTextColor, hexToRgb } from "utils/colors";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";

export const RuleList = (props) => {
  const { rules, faction, toggler, twoColumn, showName = true } = props;
  const [showRules, setShowRules] = useState(false);
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const borderColor = textColor !== "white" ? textColor : factionColor;
  const btnStyle = { borderColor };
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
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? "Hide" : "Special Rules"}
          </Button>
        </div>
      )}
      <Collapse in={!toggler || showRules}>
        <div>
          <div className={twoColumn ? "two-columns" : ""}>
            {rules.map((rule) => {
              const ruleName = `${rule.name}${
                rule.inputs
                  ? `(${rule.inputs
                      .map((input) => input.toUpperCase())
                      .join(", ")})`
                  : ``
              }`;
              const stuff = `${showName ? `**${ruleName}**: ` : ""}${
                rule.description
              }`;
              return (
                <div className="no-break">
                  <>
                    <ReactMarkdown children={stuff} className="rule-text" />
                  </>
                </div>
              );
            })}
          </div>
        </div>
      </Collapse>
    </div>
  );
};
