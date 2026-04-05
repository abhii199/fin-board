const formatResponse = (success, message, data = null, errors = []) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (errors.length > 0) response.errors = errors;
  return response;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

module.exports = {
  formatResponse,
  asyncHandler,
  pick,
  omit
};
