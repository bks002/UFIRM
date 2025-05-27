import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
     managePropertyTowers(model) {
         let url = '';
         url = `Property/ManagePropertyTower`;
         return srv.CallPostService(url, model[0]);
    }
}
export default DataProvider;