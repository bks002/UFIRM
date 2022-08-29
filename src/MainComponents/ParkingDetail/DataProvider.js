import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
     manageParkingZoneDetails(model) {
         let url = '';
         url = `Property/MangeParingZoneDetails`;
         return srv.CallPostService(url, model[0]);
    }

}
export default DataProvider;