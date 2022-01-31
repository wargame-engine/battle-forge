import {
  Box, Typography
} from "@mui/material";
import { StrategyCard } from "components/roster/strategy-card";
import { get, groupBy, sortBy } from "lodash";
import React from "react";

export const Strategies = (props) => {
  const { data, faction, nameFilter } = props;
  const strategies = data
    .getStrategies(faction)
    .filter((strategy) =>
      nameFilter
        ? strategy.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const phases = { ...data.getRawPhases() };
  const unitPhases = { ...groupBy(strategies, "phase") };
  const phaseOrder = [...Object.keys(phases), undefined].filter(
    (cat) => unitPhases[cat] && unitPhases[cat]
  );
  return (
    <div>
      {!strategies.length && <p>{"No strategies found..."}</p>}
      {phaseOrder.map((phaseId, phaseKey) => {
        const phaseStrategies = get(unitPhases, `[${phaseId}]`, []).map(
          (strat) => ({ ...strat, sourceLength: strat.source.length })
        );
        const sortedStrategies = sortBy(phaseStrategies, [
          "sourceLength",
          "source",
          "cost",
        ]);
        const phaseData = data.getPhase(phaseId);
        return (
          <>
            <div key={phaseKey} className="no-break">
              <Typography
                sx={{ my: 2 }}
                variant="h4"
                component="div"
                align="center"
              >
                {phaseData.name || "Any Phase"}
              </Typography>
            </div>
            <div className="two-columns">
              {sortedStrategies.map((strategy, index) => (
                <div key={index} className="no-break">
                  <Box sx={{ mb: 2 }}>
                    <StrategyCard faction={faction} strategy={strategy} />
                  </Box>
                </div>
              ))}
            </div>
          </>
        );
      })}
    </div>
  );
};
