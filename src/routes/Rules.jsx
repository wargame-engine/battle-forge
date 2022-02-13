import RehypeToc from '@jsdevtools/rehype-toc';
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { DataContext } from 'hooks';
import useQueryParams from 'hooks/use-query-params';
import { get } from 'lodash';
import React, { useContext } from 'react';
import ReactMarkdown from "react-markdown";
import styled from 'styled-components';
import { MarkdownRenderer } from 'utils/markdown';

const StyledRules = styled.div`
h1 {
  font-size: 20pt;
  font-weight: bold;
  border-bottom: 4px solid rgb(57, 110, 158);
  padding-bottom: 0.25rem;
}
h2 {
  font-size: 18pt;
  border-bottom: 2px solid rgb(57, 110, 158);
  padding-bottom: 0.25rem;
}
h3 {
  font-size: 16pt;
}
h4 {
  font-weight: bold;
  font-size: 12pt;
}
h5 {
  font-weight: bold;
  font-size: 12pt;
}
p {
  break-inside: "avoid-column";
  page-break-inside: avoid; /* For Firefox. */
  -webkit-column-break-inside: avoid; /* For Chrome & friends. */
  break-inside: avoid; /* For standard browsers like IE. :-) */
}
`;

export default function QuickRules(props) {
  const [{ data: nope, userPrefs }] = useContext(DataContext);
  const { gameRules, skirmishRules } = nope;
  const showBeta = userPrefs.showBeta;
  const gameTypesRaw = { all: {name: "All"}, ...get(nope, 'gameData.gameTypes', {}) };
  const gamesUnsorted = Object.values(get(nope, `gameData.games`, {})).filter((game) => game.version && Number(game.version)).filter((game) => showBeta ? true : game.version && Number(game.version) >= 1);
  const gameTypes = [...Object.keys(gameTypesRaw).filter((gameType) => gamesUnsorted.filter((game) => game.gameType === gameType).length)];
  let [ activeTab, setActiveTab ] = useQueryParams("tab", 0);
  const mdRenderer = React.useMemo(() => MarkdownRenderer(), []);
  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }
  const handleChange = (event, newValue) => {
    toggle(newValue);
  };
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const activeTabNumber = parseInt(activeTab) || 0;
  const activeGameTypeData = gameTypesRaw[gameTypes[activeTabNumber]];
  const activeGameName = get(activeGameTypeData, 'name', 'Battle');
  const activeRules = activeGameName === 'Battle' ? gameRules : skirmishRules;
  return (
    <Container>
      <>
        {/* <HideOnScroll>
          {({ show }) => (
            <SpeedDial
              ariaLabel="SpeedDial tooltip example"
              sx={{ position: "fixed", bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              hidden={!show}
            >
              <SpeedDialAction
                tooltipOpen
              FabProps={{
                sx: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.getContrastText(theme.palette.primary.main)
                }
              }}
                tooltipTitle="Top"
                color="primary"
                onClick={scrollToTop}
                icon={<KeyboardArrowUpIcon />}
              />
            </SpeedDial>
          )}
        </HideOnScroll> */}
        <Typography variant="h3" align="center">{`Core Rules`}</Typography>
        <Box sx={{ width: "100%", bgcolor: "background.paper" }} className="sticky">
          {!!gameTypes && !!gameTypes.length && (
            <>
              <Box sx={{ width: "100%", bgcolor: "background.paper", pb: 1 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTabNumber}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    {gameTypes.map((tab, index) => {
                      const gameTypeData = gameTypesRaw[tab];
                      return (
                        <Tab
                          key={index}
                          sx={{ textTransform: "none" }}
                          label={gameTypeData?.name}
                          {...a11yProps(0)}
                        />
                      );
                    })}
                  </Tabs>
                </Box>
              </Box>
            </>
          )}
        </Box>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>{`${activeGameTypeData?.name}`}</Typography>
        <div
          className="unit-card"
          style={{ marginBottom: "15px", borderColor: "rgb(57, 110, 158)" }}
        >
          <div className="unit-card-body">
            <StyledRules>
              <ReactMarkdown components={mdRenderer} children={activeRules} rehypePlugins={[[ RehypeToc, { headings: ["h1", "h2", "h3"] } ]]} />
            </StyledRules>
          </div>
        </div>
      </>
    </Container>
  );
}
