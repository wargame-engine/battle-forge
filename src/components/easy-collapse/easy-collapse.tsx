import React from 'react';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';

type props = {
  children: any
}

export const EasyCollapse = (props: props) => {
  const { children } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  }
  return (
    <>
      {!isOpen && <Button fullWidth onClick={handleToggle}>More</Button>}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
      {!!isOpen && <Button fullWidth onClick={handleToggle}>Less</Button>}
    </>
  );
};
