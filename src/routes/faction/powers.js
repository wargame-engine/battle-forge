import {
  Box, Typography
} from "@mui/material";
import { PowerCard } from 'components/roster/power-card';
import { get, groupBy, sortBy } from "lodash";
import React from "react";

export const Powers = (props) => {
  const { data, faction, nameFilter } = props;
  const strategies = data
    .getPowers(faction)
    .filter((power) =>
      nameFilter
        ? power.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const phases = { ...data.getRawPowerCategories(faction) };
  const unitPhases = { ...groupBy(strategies, "category") };
  const phaseOrder = [undefined, ...Object.keys(phases)].filter(
    (cat) => unitPhases[cat] && unitPhases[cat]
  );
  return (
    <>
      {!strategies.length && <p>{"No strategies found..."}</p>}
      {phaseOrder.map((phaseId, phaseIdx) => {
        const phaseStrategies = get(unitPhases, `[${phaseId}]`, []).map(
          (strat) => ({ ...strat, sourceLength: strat.source.length })
        );
        const sortedStrategies = sortBy(phaseStrategies, [
          "sourceLength",
          "source",
          "charge",
        ]);
        const phaseData = data.getPowerCategory(phaseId, faction);
        return (
          <>
            <div key={phaseIdx}>
              <Typography
                sx={{ my: 2 }}
                variant="h4"
                component="div"
                align="center"
              >
                {phaseData.name || "Any Specialty"}
              </Typography>
            </div>
            <div className="two-columns">
              {sortedStrategies.map((power, index) => (
                <div key={index} className="no-break">
                  <Box sx={{ mb: 2 }}>
                    <PowerCard faction={faction} power={power} />
                  </Box>
                </div>
              ))}
            </div>
          </>
        );
      })}
    </>
  );
};
