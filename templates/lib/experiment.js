/**
 * @fileoverview The main experiment logic goes here. Everything should be written inside the
 * activate function which is called if the conditions in triggers.js have passed evaluation
 */
import { setup } from './services';

export default () => {
  setup();

  // Write experiment code here
  console.log('Hello World!');
};
