import React from "react";
import { Container, Box } from "@mui/material";
import { useWindowDimensions } from "hooks";
import './footer.css';
import { Link } from '@mui/material';

// {'Miniatures from '} <a href="http://khurasanminiatures.tripod.com/">Khurasan Miniatures</a>
export const Footer = () => {
  const dimensions = useWindowDimensions();
  return (
    <Container>
      <Box display="flex" sx={{ mt: 2, mb: 2 }}>
        <Box display="flex" flexGrow={1}>
          {/* <a href="/updates" target="_blank"> {'Updates'}</a>
              <a href="https://github.com/wargame-engine" target="_blank">
                {" "}
                {"Github"}
              </a>
              <a href="https://discord.gg/M9sets4" target="_blank">
                {" "}
                {"Discord"}
              </a> */}
          <Link href="/privacy"> {"Privacy Policy"}</Link>
          {/* <a href="https://www.patreon.com/bePatron?u=36845786" target="_blank"> {'Patreon'}</a> */}
        </Box>
        <Box className={dimensions.width > 768 ? "text-right" : ""}>
          &#169; <Link href="https://www.indiegamerules.com">Indie Game Rules</Link>{" "}
          {new Date().getFullYear()}
        </Box>
      </Box>
    </Container>
  );
};
