import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, CardActionArea,
  CardActions, CardHeader, Grid, Typography
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Popover from '@mui/material/Popover';
import { Dropdown } from 'components/dropdown';
import { get, groupBy, sortBy } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router';
import { getTextColor, hexToRgb } from 'utils/colors';
import { DataAPI } from 'utils/data';
import './factions.css';

export const Factions = (props) => {
  const { game, gameName, nameFilter, deleteFaction, rawData, userPrefs } = props;
  const navigate = useNavigate();
  const data = DataAPI(game);
  const alliances = data.getRawAlliances();
  const showBeta = userPrefs.showBeta;
  const factions = sortBy(data.getFactions(gameName).filter(unit => nameFilter ? unit.name.toLowerCase().includes(nameFilter.toLowerCase()) : true), 'name').filter((game) => showBeta ? true : game.version && Number(game.version) >= 1);
  const unitCategories = groupBy(factions, "alliance");
  const categoryOrder = [...Object.keys(alliances), undefined].filter((cat) => unitCategories[cat] && unitCategories[cat].length);
  const goToFaction = (faction) => navigate(`/games/${gameName}/${faction.id}`);
  if (!data) {
    return <p>{"Ohai"}</p>
  }
  return (
    <>
      {categoryOrder.map((allianceKey) => {
        const factions = get(unitCategories, `[${allianceKey}]`, []);
        const allianceData = data.getAlliance(allianceKey);
        return (
          <>
            <Typography variant="h4" gutterBottom align="center" sx={{ my: 2 }}>
              {allianceData.name || "Unaligned"}
            </Typography>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              {factions.map((faction, index) => {
                const factionColor = faction.color;
                const textColor = factionColor
                  ? getTextColor(hexToRgb(factionColor))
                  : "white";
                const isModified = Object.values(
                  get(
                    rawData,
                    `customData.games[${gameName}].factions[${faction.id}]`,
                    {}
                  )
                ).length;
                return (
                  <Grid item sx={{ pb: 2 }} md={4} key={index}>
                    <Card
                      sx={{
                        border: `2px solid ${factionColor}`,
                      }}
                    >
                      <CardActionArea onClick={() => goToFaction(faction)}>
                        <CardHeader
                          sx={{ backgroundColor: factionColor, color: textColor, p: 1 }}
                          title={
                            <Typography
                              variant="h5"
                              component="div"
                              align="center"
                            >
                              {!!isModified && (
                                <Dropdown>
                                  {({ handleClose, open, handleOpen, anchorElement }) => (
                                    <>
                                      <span
                                        aria-haspopup="true"
                                        onMouseEnter={handleOpen}
                                        onMouseLeave={handleClose} style={{ marginRight: '5px' }}>
                                        <FontAwesomeIcon
                                          icon={faExclamationCircle}
                                        />
                                      </span>
                                      <Popover
                                        variant="warning"
                                        id="mouse-over-popover"
                                        sx={{
                                          pointerEvents: 'none',
                                        }}
                                        open={open}
                                        anchorEl={anchorElement}
                                        anchorOrigin={{
                                          vertical: 'top',
                                          horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                          vertical: 'bottom',
                                          horizontal: 'center',
                                        }}
                                        onClose={handleClose}
                                        disableRestoreFocus
                                      >
                                        <Typography sx={{ p: 1 }}>Warning: Data Is Modified Locally</Typography>
                                      </Popover>
                                    </>
                                  )}
                                </Dropdown>
                              )}
                              {faction.name}
                              {/* <small style={{ marginLeft: '5px', fontSize: '1rem'}}>
                                {game.version ? `(${game.version})` : ""}
                              </small> */}
                            </Typography>
                          }
                        />
                        {!!faction.image && (
                          <CardMedia
                            component="img"
                            height="250"
                            image={game.image}
                            alt="green iguana"
                          />
                        )}
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography align="center">
                            {faction.description || " "}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      {!faction.url && (
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteFaction(game.id);
                            }}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        );
      })}
    </>
  );
}