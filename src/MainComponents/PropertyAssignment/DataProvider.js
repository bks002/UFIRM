import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyAssignment(model,type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `Property/PropertyAssignment/Save`;
                return srv.CallPostService(url, model[0]);
            case 'D':
                url = `Property/PropertyAssignment/Delete/${model[0].memberPropertyMappingId}`
                return srv.CallPostService(url);
            case 'R':
                url = `Property/PropertyAssignment`;
                return srv.CallPostService(url, model[0]);    
            default:
        }
    }
    getPropertyFlat(model) {
        let url = `Property/PropertyFlat`
        return srv.CallPostService(url, model[0]);
    }
    
    savePropertyAssignment(formdata) {
        let url = '';
        url = `Property/PropertyAssignment/Save`;
        return srv.CallPostFormData(url, formdata);
   }
}
export default DataProvider;