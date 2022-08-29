var loadingTAbWait = '<div id="medloading" class="ziploading">';   
loadingTAbWait += '<div class="loading-cov">';
 loadingTAbWait += '<div class="procase">';           
 loadingTAbWait += '<div class="medline-logo"><img alt="branding logo" src="../../Content/UIAssets/images/logo/Medline-logo-dark.png" class="brand-logo"></div>';                 
 loadingTAbWait += '<div class="processingbar"><span class="proc-img"><img src="../../Content/UIAssets/images/ajax-loader.gif"></span><span class="proc-text">Please wait...</span></div>'
 loadingTAbWait += '</div></div></div>';
                    
 var wait = loadingTAbWait;
var isCompaeMode = false;
var tabs = [
  { paneId: 'header', title: 'Header', content: '<div id="headerDTab">' + wait + '</div>', active: true, disabled: false },
  { paneId: 'text', title: 'Text', content: '<div id="textDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'project', title: 'Project', content: '<div id="projectDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'supplyChain', title: 'Supply Chain', content: '<div id="supplyChainDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'references', title: 'References', content: '<div id="referencesDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'customs', title: 'Customs', content: '<div id="customsDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'logistics', title: 'Logistics', content: '<div id="logisticsDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'costing', title: 'Costing', content: '<div id="costingDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'qaRa', title: 'QA/RA', content: '<div id="qaRaDTab">' + wait + '</div>', active: false, disabled: false },
 // { paneId: 'media', title: 'Media', content: '<div id="mediaDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'classification', title: 'Classification', content: '<div id="classificationDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'attributes', title: 'Attributes', content: '<div id="attributesDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'orderingInformation', title: 'Ordering Information', content: '<div id="orderingInformationDTab">' + wait + '</div>', active: false, disabled: false },
  //{ paneId: 'preview', title: 'Preview', content: '<div id="previewDTab">' + wait + '</div>', active: false, disabled: false },
  //{ paneId: 'translation', title: 'Translation', content: '<div id="translationDTab">' + wait + '</div>', active: false, disabled: false },
  //{ paneId: 'allTexts', title: 'All texts', content: '<div id="allTextsDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'qualityStatus', title: 'Quality Status', content: '<div id="qualityStatusDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'changeInformation', title: 'Change Information', content: '<div id="changeInformationDTab">' + wait + '</div>', active: false, disabled: false },
  { paneId: 'packagingWaste', title: 'Packaging Waste', content: '<div id="packagingWasteDTab">' + wait + '</div>', active: false, disabled: false }
],
//lastTabId = 18,
lastTabId = 14,
currentTab = '';

function activateItemTab() {
    $('.tabs-inside-here').scrollingTabs({
        tabs: tabs, // required,
        propPaneId: 'paneId', // optional - pass in default value for demo purposes
        propTitle: 'title', // optional - pass in default value for demo purposes
        propActive: 'active', // optional - pass in default value for demo purposes
        propDisabled: 'disabled', // optional - pass in default value for demo purposes
        propContent: 'content', // optional - pass in default value for demo purposes
        scrollToTabEdge: false, // optional - pass in default value for demo purposes
        disableScrollArrowsOnFullyScrolled: false, // optional- pass in default value for demo purposes
        tabClickHandler: function (e) {
            if (isCompaeMode == false) {
                ItemTabClick(this);
            }
            else {
                CompareItemTabClick(this);
            }
        }
    });
    if (currentTab == '') {
        tabs[4].disabled = false;
        tabs[6].disabled = false;
        tabs[9].disabled = false;
        tabs[10].disabled = false;
        tabs[12].disabled = false;
        $('.tabs-inside-here').scrollingTabs('refresh');
        currentTab = '#header';
        $.ajax({
            url: '/Catalog/ItemHeader',
            contentType: "application/json; charset=utf-8",
            data: { itemCode: $("#ItemNameVal").text()},
            success: function (res) {
                $("#headerDTab").html(res);
            }
        });
    }

    $('.btn-add-tab').click(addTab);
    $('.btn-remove-tab').click(removeTab);
    $('.btn-update-tab').click(updateTab);
    $('.btn-move-tab').click(moveTab);
}
function ResetTabs() {
    currentTab = '';
    isCompaeMode = false;
    $('.modal-body .tab-content').removeClass('item-compare');
    $('#ItemNameVal').text(defaultItemName);
    $("#itemdetails").empty();
    CreateItemList(defaultItemName);
    $("#multiselect-list").multiselect({
        onChange: function (option, checked, select) {
            var selectedOptions = $("#multiselect-list").val()
            if (selectedOptions != null)
                if (selectedOptions.length >= 4) {
                    var nonSelectedOptions = $('#multiselect-list option').filter(function () {
                        return !$(this).is(':selected');
                    });
                    nonSelectedOptions.each(function () {
                        var input = $('input[value="' + $(this).val() + '"]');
                        input.prop('disabled', true);
                        input.parent('li').addClass('disabled');
                    });
                    alert('You can select upto 4 options only', 'info');
                }
                else {
                    $('#multiselect-list option').each(function () {
                        var input = $('input[value="' + $(this).val() + '"]');
                        input.prop('disabled', false);
                        input.parent('li').addClass('disabled');
                    });
                }
            MultiselectItem();
        }
    });
   // tabs[0].active = true;
    tabs[4].disabled = false;
    tabs[6].disabled = false;
    tabs[9].disabled = false;
    tabs[10].disabled = false;
    tabs[12].disabled = false;
    $('.tabs-inside-here').scrollingTabs('refresh');
    activateItemTab();
        //$('.tabs-inside-here').scrollingTabs('refresh', {
    //    forceActiveTab: true
    //});
}

function clearAllTabContant() {
    $("#headerDTab").html(wait);
    $("#textDTab").html(wait);
    $("#projectDTab").html(wait);
    $("#supplyChainDTab").html(wait);
    $("#referencesDTab").html(wait);
    $("#customsDTab").html(wait);
    $("#logisticsDTab").html(wait);
    $("#costingDTab").html(wait);
    $("#qaRaDTab").html(wait);
    $("#mediaDTab").html(wait);
    $("#classificationDTab").html(wait);
    $("#attributesDTab").html(wait);
    $("#orderingInformationDTab").html(wait);
    $("#previewDTab").html(wait);
    $("#translationDTab").html(wait);
    $("#allTextsDTab").html(wait);
    $("#qualityStatusDTab").html(wait);
    $("#changeInformationDTab").html(wait);
    $("#packagingWasteDTab").html(wait);
}

function CompareTabs() {
    isCompaeMode = true;
    tabs[0].active = true
    for (var i = 1; i < 14;i++)
        tabs[i].active = false;
    tabs[4].disabled = true;
    tabs[6].disabled = true;
    tabs[9].disabled = true;
    tabs[10].disabled = true;
    tabs[12].disabled = true;
    $('.tabs-inside-here').scrollingTabs('refresh', {
        forceActiveTab: true // make our new tab active
    });
    clearAllTabContant();
    currentTab = '#header'
    CompareItemTabClick();
  
}

function ItemTabClick(e) {
    isCompaeMode = false;
    if (e != null) {
        currentTab = e.hash;
    }
    if (currentTab == "#header") {
        if ($('#headerDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemHeader',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#headerDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#text") {
        if ($('#textDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemText',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#textDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#project") {
        if ($('#projectDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemProject',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#projectDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#customs") {
        if ($('#customsDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemCustoms',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#customsDTab").html(res);
                }
            });
        }
    }
    if (currentTab == "#supplyChain") {
        if ($('#supplyChainDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemSupplyChain',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#supplyChainDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#logistics") {
        if ($('#logisticsDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemLogistics',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#logisticsDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#references") {
        if ($('#referencesDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemReferences',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#referencesDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#costing") {
        if ($('#costingDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemCosting',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#costingDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#qaRa") {
        if ($('#qaRaDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemQA_RA',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#qaRaDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#orderingInformation") {
        if ($('#orderingInformationDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemOrderingInformation',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#orderingInformationDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#changeInformation") {
        if ($('#changeInformationDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemChangeInformation',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#changeInformationDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#packagingWaste") {
        if ($('#packagingWasteDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemPackagingWaste',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text()},
                success: function (res) {
                    $("#packagingWasteDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#qualityStatus") {
        if ($('#qualityStatusDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemQualityStatus',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#qualityStatusDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#attributes") {
        if ($('#attributesDTab').children()[0].className == "ziploading") {
            $.ajax({
                url: '/Catalog/ItemAttributes',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#attributesDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
    }
    if (currentTab == "#classification") {
        $.ajax({
            url: '/Catalog/ItemClassification',
            contentType: "application/json; charset=utf-8",
            data: { itemCode: $("#ItemNameVal").text() },
            success: function (res) {
                $("#classificationDTab").html(res);
            },
            error(jqXHR, exception) {
                alert('Error');
            }
        });
    }
}

function CompareItemTabClick(e) {
    isCompaeMode = true;
    $('.modal-body .tab-content').addClass('item-compare');
    if (e != null) {
        currentTab = e.hash;
    }
    var itemList = String($('#multiselect-list').val());
    if (itemList.indexOf(",") != -1) {

        if (currentTab == "#text") {
            if ($('#textDTab').children()[0].className == "ziploading") {
                $.ajax({
                    url: '/Catalog/CompareText',
                    contentType: "application/json; charset=utf-8",
                    data: { itemCode: itemList },
                    success: function (res) {
                        $("#textDTab").html(res);
                    },
                    error(jqXHR, exception) {
                        alert('Error');
                    }
                });
            }
        }
        if (currentTab == "#customs") {
            if ($('#customsDTab').children()[0].className == "ziploading") {
                $.ajax({
                    url: '/Catalog/CompareCustoms',
                    contentType: "application/json; charset=utf-8",
                    data: { itemCode: itemList },
                    success: function (res) {
                        $("#customsDTab").html(res);
                    },
                    error(jqXHR, exception) {
                        alert('Error');
                    }
                });
            }
        }
        if (currentTab == "#supplyChain") {
            if ($('#supplyChainDTab').children()[0].className == "ziploading") {
                $.ajax({
                    url: '/Catalog/CompareSupplyChain',
                    contentType: "application/json; charset=utf-8",
                    data: { itemCode: itemList },
                    success: function (res) {
                        $("#supplyChainDTab").html(res);
                    },
                    error(jqXHR, exception) {
                        alert('Error');
                    }
                });
            }
        }
        if (currentTab == "#header") {
            $.ajax({
                url: '/Catalog/CompareHeader',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: itemList },
                success: function (res) {
                    $("#headerDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#project") {
            $.ajax({
                url: '/Catalog/CompareProject',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: itemList },
                success: function (res) {
                    $("#projectDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#qaRa") {
            $.ajax({
                url: '/Catalog/CompareQA_RA',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: itemList },
                success: function (res) {
                    $("#qaRaDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#costing") {
            $.ajax({
                url: '/Catalog/CompareCosting',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#costingDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#orderingInformation") {
            $.ajax({
                url: '/Catalog/CompareOrderingInformation',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#orderingInformationDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#changeInformation") {
            $.ajax({
                url: '/Catalog/CompareChangeInformation',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#changeInformationDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#packagingWaste") {
            $.ajax({
                url: '/Catalog/ComparePackagingWaste',
                contentType: "application/json; charset=utf-8",
                data: { itemCode: $("#ItemNameVal").text() },
                success: function (res) {
                    $("#packagingWasteDTab").html(res);
                },
                error(jqXHR, exception) {
                    alert('Error');
                }
            });
        }
        if (currentTab == "#references") {
            var res = "<h5 class='text-danger'>Information of References Tab Is not structured, hence we can't compare this tab. </h5>"
            $("#referencesDTab").html(res);
        }
        if (currentTab == "#logistics") {
            var res = "<h5 class='text-danger'>Information of Logistics Tab Is not structured, hence we can't compare this tab. </h5>"
            $("#logisticsDTab").html(res);
        }
        if (currentTab == "#attributes") {
            var res = "<h5 class='text-danger'>Information of Attributes Tab Is not structured, hence we can't compare this tab. </h5>"
            $("#attributesDTab").html(res);
        }
        if (currentTab == "#qualityStatus") {
            var res = "<h5 class='text-danger'>Information of Quality Status Tab Is not structured, hence we can't compare this tab. </h5>"
            $("#qualityStatusDTab").html(res);
        }
        if (currentTab == "#classification") {
            var res = "<h5 class='text-danger'>Information of Classification Tab Is not structured, hence we can't compare this tab. </h5>"
            $("#classificationDTab").html(res);
        }
    }
    else {
        alert("Please select atleast 2 Item");
        ResetTabs();
    }
}

function updateTab() {
    console.log("update " + tabs[1].title);
    tabs[1].title = 'UPDATED ' + tabs[1].title;
    tabs[1].content = 'UPDATED ' + tabs[1].content;
    $('.tabs-inside-here').scrollingTabs('refresh');
}

function moveTab() {
    console.log("move " + tabs[1].title + " to after " + tabs[4].title + ", move " + tabs[9].title + " to before " + tabs[6].title);
    tabs.splice(4, 0, tabs.splice(1, 1)[0]); // move 1 to right after 4
    tabs.splice(6, 0, tabs.splice(9, 1)[0]); // move 9 to right before 6
    $('.tabs-inside-here').scrollingTabs('refresh');
}

function addTab() {
    var newTab = {
        paneId: 'tab' + (++lastTabId),
        title: 'Tab Index ' + lastTabId,
        content: 'Tab Index ' + lastTabId + ' Content',
        active: true,
        disabled: false
    };
    console.log("append new tab ", newTab.title);
    // deactivate currently active tab
    tabs.some(function (tab) {
        if (tab.active) {
            tab.active = false;
            return true; // exit loop
        }
    });
    tabs.push(newTab);
    $('.tabs-inside-here').scrollingTabs('refresh', {
        forceActiveTab: true // make our new tab active
    });
}

function removeTab() {
    console.log("remove tab ", tabs[2].title);
    tabs.splice(2, 1);
    $('.tabs-inside-here').scrollingTabs('refresh');
}

