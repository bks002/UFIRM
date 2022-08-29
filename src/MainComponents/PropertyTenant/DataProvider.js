import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyMember(model, type) {
        let url = '';
        switch (type) {
            case 'TC':
                url = `Property/Tenant/Save`
                return srv.CallPostService(url, model[0]);
            default:
        }
    }
    getEditViewDetails(flatid) {
        let url = `Property/Tenant/EditView/${flatid}`
        return srv.get(url);
    }
    getParkingAssignment(propertyId) {
        let url = `Property/GetParkingDetailVehicle/${propertyId}`
        return srv.get(url);
    }
}
export default DataProvider;