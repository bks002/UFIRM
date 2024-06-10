import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    managePropertyMember(model, type) {
        let url = '';
        switch (type) {
            case 'R':
                url = `Property/OwnerResident/ListAll/${model[0].PropertyId}/${model[0].ResidentTypeId}/${model[0].FlatId}/${model[0].IsActive}/${model[0].SearchValue}/${model[0].TabType}/${model[0].PageSize}/${model[0].PageNumber}`;
                return srv.CallGetService(url);
            case 'RT':
                url = `Property/ResidentTypes/${type}`;
                return srv.get(url);
            case 'I':
                url = `Property/ViewPersonalInformation/Save`
                return srv.CallPostService(url, model[0]);
            case 'V':
                url = `Property/ViewPersonalInformation/Save`
                return srv.CallPostService(url, model[0]);
            case 'FD':
                url = `Property/ResidentFlatDetails/${model[0].FlatId}`
                return srv.get(url);
            case 'DLOT':
                url = `Property/OwnerTenant/Delete`
                return srv.CallPostService(url, model[0]);
            default:
        }
    }
}
export default DataProvider;