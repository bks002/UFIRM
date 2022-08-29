import UrlProvider from "../Common/ApiUrlProvider.js";
import Commonjs from '../Common/AppCommon.js';
import ApiDataProvider from "../Common/ApiDataProvider.js";
import swal from "sweetalert";

let apiData = new ApiDataProvider();

let objcommonjs = new Commonjs();

let url = new UrlProvider().MainUrl;

class PriceListBrowseBL {

    ExportData(userid,type) {
         
        objcommonjs.openprogressmodel('File download is in process', 5000);
        apiData.CreatePriceListDownloadFile(userid, type)
            .then(resv => resv.json())
            .then(rData => {
                swal.close();
                window.location = url + `/PricingCommon/DownloadFile?filename=${rData}`;
            })
            .catch(error => {
                console.log(`Error occured during file download`);
            });
    }
  
}
export default PriceListBrowseBL 
 

