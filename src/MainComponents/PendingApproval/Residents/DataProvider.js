import ServiceProvider from '../../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageResidents(model, type) {
        // 
        let url = '';
        switch (type) {
            case 'E':
                url = `Property/`;
                return srv.CallPostService(url, model[0]);
                break;
            case 'RL':
                url = `Property/ResidentPendingApprovals/${model[0].StatementType}/${model[0].PropertyId}`;
                return srv.get(url);
                break;
            case 'RT':
                url = `Property/ResidentTypes/${type}`;
                return srv.get(url);
                break;
            default:
        }
    }
}
export default DataProvider;