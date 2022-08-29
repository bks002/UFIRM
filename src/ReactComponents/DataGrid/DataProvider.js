import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageDataGrid(model,type) {
        
        let url = `Property/ViewPersonalInformation/Save`;
        return srv.CallPostService(url, model[0]);
    }
}
export default DataProvider;