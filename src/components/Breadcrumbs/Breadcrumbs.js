import { Breadcrumbs, Link } from '@mui/material';
import { usePageTitle } from 'hooks';
import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, Route } from 'react-router-dom';
import s from 'styles/style';

function BreadcrumbsItem(props) {
  const { match } = props;
  const path = match.url;
  const title = usePageTitle({ path });
  const to = title === undefined ? '/' : match.url;

  return (
    <>
      {title && <Link style={{ wordBreak: 'break-all' }} component={RouterLink}
        {...s.link}
        to={to}
      >{title}</Link>}
      {!match.isExact && title && ' / '}
      <Route path={`${match.url === '/' ? '' : match.url}/:path`} component={BreadcrumbsItem} />
    </>
  );
}

BreadcrumbsItem.propTypes = {
  match: PropTypes.object.isRequired,
};

const Bread = () => {
  return (
    <Breadcrumbs>
      <Route path="/" component={BreadcrumbsItem} />
    </Breadcrumbs>
  );
};

export default Bread;