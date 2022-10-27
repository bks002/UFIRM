import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEmployee(model,type) {
        let url = '';
        switch (type) {
            case 'C':
                url = `CreateEmployee`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'U':
                url = `KYCUpate`;
                return srv.CallPostNewService(url, model[0]);
                break;
            case 'D':
                url = `Property/AmentiesAssignment/Delete/${model[0].propertyAmenitiesId}`
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `EmployeeList`;
                return srv.getComplaint(url);
                break; 
                case 'AP':
                    console.log(model);
                url = `KYCApprove?Id=${model[0].Id}`;
                return srv.CallPostNewService(url, model[0]);
                break;       
            default:
        }
    }
}
export default DataProvider;