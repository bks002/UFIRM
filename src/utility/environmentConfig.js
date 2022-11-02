
/* Environments */
const environments = {
  DEV: 'DEV',
  TEST: 'TEST',

};

// console.log('process.env.NODE_ENV', process.env.NODE_ENV);
// eslint-disable-next-line import/no-mutable-exports
let currentEnvironment;

if (process.env.NODE_ENV === 'development') {
  currentEnvironment = environments.DEV;
}
else {
  currentEnvironment = environments.TEST;
}


/* URL Prefixes */
const apiUrlPrefixes = {

  [environments.DEV]: 'https://admin-api.urest.in/api/',
  [environments.TEST]: 'https://admin-api.urest.in//api/'

  //[environments.DEV]: 'https://localhost:62058/api/',
  //[environments.TEST]: 'https://localhost:62058/api/'
};

const currentApiUrlPrefix = apiUrlPrefixes[currentEnvironment];

/* Exports */
export {
  environments, currentEnvironment, apiUrlPrefixes, currentApiUrlPrefix,
};
