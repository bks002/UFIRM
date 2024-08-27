import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageManageFlat(model, type) {
        let url = '';
        switch (type) {
            case 'U':
                url = `Property/FlatDetails/Save`;
                return srv.CallPostService(url, model[0]);
            case 'M':
                url = `Property/PropertyMemberByPropertyDetailsID/${model[0].PropertyDetailsId}/${model[0].IsOwner}`;
                return srv.CallGetService(url);
            case 'O':
                url = `Property/PropertyMemberByPropertyDetailsID/${model[0].PropertyDetailsId}/${model[0].IsOwner}`;
                return srv.CallGetService(url);
            case 'R':
                url = `Property/FlatDetails/ListAll/${model[0].PropertyId}/${model[0].SearchValue}/${model[0].PageSize}/${model[0].PageNumber}`;
                return srv.CallGetService(url);
            default:
        }
    }
}
export default DataProvider;