export function round5(x) {
  return (x % 5) >= 2.5 ? parseInt(x / 5) * 5 + 5 : parseInt(x / 5) * 5;
}

export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomItems(arr, numItems) { 
  return arr.sort(() => 0.5 - Math.random()).slice(0, numItems);
}

export function roundBias(number) {
  return (number >= 0 || -1) * Math.round(Math.abs(number));
}

export function romanize(num) {
  if (isNaN(num))
    return NaN;
  var digits = String(+num).split(""),
    key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
      "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
      "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
    roman = "",
    i = 3;
  while (i--)
    roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}