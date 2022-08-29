import ServiceProvider from "../Common/ServiceProvider.js";
import { debug } from "util";
let srv = new ServiceProvider();
class ApiDataProvider {
    getcustomeraccounts(type, searchvalue) {
        alert("customer account");
        let url = `Connection/CustomerAccounts?AccountType=${type}&SearchValue=${searchvalue}`;
        return new ServiceProvider().get(url);
    }

    downloadConnectionTemplate() {
        alert("Download Tempalte");
        let url = 'Connection/DownlaodAccountsSample';
        return new ServiceProvider().get(url);
    }

    getPriceListByUserId(inputParam) {
        let url = `PriceUpload/GetPriceListByUserID?UserId=${inputParam[0].UserId}&FilterType=${inputParam[0].FilterType}&SearchValue=${inputParam[0].SearchValue}&PageSize=${inputParam[0].PageSize}&PageNumber=${inputParam[0].PageNumber}&CallType=${inputParam[0].callType}`;
        let data = new ServiceProvider().get(url);
        return data;
    }
    getPriceListBrowse(userId, showfuture, showexpired, showDeactivated , showActive, callType) {
      
        let url = `PriceUpload/GetPriceListByUserID?UserId=${userId}&showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}&ShowActive=${showActive}&CallType=${callType}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getAuditLog(type, priceListId) {
        let url = `PricingCommon/GetAuditlog?type=${type}&referenceId=${priceListId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getPriceByPriceListId(priceListId) {
        let url = `PriceUpload/GetPriceByPriceListId?priceListId=${priceListId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getUploadedFileStatusByFileLogId(fileLogId) {
        let url = `PriceUpload/GetFileLogsFromIDs?fileLogIDs=${fileLogId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getFileUploadLogsByRefId(refId) {
        let url = `PriceUpload/GetFileUploadLogsByRefId?refId=${refId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getPriceListDetailById(priceListId) {
        let url = `PriceUpload/GetPriceListDetailById?priceListId=${priceListId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getPriceByUserId(userID, accountId, Item, showfuture, showexpired, showDeactivated) {
        let url = `PriceUpload/GetPriceByUserId?userId=${userID}&Account=${accountId}&Item=${Item}&showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    getPriseBrowseList(userID, accountId, Item,removeCommas, showfuture, showexpired, showDeactivated,PageSize,PageNumber,showActive) {
        let url = `PriceUpload/GetPriseBrowseList?userId=${userID}&Account=${accountId}&Item=${Item}&removeCommas=${removeCommas}
        &showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}&PageSize=${PageSize}&PageNumber=${PageNumber}&showActive=${showActive}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    saveUploadedPriceListDocuments(saveUpload) {
        let url = `PriceUpload/SaveUploadedPriceListDocuments`;
        let result = new ServiceProvider().CallPostService(url, saveUpload);

        return result;
    }

    viewUploadedFileErrorLog(fileId) {
        let url = `PriceUpload/GetUploadFileLogDetail?fileId=${fileId}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    deactivatePriceListByPriceListId(PriceListId, Justification) {
        let url = `PriceUpload/DeactivatePriceListByPriceListId?PriceListId=${Number(PriceListId)}&Justification=${Justification}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    activatePriceListByPriceListId(PriceListId) {
        let url = `PriceUpload/ActivatePriceListByPriceListId?PriceListId=${Number(PriceListId)}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }


    deactivatePriceByPriceIDs(PriceIDs, Justification) {
        let url = `PriceUpload/DeactivatePriceByPriceIDs?PriceIDs=${PriceIDs}&Justification=${Justification}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    saveUploadedAndProcessPriceListDocuments(saveUpload) {
        let url = `PriceUpload/SaveAndProcessUploadedPriceListDocuments`;
        let result = new ServiceProvider().CallPostService(url, saveUpload);
        return result;
    }

    getcurrency(code, column) {
        let url = "";
        if (column != "") {
            url = `PricingCommon/Currency?code=${code}&$select=${column}`;
        }
        else {
            url = `PricingCommon/Currency?code=${code}`;
        }
        let data = new ServiceProvider().get(url);
        return data;
    }
    // Create price manually
    CreatePriceManually(pricelistcollection) {
        let url = `PriceUpload/CreatePriceCollection`;
        return srv.CallPostService(url, pricelistcollection[0]);

    }

    AddItemPriceInPriceList(pricelistcollection) {
        let url = `PriceUpload/CreatePrice`;
        return srv.CallPostService(url, pricelistcollection[0]);

    }

    CreatePriceListDownloadFile(userid, Filetype,showfuture,showexpired,showDeactivated,showActive,calltype) {
        let url = `/PriceUpload/DownloadPriceListManagementFile?userId=${userid}&Filetype=${Filetype}&isPriceFileUploadPage=false&showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}&showActive=${showActive}&CallType=${calltype}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    CreatePriceBrowseDownloadFile(userid, Filetype, accountId, Item,showfuture,showexpired,showDeactivated, showActive) {
        let url = `/PriceUpload/DownloadPriceBrowseFile?userId=${userid}&Filetype=${Filetype}&Account=${accountId}&Item=${Item}&showexpiredprice=${showexpired}&Showfutureprice=${showfuture}&ShowDeactivated=${showDeactivated}&showActive=${showActive}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    CreatePriceListMgmtDownloadFile(priceListId, Filetype) {
        let url = `/PriceUpload/DownloadPriceListManagementFileByPriceId?priceListId=${priceListId}&Filetype=${Filetype}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    DownloadPriceUploadFile(UserId, FilterType, SearchValue, PageSize, PageNumber,calltype, Filetype) {
        let url = `/PriceUpload/DownloadPriceListManagementFile?UserId=${UserId}&FilterType=${FilterType}&SearchValue=${SearchValue}&PageSize=${PageSize}&PageNumber=${PageNumber}&Filetype=${Filetype}&CallType=${calltype}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }
    // end

    postErrorLog(userId, errorMessage, location, stackTrace) {
        let url = `PricingCommon/PostErrorLog?userId=${userId}&errorMessage=${errorMessage}&location=${location}&stackTrace=${stackTrace}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    deactivateConnectionProfile(ConnectionProfileIDs, Justification, userId) {
        let url = `Connection/DeactivateConnectionProfile?ConnectionProfileIDs=${ConnectionProfileIDs}&Justification=${Justification}&userId=${userId}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    DownloadFileErrorLog(fileId, Filetype) {
        let url = `PriceUpload/DownloadFileErrorLog?fileId=${fileId}&Filetype=${Filetype}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    DownloadConnectionProfileFile(inputParam,Filetype) {
        let url = `/Connection/DownloadConnectionProfileFile?UserId=${inputParam[0].UserId}&FilterType=${inputParam[0].FilterType}&SearchValue=${inputParam[0].SearchValue}&PageSize=${inputParam[0].PageSize}&PageNumber=${inputParam[0].PageNumber}&Filetype=${Filetype}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    DownloadDuplicateCustomerForGPO(DuplicateCustomerList) {
        let url = `Connection/DownloadDuplicateCustomerForGPO`;
        return srv.CallPostService(url, DuplicateCustomerList);
    }

    CheckDuplicatePrice(ItemCode,StartDate,EndDate,AccountNumber) {
        let url = `PriceUpload/CheckDuplicatePrice?accountid=${AccountNumber}&itemid=${ItemCode}&startDate=${StartDate}&enddate=${EndDate}`;
        let data = new ServiceProvider().get(url);
        return data;
    }
    //Sanjay May 8 19
    CheckDuplicatePriceForPriceLock(Accountid,StartDate,EndDate, ItemCollection){
        let url = `PriceUpload/CheckDuplicatePriceForPriceLock?accountid=${Accountid}&startDate=${StartDate}&EndDate=${EndDate}&ItemCollection=${ItemCollection}`;
        let data = new ServiceProvider().CallSynchronouse(url);
        return data;
    }
    
    DownloadDuplicateItemPriceForPriceLock(Accountid,startDate,endDate,ItemCollection)
    {
        let url = `PriceUpload/DownloadDuplicateItemPriceForPriceLock?accountid=${Accountid}&startDate=${startDate}&EndDate=${endDate}&ItemCollection=${ItemCollection}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }

    UpdatePrice(UserId,PriceId,CIGCode)
    {
        let url = `Price/UpdatePrice?UserId=${UserId}&PriceId=${PriceId}&CIGCode=${CIGCode}`;
        let result = new ServiceProvider().PostUsingURL(url);
        return result;
    }
    

}

export default ApiDataProvider;