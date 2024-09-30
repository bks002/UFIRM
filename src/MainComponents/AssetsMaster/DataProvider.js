import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {       
    manageDocumentTypeMaster(model,type) {
        let url = '';
        switch (type) {
            case 'I':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);
 
            case 'U':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);

            case 'D':
                url = `ManageAssets`;
                return srv.CallPostNewService(url, model[0]);

            case 'R':
                url = `GetAssets?propertyId=${model[0].propertyId}`;
                return srv.CallGetNewService(url);   
      
            default:
        }
    }   
}
export default DataProvider;