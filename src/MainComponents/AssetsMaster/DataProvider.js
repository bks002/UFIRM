import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {       
    manageDocumentTypeMaster(model,type) {
        let url = '';
        switch (type) {
            case 'I':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'U':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'R':
                url = `GetAssets`;
                return srv.CallGetNewService(url);   
                break;       
            default:
        }
    }   
}
export default DataProvider;