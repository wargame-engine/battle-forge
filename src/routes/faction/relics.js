import { Box, Typography } from "@mui/material";
import { RelicCard } from "components/roster/relic-card";
import { get, groupBy, sortBy } from "lodash";
import React from "react";

export const Relics = (props) => {
  const { data, faction, nameFilter } = props;

  const RELIC_TYPES = {
    equipment: "Equipment",
    ability: "Abilities",
  };

  const nameFilterer = (relic) => {
    if (!nameFilter) {
      return true;
    }
    const relicData = relic.weapon
      ? data.getWeapon(relic.weapon, faction)
      : data.getRule(relic.rule, faction);
    return relicData.name.toLowerCase().includes(nameFilter.toLowerCase());
  };

  const relics = data.getRelics(faction).filter(nameFilterer);
  const groupedRelics = groupBy(relics, (relic) =>
    relic.type || relic.rule ? "ability" : "equipment"
  );

  return (
    <div>
      {!relics.length && <p>{"No legends found..."}</p>}
      <div>
        {Object.keys(RELIC_TYPES)
          .filter(
            (type) => !!groupedRelics[type] && !!groupedRelics[type].length
          )
          .map((relicType, relicIdxKey) => {
            const relicsType = get(groupedRelics, `[${relicType}]`, [])
              .map((relic) => ({
                ...relic,
                cost: data.getRelicCost(relic, faction),
              }))
              .map((strat) => ({
                ...strat,
                sourceLength: strat.source.length,
              }));
            const sortedRelics = sortBy(relicsType, [
              "sourceLength",
              "source",
              "cost",
            ]);
            return (
              <>
                <div key={relicIdxKey}>
                  <Typography
                    sx={{ my: 2 }}
                    variant="h4"
                    component="div"
                    align="center"
                  >
                    {RELIC_TYPES[relicType]}
                  </Typography>
                </div>
                <div className="two-columns">
                  {sortedRelics.map((relic, index) => {
                    return (
                      <Box sx={{ mb: 2 }} style={{ breakInside: "avoid" }} key={index}>
                        <RelicCard faction={faction} relic={relic} data={data} />
                      </Box>
                    );
                  })}
                </div>
              </>
            );
          })}
      </div>
    </div>
  );
};
