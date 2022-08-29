import ServiceProvider from "../ServiceProvider.js";
let srv = new ServiceProvider();

class StandardPriceAPIDataProvider {
    getStandardPrice(listName, itemCode, date) {
        let url = `StandardPrice/StandardPrice?RequestJson={"PriceListName":"${listName}","Date":"${date}","ItemCode":"${itemCode}"}`;
        let data = srv.get(url);
        return data;
    }

    getStandardPriceList(inputParam) {
        let url = `StandardPrice/StandardPriceList?UserId=${inputParam[0].UserId}&FilterType=${inputParam[0].FilterType}&SearchValue=${inputParam[0].SearchValue}&PageSize=${inputParam[0].PageSize}&PageNumber=${inputParam[0].PageNumber}`;
        let data = srv.get(url);
        return data;
    }

    getStandardPriceListDetailById(standardPriceListID) {
        let url = `StandardPrice/StandardPriceListDetails?StandardPriceListId=${standardPriceListID}`;
        let data = new srv.get(url);
        return data;
    }

    getStandardPriceItemsById(standardPriceListID) {
        let url = `StandardPrice/StandardPriceItemListDetails?StandardPriceListId=${standardPriceListID}`;
        let data = new srv.get(url);
        return data;
    }

    getStandardPriceListName(SearchValue) {
        let url = `StandardPrice/StandardPriceListName?SearchValue=${SearchValue}`;
        let data = new srv.get(url);
        return data;
    }

    deactivateStandardPriceListByPriceListId(PriceListId, UserId) {
        let url = `StandardPrice/DeactivateStandardPriceListByPriceListId?PriceListId=${PriceListId}&UserId=${UserId}`;
        let data = new srv.CallPostService(url);
        return data;
    }

    deactivateStandardPriceByPriceIDs(PriceIDs, UserId) {
        let url = `StandardPrice/DeactivateStandardPriceByPriceIDs?PriceIDs=${PriceIDs}&UserId=${UserId}`;
        let data = new srv.CallPostService(url);
        return data;
    }
    AddItemPriceInStandardPriceList(pricelistcollection) {
        let url = `StandardPrice/CreateStandardPrice`;
        return srv.CallPostService(url, pricelistcollection[0]);
    }

    getCountry(SearchValue) {
        let url = `StandardPrice/CountryDetails?SearchValue=${SearchValue}`;
        let data = new srv.get(url);
        return data;
    }

    getCurrency(SearchValue) {
        let url = `PricingCommon/Currency?code=${SearchValue}`;
        let data = new srv.get(url);
        return data;
    }

    saveStandardPriceList(objStandardPriceList) {
        let url = `StandardPrice/SaveStandardPriceList`;
        let result = new ServiceProvider().CallPostService(url, objStandardPriceList);
        return result;
    }

    DownloadStandardPriceListFile(Param, FileType) {
        let url = `StandardPrice/DownloadStandardPricListFileByUserId?UserId=${Param[0].UserId}&FilterType=${Param[0].FilterType}&SearchValue=${Param[0].SearchValue}&PageSize=${Param[0].PageSize}&PageNumber=${Param[0].PageNumber}&Filetype=${FileType}`;
        return srv.CallPostService(url);
    }
    DownloadStandardPriceListItemsFile(standardPriceListID, FileType) {
        let url = `StandardPrice/DownloadStandardPriceItemListDetails?StandardPriceListId=${standardPriceListID}&Filetype=${FileType}`;
        return srv.CallPostService(url);
    }
    createnewauditlog(type, action, userid, referenceid) {
        let json = { Type: type, Action: action, UserId: userid, ReferenceId: referenceid }
        let url = `StandardPrice/SaveAuditLog`;
        return new ServiceProvider().CallPostService(url, json);
    }
    getAuditLog(type, standardPriceListID) {
        let url = `StandardPrice/AuditLogDetails?type=${type}&referenceId=${standardPriceListID}`;
        let data = new ServiceProvider().get(url);
        return data;
    }

    SaveUploadedStandardPriceListDocuments(standardPriceListId, filesIDs) {
        let url = `StandardPrice/SaveUploadedStandardPriceListDocuments?standardPriceListId=${standardPriceListId}&filesIDs=${filesIDs}`;
        let data = new srv.CallPostService(url);
        return data;
    }

    getStandardPriceFileUploadLogsByRefId(refId) {
        let url = `StandardPrice/GetStandardPriceFileUploadLogsByRefId?refId=${refId}`;
        let data = new srv.get(url);
        return data;
    }

    checkDuplicatePriceListName(StandardPriceListName, StartDate, EndDate) {
        let url = `StandardPrice/CheckDuplicatePriceListName?StandardPriceListName=${StandardPriceListName}&StartDate=${StartDate}&EndDate=${EndDate}`;
        let data = new srv.get(url);
        return data;
    }
}

export default StandardPriceAPIDataProvider;