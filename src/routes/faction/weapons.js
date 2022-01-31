import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { WeaponList } from "components/roster/weapon-list";
import { sortBy } from "lodash";
import React from "react";
import { getTextColor, hexToRgb } from "utils/colors";

export const Weapons = React.memo((props) => {
  const { data, faction, nameFilter } = props;
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const weapons = data
    .getAllWeapons(faction)
    .filter((strategy) =>
      nameFilter
        ? (strategy.name || "").toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const weaponsSorted = sortBy(weapons, "name");
  return (
    <div>
      <Typography sx={{ my: 2 }} variant="h4" component="div" align="center">
        Weapons
      </Typography>
      {!weapons.length && <p>{"No weapons found..."}</p>}
      {!!weapons.length && (
        <div className="two-columns">
          {weaponsSorted.map((rule, index) => (
            <div style={{ breakInside: "avoid-column" }} key={index}>
              <Card
                className="no-break"
                sx={{
                  border: `2px solid ${factionColor}`,
                  mb: 2,
                }}
              >
                <CardHeader
                  sx={{
                    backgroundColor: factionColor,
                    color: textColor,
                    py: 1,
                  }}
                  title={
                    <Typography variant="h6" component="div">
                      {rule.name}
                    </Typography>
                  }
                />
                <CardContent>
                  {!!rule.description && (
                    <>
                      <i>{rule.description}</i>
                      <hr />
                    </>
                  )}
                  <WeaponList
                    twoColumns={false}
                    faction={faction}
                    data={data}
                    weapons={[rule]}
                    rules={data.getAllWeaponRules([rule], faction)}
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
