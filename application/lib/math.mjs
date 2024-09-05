export const convertDegToRadians = (deg) => deg * Math.PI / 180

export const convertRadiansToDeg = (rad) => rad * 180 / Math.PI

export const cos = (value, unit = 'deg') => {
  if (unit === 'deg') return Math.cos(convertDegToRadians(value));
  if (unit === 'radians') return Math.cos(value);
} 

export const sin = (value, unit = 'deg') => {
  if (unit === 'deg') return Math.sin(convertDegToRadians(value));
  if (unit === 'radians') return Math.sin(value);
};


