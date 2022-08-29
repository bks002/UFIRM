import ServiceProvider from "../ServiceProvider.js";
import { promises } from "fs";

// Glogal declaration
let srv = new ServiceProvider();
// End
class ConnectionDataProvider {

    getconnectionprofile(inputParam) {
        let url = "";
        // if (column != "") {
        //     url = `Connection/ConnectionProfile?UserId=${userid}&$select=${column}&showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}&showActive=${showActive}`;
        // }
        // else {
            url = `Connection/ConnectionProfile?UserId=${inputParam[0].UserId}&FilterType=${inputParam[0].FilterType}&SearchValue=${inputParam[0].SearchValue}&PageSize=${inputParam[0].PageSize}&PageNumber=${inputParam[0].PageNumber}`;
       //}
        return srv.get(url);
        
    }

    getitemconfigurationresult(query) {
           let  url = `Connection/queryresult?Qry=${query}`;
        return srv.get(url);
        
    }
    

    creategrid() {
        $('.ui-tblgrid').DataTable().ajax.reload();
    }

   

    deleteconnectionmember(connectionmemberid, connectionprofileid) {
        let  url =`Connection/DeleteConnection?ConnectionMemberId=${connectionmemberid}&ConnectionProfileId=${connectionprofileid}`;
        return srv.CallPostService(url);
    }

    createnewconnectionprofile(datamodel) {
        let  url =`Connection/CreateConnectionProfile`;
        return srv.CallPostService(url,datamodel[0]);
        
    }
    createnewconnectionmembers(connectionprofileid,accounts) {
        let  url =`Connection/CreateConnectionMember?ConnectionProfileId=${connectionprofileid}&Accounts=${accounts}`;
        return srv.PostUsingURL(url)
    }

    getconnectionmembers(connectionprofileid) {
        let  url =`Connection/ConnectionMember?ConnectionProfileId=${connectionprofileid}`;
        return srv.get(url)
        
    }

    getconnectionauditlog(connectionprofileid) {
        let  url =`PricingCommon/AuditLog/ConnectionAuditLog?Type=C&ConnectionProfileId=${connectionprofileid}`;
        return srv.get(url)
    }
    //Created By: Sanjay {Mar 28 2019}
    validatecustomersingpo(Param) {
        let  url =`Connection/CheckDuplicateCustomerForGPO?StartDate=${Param.StartDate}&EndDate=${Param.EndDate}&Priority=${Param.Priority}&CustomerList=${Param.CustomerList}`;
        return   srv.get(url);
    }
    //Created By: Sanjay {APR 22 2019}
    validatecustomersinpricelock(Param, connectionId,customers) {
        let listofcustomers='';
        customers.map((value, idx) => {
            listofcustomers += `${value.AccountId},`;
        })
        let  url =`Connection/CheckDuplicateCustomerForPriceLock?StartDate=${Param.StartDate}&EndDate=${Param.EndDate}&Priority=${Param.Priority}&CustomerList=${listofcustomers}&Query=${Param.Query}&ConnectionProfileId=${connectionId}`;
        return   srv.get(url)
    }
    //Sanjay May 9 2019
    validateItemPriceForPriceLock(Param,call) {
        let  url =`Connection/CheckPriceItemForPriceLock?StartDate=${Param.StartDate}&EndDate=${Param.EndDate}&Priority=${Param.Priority}&CustomerList=${Param.CustomerList}&Query=${Param.Query}`;
        if(call == 1){
            return   srv.CallSynchronouse(url)
        }
        else{
            return Promise.resolve([]);
        }
        
    }
}
export default ConnectionDataProvider;