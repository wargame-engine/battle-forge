import {
  Card, CardContent, CardHeader, Divider,
  Typography
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { getTextColor, hexToRgb } from 'utils/colors';

export const PowerCard = (props) => {
  const { faction, power } = props;
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  return (
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
          <Typography variant="h5" component="div">
            {power.name} <small style={{ fontSize: '1rem'}}>{`(${power.charge})`}</small>
          </Typography>
        }
      />
      <CardContent>
        {!!power.flavor && (
          <>
            <i className="power-flavor">{power.flavor}</i>
            <Divider />
          </>
        )}
        <div className="power-description">
          <ReactMarkdown children={power.description} className="rule-text" />
        </div>
        {!!power.source && (
          <>
            <Divider />
            <i className="power-source">{power.source}</i>
          </>
        )}
      </CardContent>
    </Card>
  );
};
