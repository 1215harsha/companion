/**
 * Web stub for react-native-worklets.
 * react-native-reanimated v4 imports this package, but it's native-only.
 * On web there is no separate UI thread — all calls are synchronous JS.
 */
'use strict';

const runOnUISync = (fn) => fn();
const runOnUI = (fn) => (...args) => fn(...args);
const runOnJS = (fn) => (...args) => fn(...args);
const makeMutable = (value) => ({
  value,
  addListener: () => {},
  removeListener: () => {},
  modify: (fn) => { value = fn(value); },
});
const makeShareable = (value) => value;
const makeRemoteFunction = (fn) => fn;
const isWorklet = () => false;
const executeOnUIRuntimeSync = (fn) => fn;

module.exports = {
  runOnUISync,
  runOnUI,
  runOnJS,
  makeMutable,
  makeShareable,
  makeRemoteFunction,
  isWorklet,
  executeOnUIRuntimeSync,
  default: {
    runOnUISync,
    runOnUI,
    runOnJS,
    makeMutable,
    makeShareable,
    makeRemoteFunction,
    isWorklet,
    executeOnUIRuntimeSync,
  },
};
