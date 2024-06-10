import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyMember(model, type) {
        let url = '';
        switch (type) {
            case 'OC':
                url = `Property/Owner/Save`
                return srv.CallPostService(url, model[0]);
            case 'I':
                url = `Property/ViewPersonalInformation/Save`
                return srv.CallPostService(url, model[0]);
            case 'V':
                url = `Property/ViewPersonalInformation/Save`
                return srv.CallPostService(url, model[0]);
            default:
        }
    }

    getEditViewDetails(flatid) {
        let url = `Property/Owner/EditView/${flatid}`
        return srv.get(url);
    }
    getParkingAssignment(propertyId) {
        let url = `Property/GetParkingDetailVehicle/${propertyId}`
        return srv.get(url);
    }
}
export default DataProvider;