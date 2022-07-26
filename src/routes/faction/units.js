import { Box, Pagination, Typography } from '@mui/material';
import { UnitCard } from 'components/roster/unit-card';
import { findIndex, get, groupBy, intersection, omit, sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import './roster.css';

export const Units = React.memo((props) => {
  const { data, faction, nameFilter, unitFilter, filterByFocus=true, subfactionId="none", userPrefs } = props;
  const [pinnedUnits, setPinnedUnits] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 15;
  const categories = { pinned_units: {name: "Pinned Units"}, ...data.getRawCategories()};
  const unitsUn = data.getUnits(faction);
  const unitsFiltered = unitsUn.filter(unit => nameFilter ? get(unit, 'name', '').toLowerCase().includes(nameFilter.toLowerCase()) : true)
  .filter((unit) => {
    return unitFilter.keywords && unitFilter.keywords.size ? intersection(Array.from(unitFilter.keywords), (unit.keywords || [])).length === unitFilter.keywords.size : true;
  })
  .filter((unit) => {
    return unitFilter.categories && unitFilter.categories.size ? unitFilter.categories.has(unit.category) : true;
  });
  const numPages = Math.ceil(unitsFiltered.length / PAGE_SIZE);
  const sortOrder = ['pinned_units', ...Object.keys(categories)];
  const unitsSorted = sortBy(unitsFiltered, (unit) => data.getUnitPoints(unit, faction));
  const units = unitsSorted.sort((first, second) => {
    const firstIndex = findIndex(sortOrder, (o) => o === first.category);
    const secondIndex = findIndex(sortOrder, (o) => o === second.category);
    return firstIndex - secondIndex;
  }).slice(currentPage * PAGE_SIZE, (currentPage * PAGE_SIZE) + PAGE_SIZE);
  useEffect(() => {
    setCurrentPage(0);
  }, [unitsFiltered.length]);
  const unitCategories = { pinned_units: [], ...groupBy(units, "category")};
  const categoryOrder = ['pinned_units', ...Object.keys(categories), undefined].filter((cat) => unitCategories[cat] && unitCategories[cat].filter((unit) => !pinnedUnits[unit.id]).length);
  const handlePinUnit = (unit) => {
    const unitId = unit.id;
    if (pinnedUnits[unitId]) {
      setPinnedUnits({
        ...omit(pinnedUnits, unitId),
      });
    } else {
      setPinnedUnits({
        ...pinnedUnits,
        [unitId]: unit
      });
    }
  }
  const scrollWithOffset = () => {
    const yCoordinate = 0;
    const yOffset = 0; 
    window.scrollTo({ top: yCoordinate + yOffset });
  }
  const changePage = (event, number) => {
    scrollWithOffset();
    setCurrentPage(number - 1);
  }
  return (
    <div>
      {!units.length && <p>{'No units found...'}</p>}
      {categoryOrder.map((category, catIndex) => {
        const categoryUnits = get(unitCategories, `[${category}]`, []).filter((unit) => !pinnedUnits[unit.id]);
        const categoryData = data.getCategory(category);
        return (
          <div key={catIndex}>
            <Typography sx={{ my: 2 }} variant="h4" component="div" align="center">
              {categoryData.name || "No Category"}
            </Typography>
            {categoryUnits.map((unit, index) => {
              return (
                <div
                  key={index}
                >
                  <Box
                    className="unit-card-wrapper"
                    sx={{ mb: 2 }}
                  >
                    <UnitCard
                      showContext
                      faction={faction}
                      subfactionId={subfactionId}
                      focusView={filterByFocus}
                      data={data}
                      userPrefs={userPrefs}
                      unit={unit}
                      onPinUnit={handlePinUnit}
                      pinned={!!pinnedUnits[unit.id]}
                    />
                  </Box>
                </div>
              );
            })}
          </div>
        );
      })}
      {numPages > 1 && <Box sx={{ mx: 'auto', display: 'flex', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Pagination count={numPages} page={currentPage + 1} onChange={changePage} />
      </Box>}
    </div>
  );
});