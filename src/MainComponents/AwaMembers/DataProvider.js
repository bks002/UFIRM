import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageRwaMembers(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'C':
                url = `Property/RwaMember/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'U':
                url = `Property/RwaMember/Save`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'D':
                url = `Property/RwaMember/Delete/${model[0].RwaMemberDetailsId}/${model[0].CmdType}`;
                return srv.CallPostService(url);
                break;
            case 'R':
                url = `Property/RwaMember/List/${model[0].CmdType}/${model[0].PropertyId}/${model[0].IsActive}`;
                return srv.get(url);
                break;
            default:
        }
    }
    getDropDwonData(cmdType, PropertyID, PropertyDetailId) {
        let url = `Property/RwaMemberDropdown/${cmdType}/${PropertyID}/${PropertyDetailId}`
        return srv.get(url);
    }
}
export default DataProvider;