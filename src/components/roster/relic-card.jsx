import {
  Card, CardContent, CardHeader, Divider,
  Typography
} from "@mui/material";
import { RuleList } from "components/roster/rule-list";
import { WeaponList } from "components/roster/weapon-list";
import ReactMarkdown from "react-markdown";
import { getTextColor, hexToRgb } from "utils/colors";

const dummyModel = {
  name: "Battle Brother",
  courage: 7,
  shoot: 6,
  fight: 6,
  defense: 7,
  movement: 5,
  reflexes: 7,
  agility: 6,
  wounds: 3,
  weapons: [
    { id: "marine_rifle" },
    "at_grenade",
    { id: "ccw", count: 2 },
    "marine_pistol",
  ],
  min: 4,
  max: 9,
};

export const RelicCard = (props) => {
  const { faction, relic, data, printMode = false } = props;
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const weaponData = relic.weapon
    ? data.getWeapon(relic.weapon, faction)
    : undefined;
  const ruleData = relic.rule ? data.getRule(relic.rule, faction) : undefined;
  const weaponRules = relic.weapon
    ? data.getRules(
        [
          {
            models: [
              {
                ...dummyModel,
                rules: [],
                weapons: [relic.weapon],
              },
            ],
          },
        ],
        faction
      )
    : [];
  const relicCost = Math.round(data.getRelicCost(relic, faction));
  return (
    <Card
      className="no-break no-page-break force-print"
      sx={{
        border: `2px solid ${factionColor}`,
      }}
    >
      <CardHeader
        sx={{
          backgroundColor: factionColor,
          color: textColor,
          py: 1,
        }}
        title={
          <Typography variant="h5" component="div">
            {relic.name} <small style={{ fontSize: '1rem'}}>{`(${relicCost}pts)`}</small>
          </Typography>
        }
      />
      <CardContent>
        {(!!relic.flavor && !printMode) && (
          <>
            <i className="legend-flavor">{relic.flavor}</i>
            <Divider />
          </>
        )}
        {!!relic.description && (
          <div className="legend-description">
            <ReactMarkdown children={relic.description} className="rule-text" />
            <Divider />
          </div>
        )}
        <div>
          {!!ruleData && (
            <div className="legend-rules-text">
              <ReactMarkdown
                children={`${`__${ruleData.name}:__ `} ${ruleData.description}`}
                className="rule-text"
              />
            </div>
          )}
          {!!weaponData && (
            <div className="legend-rules-text">
              <WeaponList
                weapons={[weaponData]}
                faction={faction}
                data={data}
              />
            </div>
          )}
          {!!weaponRules.length && (
            <div className="legend-rules-text">
              <RuleList
                twoColumn={false}
                rules={weaponRules}
                faction={faction}
              />
            </div>
          )}
        </div>
        {!!relic.source && (
          <div className="legend-description">
            <Divider />
            <i>{relic.source}</i>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
