import React from "react";
import {
    SpreadsheetComponent,
    SheetsDirective,
    SheetDirective,
    RangesDirective,
    RangeDirective,
} from "@syncfusion/ej2-react-spreadsheet";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-grids/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-spreadsheet/styles/material.css";

const PPMCalendarPage = () => {

    return (
        <div className="container mt-4 card">
            <h2 className="mb-3">Excel Viewer & Editor</h2>
            <div>
                <SpreadsheetComponent
                    allowOpen={true}
                    openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open" // Ensure this URL is correct
                    allowSave={true}
                    saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save">
                    <SheetsDirective>
                        <SheetDirective>
                            <RangesDirective>
                                <RangeDirective data={[[{ value: 'Click here to download Excel', href: '/docs/sample_task_list.xlsx' }]]} />
                            </RangesDirective>
                        </SheetDirective>
                    </SheetsDirective>
                </SpreadsheetComponent>
            </div>
        </div>
    );
};

export default PPMCalendarPage;