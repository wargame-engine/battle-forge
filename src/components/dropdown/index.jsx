import React from "react";

export const Dropdown = (props) => {
  const { children, as } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const [anchorElement, setAnchorElement] = React.useState(null);
  const handleClose = () => {
    setIsOpen(false);
    setAnchorElement(null);
  }
  const handleOpen = (event) => {
    setIsOpen(true);
    setAnchorElement(event.currentTarget);
  }
  if (!children || !(typeof children === 'function')) {
    return <></>;
  }
  return (
    <>
      <as onClick={(event) => setIsOpen(true)} />
      {children({
        open: isOpen,
        handleClose,
        handleOpen,
        anchorElement
      })}
    </>
  );
};
