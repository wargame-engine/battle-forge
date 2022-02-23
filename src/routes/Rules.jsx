import RehypeToc from '@jsdevtools/rehype-toc';
import { useMediaQuery, useTheme } from '@mui/material';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

export default function QuickRules(props) {
  const [{ data: nope, userPrefs, setAppState }] = useContext(DataContext);
  const { gameRules, skirmishRules, racingRules } = nope;
  const showBeta = userPrefs.showBeta;
  const gameTypesRaw = { all: { name: "All" }, ...get(nope, 'gameData.gameTypes', {}) };
  const gamesUnsorted = Object.values(get(nope, `gameData.games`, {})).filter((game) => game.version && Number(game.version)).filter((game) => showBeta ? true : game.version && Number(game.version) >= 1);
  const gameTypes = [...Object.keys(gameTypesRaw).filter((gameType) => gamesUnsorted.filter((game) => game.gameType === gameType).length)];
  let [activeTab, setActiveTab] = useQueryParams("tab", 0);
  const mdRenderer = React.useMemo(() => MarkdownRenderer(), []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const StyledRules = styled.div`
    h1 {
      font-size: 20pt;
      font-weight: bold;
      border-bottom: 4px solid ${theme.palette.primary.main};
      padding-bottom: 0.25rem;
    }
    h2 {
      font-size: 18pt;
      border-bottom: 2px solid ${theme.palette.primary.main};
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
  const activeTabNumber = parseInt(activeTab) || 0;
  const activeGameTypeData = gameTypesRaw[gameTypes[activeTabNumber]];
  const activeGameName = get(activeGameTypeData, 'name', 'Battle');
  let activeRules = gameRules;
  if (activeGameName === 'Skirmish') {
    activeRules = skirmishRules
  } else if (activeGameName === 'Racing') {
    activeRules = racingRules
  }
  const scrollWithOffset = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  React.useEffect(() => {
    setAppState({
      enableSearch: false,
      contextActions: [
        {
          name: 'Top',
          icon: <ArrowUpwardIcon />,
          onClick: () => scrollWithOffset()
        }
      ]
    })
    return () => {
      setAppState({
        contextActions: []
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ userPrefs.developerMode ]);
  return (
    <Container>
      <Typography variant="h3" align="center">{`Core Rules`}</Typography>
      <Box sx={{ width: "100%", bgcolor: "background.paper", top: isMobile ? "56px" : "64px", }} className="sticky">
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
      {/* <Typography variant="h4" align="center" sx={{ mb: 2 }}>{`${activeGameTypeData?.name}`}</Typography> */}
      <div
        style={{ marginBottom: "15px", borderColor: theme.palette.primary.main }}
      >
        <div>
          <StyledRules>
            <ReactMarkdown components={mdRenderer} children={activeRules} rehypePlugins={[[RehypeToc, { headings: ["h1", "h2"] }]]} />
          </StyledRules>
        </div>
      </div>
    </Container>
  );
}
