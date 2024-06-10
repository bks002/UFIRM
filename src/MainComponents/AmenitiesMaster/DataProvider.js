import ServiceProvider from '../../Common/ServiceProvider.js';
let srv = new ServiceProvider();
class DataProvider {
    manageAmenities(model,type) {
        //
        let url = '';
        switch (type) {
            case 'U':
                url = `Master/AmentiesMaster/Save`;
                return srv.CallPostService(url, model[0]);
            case 'D':
                url = `MAster/AmentiesMaster/Delete/${model[0].amenityId}`
                return srv.CallPostService(url);
            case 'R':
                url = `Master/AmentiesMaster`;
                return srv.CallGetService(url); 
            // case 'T':
            //     url = `Master/AmentiesMaster`;
            //     return srv.CallPostService(url, model[0]);
            //     break;        
            default:
        }
    }

}
export default DataProvider;