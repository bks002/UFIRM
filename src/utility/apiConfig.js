import { currentApiUrlPrefix } from './environmentConfig';
import ApiConstants from './apiConstants';


// Pure Config to be used by AXIOS

const getAxiosApiConfig = (apiKey) => {
  // eslint-disable-next-line no-bitwise
  if (apiKey && ~apiKey.indexOf('.')) {
    const apiKeyParams = apiKey.split('.');
    if (apiKey && ApiConstants[apiKeyParams[0]] && ApiConstants[apiKeyParams[0]][apiKeyParams[1]]) {
      const currentApi = ApiConstants[apiKeyParams[0]][apiKeyParams[1]];
      const apiConfig = { ...currentApi.apiConfig };
      if (currentApi.attachPrefix) {
        apiConfig.url = currentApiUrlPrefix + apiConfig.url;

      }
      return apiConfig;
    }
  }
  return null;
};


const getConfig = (apiKey) => {
   let token = window.sessionStorage.getItem("userinfo_key");
  // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJUYW55YSIsImxhc3RuYW1lIjoiTWlzaHJhIiwiaW5mb190IjoiM2lFZXgrUWMwMXFGTElJdTdQRFVMbms0dFllNXdkNHc0ZU5saW44bHQwaTNRRHNZdkF5THBTMHBIRWkxTTFDenN5eVRLL3h5U0dUUW5NT0VtYmRkZWc3ZVVYeFUwTFZsRE00dVAwRElGb0UyTEIwMjAyeGw0WkhlS1JuT2VtK3VsZDhFZ2JMTC9GSjU4MFBMVFgveDI0Ly9GWWt3dzlwbWszK21MVXZicGNUaGh1THJLQWxpbU9qSjlQMklOUVVRSE9zTU9rOWZKcnZaQ0VnUExPblNqWjVtZ1MzNklZUGVzcTQrMDNPZzVhY2oyem1QN0R4clloTmVYNGtNMVJHZ3VWdWtPTmZUejQ4aENNOFpJcWRVMUE9PSIsIm5iZiI6MTY4NDczNjYzOSwiZXhwIjoxNzE2MzU5MDM5LCJpYXQiOjE2ODQ3MzY2Mzl9.JJwXBDngk7dfbs1kMqxbotgHj7uN0AN32m2Qe57RtAA'
  let config = {};
  // eslint-disable-next-line no-bitwise
  if (apiKey && ~apiKey.indexOf('.')) {
    const apiKeyParams = apiKey.split('.');
    if (apiKeyParams.length && ApiConstants[apiKeyParams[0]]
      && ApiConstants[apiKeyParams[0]][apiKeyParams[1]]) {
      const currentApi = ApiConstants[apiKeyParams[0]][apiKeyParams[1]];
      config = { ...currentApi.config };
      config = config || {};
      // TOKEN
      //
      config.headers = { 'Authorization': `Bearer ${token}` }
      config.apiKey = apiKey;
    }
  }
  return config;
};

export {
  getAxiosApiConfig,
  getConfig,
};
