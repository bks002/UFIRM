import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {       
    manageDocumentTypeMaster(model,type) {
       // 
        let url = '';
        switch (type) {
            case 'U':
                url = `Master/DocumentTypesMaster/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Master/DocumentTypesMaster/Delete/${model[0].documentTypeId}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Master/DocumentTypesMaster`;
                return srv.get(url);   
                break;       
            default:
        }
    }   
}
export default DataProvider;