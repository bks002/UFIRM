// Validation 
import * as appCommon from '../Common/AppCommon';
import * as validationProvider from '../Common/Validation/ValidationProvider.js';
import * as validationCommon from '../Common/Validation/ValidationCommon.js';
//end

//const validationCommon = new ValidateCommon();//
// const appCommon = new AppCommon();
//const validationProvider = new ValidationProvider();

const DepartmentValidators = [
    { Id: 'txtDepartmentName', IsMandatory: true, MaxLength: '100', LabelMessage: 'Department', Type: "TextBox" },
    { Id: 'txtDescription', IsMandatory: false, MaxLength: '400', LabelMessage: 'Description', Type: "TextBox" },
];

export default class DepartmentBL {
    CreateValidator = () => {
        validationProvider.InitializeValidation(DepartmentValidators);
    }

    ValidateControls = () => {
        //let error = '';
        return validationCommon.ValidateControl(DepartmentValidators);

    }


}


