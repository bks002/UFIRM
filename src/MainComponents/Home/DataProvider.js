import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageDashboardCnt(model, type) {
        let url = '';
        switch (type) {
            case 'R':
                url = `Dashboard/Statistic/${model[0].PropertyId}`
                return srv.get(url);
                // break;
            default:
        }
    }
    manageDashTaskStatusCnt(model,initialDate,finalDate)
    {
        let url=`GetAllTaskWiseStatusFinalCountDash?propId=${model[0].PropertyId}&dateFrom=${initialDate}&dateTo=${finalDate}`
        return srv.getComplaint(url);
    }
    manageDashTaskPriorityCnt(model,initialDate,finalDate)
    {
        let url=`GetTaskPriorityCountDash?propId=${model[0].PropertyId}&dateFrom=${initialDate}&dateTo=${finalDate}`
        return srv.getComplaint(url);
    }
}
export default DataProvider;