import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageEmployee(model,type) {
        let url = '';
        switch (type) {
            case 'C':
                url = `CreateEmployee`;
                return srv.CallPostNewService(url, model[0]);
            case 'U':
                url = `CreateEmployee`;
                return srv.CallPostNewService(url, model[0]);
            case 'D':
                url = `Property/AmentiesAssignment/Delete/${model[0].propertyAmenitiesId}`
                return srv.CallPostService(url);
            case 'R':
                url = `EmployeeList`;
                return srv.getComplaint(url);
                case 'AP':
                    console.log(model);
                url = `KYCApprove?Id=${model[0].Id}`;
                return srv.CallPostNewService(url, model[0]);  
            default:
        }
    }
}
export default DataProvider;