/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Generate SQL for Haversine distance calculation
 * Used in MySQL queries for sorting by distance
 */
const getDistanceSQL = (userLat, userLng, latField = 'lat', lngField = 'lng') => {
  return `(
    6371 * acos(
      cos(radians(${userLat})) * 
      cos(radians(${latField})) * 
      cos(radians(${lngField}) - radians(${userLng})) + 
      sin(radians(${userLat})) * 
      sin(radians(${latField}))
    )
  )`;
};

module.exports = {
  calculateDistance,
  getDistanceSQL
};
