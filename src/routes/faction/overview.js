import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  CardHeader, IconButton, List,
  ListItem, ListItemText, Typography
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { get, sortBy } from "lodash";
import React from "react";
import { getTextColor, hexToRgb } from "utils/colors";

export const Overview = (props) => {
  const { faction, nameFilter } = props;
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const background = faction.background;
  const description = faction.description;
  const strengths = faction.strengths;
  const weaknesses = faction.weaknesses;
  const powers = get(faction, "buyLinks", []).filter((list) =>
    nameFilter
      ? list.name.toLowerCase().includes(nameFilter.toLowerCase())
      : true
  );
  const sortedPowers = sortBy(powers, (power) => power.name);
  return (
    <div>
      <Typography sx={{ my: 2 }} variant="h4" align="center">
        Overview
      </Typography>
      {!background &&
        !description &&
        !strengths &&
        !weaknesses &&
        !sortedPowers && (
          <div>
            <p>{`No information available...`}</p>
          </div>
        )}

      {!!description && (
        <Card
          sx={{
            border: `2px solid ${factionColor}`,
            mb: 2,
          }}
        >
          <CardHeader
            sx={{ backgroundColor: factionColor, color: textColor, py: 1 }}
            title={
              <Typography variant="h5" component="div">
                {"Description"}
              </Typography>
            }
          />
          <CardContent>{description}</CardContent>
        </Card>
      )}
      {/* {!!background && <div className="unit-card" style={{ marginBottom: '15px', borderColor: factionColor }}>
        <div style={thStyle} className="unit-card-title">
          <h4>{'Background'}</h4>
        </div>
        <div className="unit-card-body">
          {background}
        </div>
      </div>} */}
      {/* {!!strengths && <div>
        <h4>{'Strengths'}</h4>
        <p>{strengths}</p>
        <hr />
      </div>}
      {!!weaknesses && <div>
        <h4>{'Weaknesses'}</h4>
        <p>{weaknesses}</p>
        <hr />
      </div>} */}
      {!!sortedPowers && !!sortedPowers.length && (
        <Card
          sx={{
            border: `2px solid ${factionColor}`,
            mb: 2,
          }}
        >
          <CardHeader
            sx={{ backgroundColor: factionColor, color: textColor, py: 1 }}
            title={
              <Typography variant="h5" component="div">
                {"Model Makers"}
              </Typography>
            }
          />
          <CardContent style={{ padding: 0 }}>
            <List
              sx={{
                width: "100%"
              }}
            >
              {sortedPowers.map((list) => (
                <ListItem
                  key={list.name}
                  secondaryAction={
                    <IconButton edge="end" aria-label="comments" onClick={() => window.open(list.link, "_blank")}>
                      <ShoppingCartIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    id={list.name}
                    primary={list.name}
                    secondary={list.description}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
