const environments = {
  DEV: 'DEV',
  TEST: 'TEST',
};

// Determine current environment based on process.env.NODE_ENV
const currentEnvironment =
  process.env.NODE_ENV === 'development'
    ? environments.DEV
    : environments.TEST;

const apiUrlPrefixes = {
  [environments.DEV]: 'https://admin-api.urest.in/api/',
  [environments.TEST]: 'https://admin-api.urest.in//api/',
};

const currentApiUrlPrefix = apiUrlPrefixes[currentEnvironment];

export {
  environments,
  currentEnvironment,
  apiUrlPrefixes,
  currentApiUrlPrefix,
};
