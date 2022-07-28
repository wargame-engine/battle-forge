import {
  faBook,
  faBug
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Card, CardContent, CardHeader, Chip, Divider, IconButton, ListItemIcon,
  ListItemText,
  Menu, MenuItem, Typography
} from "@mui/material";
import { Dropdown } from "components/dropdown";
import { DescriptionModal, UnitDebugModal } from "components/roster/modals";
import { OptionList } from "components/roster/option-list";
import { RuleList } from "components/roster/rule-list";
import { UnitStats } from "components/roster/unit-stats";
import { WeaponList } from "components/roster/weapon-list";
import { useModal } from "hooks";
import { get, uniq } from "lodash";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { getTextColor, hexToRgb } from "utils/colors";
import { formatLevel } from "utils/format";



export const UnitCard = (props) => {
  const {
    unit,
    data,
    faction,
    subfactionId = "none",
    showOptions = true,
    unitOptions,
    points,
    weapons,
    rules,
    weaponRules,
    models,
    embeddedOptions = false,
    toggler: toggle = true,
    focusView = true,
    perks,
    level,
    setbacks,
    showContext = false,
    userPrefs,
    powerSpecialty,
    printMode
  } = props;
  const toggler = !printMode && toggle;
  const { color: factionColor } = faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";
  const borderColor = textColor !== "white" ? textColor : factionColor;
  const thStyle = {
    backgroundColor: factionColor || "#376f8c",
    color: textColor,
    borderColor,
  };
  const unitPoints = useMemo(() => {
    return points ? points : data.getUnitPoints(unit, faction);
  }, [points, data, unit, faction]);
  const unitWeapons = weapons ? weapons : data.getWeapons(unit, faction) || [];
  const unitRules = rules ? rules : data.getModelRules([unit], faction);
  const weaponRuleList = weaponRules
    ? weaponRules
    : data.getWeaponRules([unit], faction);
  const unitSubfactions = focusView
    ? [
      subfactionId !== "none"
        ? `${{ ...data.getSubfaction(faction.id, subfactionId) }.name || "No"
        } Focus`
        : "",
    ].filter((name) => !!name)
    : uniq(
      get(unit, "subfactions", [])
        .map((subfactionId) => data.getSubfaction(faction.id, subfactionId))
        .map((subfac) => `${subfac.name || "No"} Focus`)
    );
  const unitSetbacksCount = (setbacks || []).length;
  const [showUnitDescription, hideUnitDescription] = useModal(
    ({ extraProps }) => (
      <DescriptionModal
        {...props}
        hideModal={hideUnitDescription}
        unit={unit}
        {...extraProps}
      />
    ),
    [unit]
  );
  const [showUnitDebug, hideUnitDebug] = useModal(
    ({ extraProps }) => (
      <UnitDebugModal
        {...props}
        hideModal={hideUnitDebug}
        unit={unit}
        data={data}
        faction={faction}
        {...extraProps}
      />
    ),
    [unit, data, faction]
  );
  // const handleSearch = () => {
  //   const query = unit.searchTerms || `${faction.name} ${unit.name}`;
  //   const url = "http://www.google.com/search?q=" + query + "&tbm=isch";
  //   window.open(url, "_blank");
  // };
  const renderModelRules = (rules) => {
    if (!rules.length) {
      return;
    }
    return (
      <>
        {(!toggler) && <Divider style={thStyle} />}
        <div className="unit-specialrules">
          <RuleList
            twoColumn
            toggler={toggler}
            faction={faction}
            rules={rules}
          />
        </div>
      </>
    );
  };
  const renderModelExtraRules = (perks) => {
    if (!perks.length) {
      return;
    }
    return (
      <>
        <Divider style={thStyle} />
        <div className={"two-columns"}>
          {perks.map((perk) => {
            const ruleName = `${perk.name}`;
            const stuff = `**${ruleName}**: ${perk.description}`;
            return (
              <div className="no-break">
                <>
                  <ReactMarkdown
                    children={stuff}
                    className="rule-text"
                  />
                </>
              </div>
            );
          })}
        </div>
      </>
    );
  };
  function renderOptions(data, unit, faction) {
    let options = unitOptions
      ? unitOptions
      : data.getOptionsList(unit, faction);
    if (!options.length) {
      return;
    }
    return (
      <div style={{ marginBottom: "0.5em" }}>
        <OptionList faction={faction} options={options} toggler={toggler} />
      </div>
    );
  }

  const getExtraActions = () => {
    if (showContext && (unit.background || !!userPrefs.developerMode)) {
      return (
        <Dropdown>
          {({ handleClose, open, handleOpen, anchorElement }) => (
            <>
              <IconButton onClick={handleOpen} sx={{ color: 'inherit' }}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                anchorEl={anchorElement}
                id="basic-menu"
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  dense: false,
                  onClick: handleClose,
                  "aria-labelledby": "basic-button",
                }}
              >
                {!!unit.background && (
                  <MenuItem onClick={showUnitDescription}>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faBook} />
                    </ListItemIcon>
                    <ListItemText>Read More</ListItemText>
                  </MenuItem>
                )}
                {!!userPrefs.developerMode && (
                  <MenuItem onClick={showUnitDebug}>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faBug} />
                    </ListItemIcon>
                    <ListItemText>Debug Unit</ListItemText>
                  </MenuItem>
                )}
                {/* <Dropdown.Item onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Find Models</Dropdown.Item> */}
              </Menu>
            </>
          )}
        </Dropdown>
      );
    } else {
      return <></>;
    }
  };
  return (
    <Card
      className="force-print no-page-break"
      sx={{
        border: `2px solid ${factionColor}`,
      }}
    >
      <CardHeader
        sx={{ backgroundColor: factionColor, color: textColor, py: 1.25 }}
        title={
          <>
            <Typography variant="h5">
              <span style={{ marginRight: "5px" }}>{unit.customName || unit.name}</span>
              <small style={{ fontSize: '1rem' }}>{`(${unitPoints}pts)`}</small>
              {level > 0 && <Chip
                size="small"
                color="secondary"
                sx={{ ml: 1 }}
                label={level ? `${formatLevel(level)}` : ""}
              />}
              {unitSetbacksCount > 0 && <Chip
                size="small"
                color="error"
                sx={{ ml: 1 }}
                label={unitSetbacksCount > 0
                  ? `${unitSetbacksCount} ${unitSetbacksCount > 1 ? "Injuries" : "Injury"
                  }`
                  : ""}
              />}
            </Typography>
          </>
        }
        action={getExtraActions()}
      />
      <CardContent>
        {(!!unit.description && !printMode) && (
          <>
            <Typography
              className="unit-description"
              style={{ marginBottom: "0.5em" }}
            >
              <i>{unit.description}</i>
            </Typography>
            <Divider style={thStyle} />
          </>
        )}
        <div style={{ marginBottom: "0.5em" }} className="unit-stats">
          <UnitStats
            powerSpecialty={powerSpecialty}
            models={models}
            unit={unit}
            faction={faction}
            data={data}
            perks={perks}
            setbacks={setbacks}
            options={embeddedOptions ? unitOptions : undefined}
          />
        </div>
        {!!showOptions && renderOptions(data, unit, faction)}
        {!!unitWeapons.length && !printMode && (
          <div style={{ marginBottom: "0.5em" }} className="unit-weapons">
            <WeaponList
              toggler={toggler}
              weapons={unitWeapons}
              faction={faction}
              data={data}
              rules={weaponRuleList}
            />
          </div>
        )}
        {!printMode && <>{renderModelRules(unitRules)}</>}
        {renderModelExtraRules([...(perks || []), ...(setbacks || [])])}
        <Divider style={thStyle} />
        <span className="unit-keywords">
          <b>Keywords: </b>
          {[
            faction.name,
            ...unitSubfactions,
            ...(unit.keywords || ["Infantry"]),
          ].join(", ")}
        </span>
      </CardContent>
    </Card>
  );
};
