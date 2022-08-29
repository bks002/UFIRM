import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    // getEditViewOwnerDetails(flatid) {
    //     let url = `Property/Owner/EditView/${flatid}`
    //     return srv.get(url);
    // }
    getOwnerTenantReadonlyViewDetails(flatId, primaryId, residentTypeId) {
        let url = `Property/OwnerTenant/View/${flatId}/${primaryId}/${residentTypeId}`
        return srv.get(url);
    }

}
export default DataProvider;