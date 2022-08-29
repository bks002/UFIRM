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
  // token = window.sessionStorage.getItem("userinfo_key");
  let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdG5hbWUiOiJTYW5qYXkgSyIsImxhc3RuYW1lIjoiVmlzaHdha2FybWEiLCJpbmZvX3QiOiIzaUVleCtRYzAxcUZMSUl1N1BEVUxuWFhuV2xTWElsV0RyZm9ISlFzZlJleHdrWlNtS09GMDhLQTEzeDZhOUoxMlphQW84Y0l4aitTeW1tVngyRTRTSUwxTFZnME04L05maExyQ0N4eWpyU20wRWs3TnFiaHp4cHYvcSt1anF0NDNCNW5FRm9EOXJxcFhocmI1Y3NmMzFzQ20xVnBIOXV4VUsxUnltS0g4K016am5USURMN09RUDVrUGQ2MEpuUENmbWJjTm1YVmMyNVNQa0JuTFlRdTBxYkQ1b0F0N0ozbzI5SHE5TFo0WGd4QisxdytJRG56ZTFOT091TWVDR0doZkxXbk9TNWN2cFJsRjN1WDF0V0huV0ozclBsZnh0Zjl4OWhzODBEc1lFY0p4dXBpdDF6R1BRWk9nNVo1VEpXSkNXQU5IL3NGRW5qcHV1MUVIWHIvNkE9PSIsIm5iZiI6MTY1MzE0NTU4NiwiZXhwIjoxNjg0NjgxNTg2LCJpYXQiOjE2NTMxNDU1ODZ9.n5chCqZ2cDhfxIyftleZ693jKc4s6mf18l1BZFEGBHw';

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
