import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
     savePropertyMemeber(formdata) {
         let url = '';
         url = `Property/PropertyOwner/Save`;
         return srv.CallPostFormData(url, formdata);
    }
}
export default DataProvider;