import React from 'react';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { get, castArray } from 'lodash';

const TocGenerator = (props) => {
  let contentsLinks = [];
  const linkTypes = new Set(['h3', 'h4', 'h5']);
  if (props.children) {
    castArray(props.children).forEach((child) => {
      const type = child.type;
      let to = '';
      const id = get(child, 'props.children');
      if (id && typeof id === 'string') {
        to = id.replace(/\s+/g, '');
      }
      if (linkTypes.has(type)) {
        contentsLinks.push({
          level: type.split('')[1]-3,
          name: `${child.props.children}`,
          to: `#${to}`
        });
      }
    });
  }
  return (
    <div className={props.className}>
      <h3>{"Table of Contents"}</h3>
      <div className="three-columns">
        {contentsLinks.map((link) => (
          <div style={{ marginLeft: `${link.level*15}px` }}>
            <NavLink
              to={link.to}
              activeClassName="selected"
            >
              {link.name}
            </NavLink>
          </div>
        ))}
      </div>
      <hr />
      {castArray(props.children).map((child) => {
        const props = {};
        let to = '';
        const id = get(child, 'props.children');
        if (id && typeof id === 'string') {
          to = id.replace(/\s+/g, '');
        }
        if (linkTypes.has(child.type)) {
          props.id = to;
        }
        if (React.isValidElement(child)) {
          return React.cloneElement(child, props);
        }
        return child;
      })}
    </div>
  );
}

export default TocGenerator;