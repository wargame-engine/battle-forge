import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Footer } from "components/footer";
import { MainNav } from "components/MainNav";
import { usePageTitle } from 'hooks';
import { get } from "lodash";
import React from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Faction from "routes/faction";
import Factions from "routes/factions";
import Games from "routes/games";
import Lists from "routes/Lists";
import PageNotFound from "routes/PageNotFound";
import Privacy from "routes/Privacy";
import Rosters from "routes/rosters";
import Rules from "routes/Rules";
import Splash from "routes/Splash";
import Updates from "routes/Updates";

export default function Core(props) {
  const history = useHistory();
  const path = get(history, "location.pathname", "/");

  const title = usePageTitle();
  React.useEffect(() => {
    document.title = `Battle Forge - ${title}`
  }, [title]);

  return (
    <>
      <MainNav />
      <div className="main">
        {path !== "/" && (
          <Container>
            <Box sx={{ pt: 2, pb: 2 }}>
              {/* <Breadcrumbs /> */}
            </Box>
          </Container>
        )}
        <Switch>
          <Route exact path="/" component={Splash} />
          <Route exact path="/privacy" component={Privacy} />
          <Route exact path="/rules" component={Rules} />
          <Route exact path="/updates" component={Updates} />
          <Route
            exact
            path="/games/:gameName/:factionName"
            component={Faction}
          />
          <Route exact path="/games/:gameName" component={Factions} />
          <Route exact path="/games" component={Games} />
          <Route exact path="/lists" component={Rosters} />
          <Route
            exact
            path="/lists/:listId"
            component={Lists}
          />
          <Route component={PageNotFound} />
        </Switch>
        <Footer className="footer" />
      </div>
    </>
  );
}
