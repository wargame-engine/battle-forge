import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey as gray,
  blueGrey as blueGray,
} from "@mui/material/colors";
import { camelCase } from 'lodash';

export function getTextColor(rgb) {
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round(((parseInt(rgb.r) * 299) +
    (parseInt(rgb.g) * 587) +
    (parseInt(rgb.b) * 114)) / 1000);
  const textColour = (brightness > 150) ? '#3E3E3E' : 'white';
  return textColour;
}

export function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export const colors = {
  red: {
    id: "red",
    name: "Red",
    import: red,
  },

  pink: {
    id: "pink",
    name: "Pink",
    import: pink,
  },

  purple: {
    id: "purple",
    name: "Purple",
    import: purple,
  },

  deepPurple: {
    id: "deep-purple",
    name: "Deep Purple",
    import: deepPurple,
  },

  indigo: {
    id: "indigo",
    name: "Indigo",
    import: indigo,
  },

  blue: {
    id: "blue",
    name: "Blue",
    import: blue,
  },

  lightBlue: {
    id: "light-blue",
    name: "Light Blue",
    import: lightBlue,
  },

  cyan: {
    id: "cyan",
    name: "Cyan",
    import: cyan,
  },

  teal: {
    id: "teal",
    name: "Teal",
    import: teal,
  },

  green: {
    id: "green",
    name: "Green",
    import: green,
  },

  lightGreen: {
    id: "light-green",
    name: "Light Green",
    import: lightGreen,
  },

  lime: {
    id: "lime",
    name: "Lime",
    import: lime,
  },

  yellow: {
    id: "yellow",
    name: "Yellow",
    import: yellow,
  },

  amber: {
    id: "amber",
    name: "Amber",
    import: amber,
  },

  orange: {
    id: "orange",
    name: "Orange",
    import: orange,
  },

  deepOrange: {
    id: "deep-orange",
    name: "Deep Orange",
    import: deepOrange,
  },

  brown: {
    id: "brown",
    name: "Brown",
    import: brown,
  },

  gray: {
    id: "gray",
    name: "Gray",
    import: gray,
  },

  blueGray: {
    id: "blue-gray",
    name: "Blue Gray",
    import: blueGray,
  },
};

export const getColor = (colorId) => {
  if (!colorId) {
    return null;
  }

  colorId = camelCase(colorId);

  return colors[colorId];
};