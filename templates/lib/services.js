/**
 * @fileoverview The services.js file is where your services will go, a loose version of an
 * Angular concept. Service is a broad category encompassing any value, function, or feature
 * that an app needs. A service is typically a class with a narrow, well-defined purpose.
 * It should do something specific and do it well.
 */
import shared from './shared';

/**
 * Pass data to shared object
 * @param {Object} data
 */
export const share = (data) => {
  Object.keys(data).forEach((key) => {
    shared[key] = data[key];
  });
};

/** Standard experiment setup */
export const setup = () => {
  const { ID, VARIATION } = shared;

  // Namespace with body classes for increased CSS specificity
  document.body.classList.add(ID);
  if (VARIATION > 1) document.body.classList.add(`${ID}-${VARIATION}`);
};
