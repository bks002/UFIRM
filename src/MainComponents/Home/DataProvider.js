import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageDashboardCnt(model, type) {
        let url = '';
        switch (type) {
            case 'R':
                url = `Dashboard/Statistic/${model[0].PropertyId}`
                return srv.get(url);
                break;
            default:
        }
    }
}
export default DataProvider;