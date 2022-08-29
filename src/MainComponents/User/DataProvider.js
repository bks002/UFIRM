import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {

     saveUser(formdata) {
         let url = '';
         url = `Master/User/Save`;
         return srv.CallPostFormData(url, formdata);
    }

}
export default DataProvider;