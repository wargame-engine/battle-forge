import React from 'react';
import PropTypes from 'prop-types';
import { Code } from '../styles/style';
import Container from '@mui/material/Container';

const propTypes = {
  location: PropTypes.object.isRequired,
};

export default function PageNotFound({ location }) {
  return (
    <Container>
      <p className="text-center">
        Page not found - the path, <Code>{location.pathname}</Code>,
        did not match any React Router routes.
      </p>
    </Container>
  );
}

PageNotFound.propTypes = propTypes;
