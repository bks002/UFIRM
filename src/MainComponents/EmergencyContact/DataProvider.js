import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEmergencyContact(model,type) {
        //
        let url = '';
        switch (type) {
            case 'U':
                url = `Master/EmergencyContact/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Master/EmergencyContact/Delete/${model[0].emergencyContactId}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Master/EmergencyContact`;
                return srv.CallPostService(url, model[0]);
                break;  
            case 'T':
                url = `Master/EmergencyContact`;
                return srv.CallPostService(url, model[0]);
                break;        
            default:
        }
    }

}
export default DataProvider;