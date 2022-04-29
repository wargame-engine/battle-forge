import {
  Card, CardContent, CardHeader, Table, TableBody, TableCell, Typography
} from "@mui/material";
import { StyledTableRow } from "components/styled-table";
import React from "react";
import { getTextColor, hexToRgb } from "utils/colors";


export const Organization = (props) => {
  const { data, faction, nameFilter } = props;
  const organizations = data
    .getOrganizations()
    .filter((strategy) =>
      nameFilter
        ? strategy.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true
    );
  const { color: factionColor } =
    faction;
  const textColor = factionColor
    ? getTextColor(hexToRgb(factionColor))
    : "white";

  return (
    <>
      <div>
        <Typography sx={{ my: 2 }} variant="h4" align="center">
          Forces
        </Typography>
        {!organizations.length && <p>{"No forces found..."}</p>}
        <div className="two-columns">
          {organizations.map((org, index) => {
            const orgSlots = data.getOrganizationSlotsRaw(org);
            const cost = org.cost;
            return (
              <Card
                key={index}
                className="no-break"
                sx={{
                  border: `2px solid ${factionColor}`,
                  mb: 2,
                }}
              >
                <CardHeader
                  sx={{ backgroundColor: factionColor, color: textColor, p: 1 }}
                  title={
                    <Typography variant="h5" component="div" align="center">
                      {org.name} {!!cost && <small style={{ fontSize: '1rem'}}>{`(${cost})`}</small>}
                    </Typography>
                  }
                />
                <CardContent style={{ padding: 0 }}>
                  <Typography component="div" align="center" sx={{ p: 2 }}>
                    {org.description}
                  </Typography>
                  <Table size="small" aria-label="simple table">
                    <TableBody>
                      {orgSlots.map((category, index) => {
                        const categoryData = data.getCategory(category);
                        const organizationData = data.getOrganizationCategory(
                          org,
                          category
                        );
                        return (
                          <StyledTableRow key={index}>
                            <TableCell style={{ paddingLeft: '10px' }}>{categoryData.name}</TableCell>
                            <TableCell align="right" style={{ paddingRight: '10px' }}>
                              {`${organizationData.min || 0}-${
                                organizationData.max || 0
                              }`}
                            </TableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};
