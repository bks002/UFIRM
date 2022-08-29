const ApiConstants = {

    forecast: {
      checkCRMConnection: {
        apiConfig: {
          url: 'http://klevdevsrcap1:99/api/CRMForecasting/CheckCRMConnection',
          method: 'GET',
        },
        attachPrefix: false,
      },
      fetchForecast: {
        apiConfig: {
          url: '/forecast',
          method: 'GET',
        },
        attachPrefix: true,
      },
      fetchDistributionProfile: {
        apiConfig: {
          url: '/api/DistributionProfile/GetAllDistributionProfile',
          method: 'GET',
        },
        attachPrefix: true,
      },
      fetchOpportunity: {
        apiConfig: {
          url: 'http://klevdevsrcap1:99/api/CRMForecasting/CRMOpportunity',
          method: 'GET',
        },
        urlParams: {
          opportunityId: 'E88B59B7-08C3-E911-A303-0050569365FB',
        },
        attachPrefix: false,
      },
    },
  };
  
  export default ApiConstants;
  