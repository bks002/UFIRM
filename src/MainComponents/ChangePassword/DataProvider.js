import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
     changepassword(password, oldpassword) {
         //debugger
         let url = '';
         url = `Master/User/Changepassword/${password}/${oldpassword}`;
         return srv.PostUsingURL(url);
    }
}
export default DataProvider;