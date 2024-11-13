import ServiceProvider from '../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
     getUserAssignedproperty() {
         let url = '';
         url = `Property/UserAssignedProperty`;
     
         return srv.get(url);
    }
    getUserRoles() {
        let url = `Users/UserRole`;
        return srv.get(url);
   }

}
export default DataProvider;