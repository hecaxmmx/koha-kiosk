/*!
 * This file is part of Koha Kiosk
 * Copyright 2017 Hector Castro
 * Copyright 2017 Universidad de El Salvador
 * koha Kiosk is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Koha Kiosk is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Koha Kiosk.  If not, see <http://www.gnu.org/licenses/>.
 */

//Remove branches links and tooltips
$( "div.branch-info-tooltip" ).remove();
$( "span.branch-info-tooltip-trigger a").attr( "class", "koha_url" );
$( "[href='/cgi-bin/koha/opac-shelves.pl?op=list&category=1']" ).attr( "class", "koha_url" );
$( "[href='opac-ics.pl']" ).attr( "class", "koha_url" );

//Selectors for elements that sent the outside of domain
let outsideDomainHandleClick = `
    #export,
    #moresearches_menu,
    #opacnav a,
    #other_resources,
    #listsmenu,
    #cartmenulink
    .print-large,
    .koha_url,
    .addtocart,
    .addtoshelf`;

let outsideDomainCSS = `
    #export,
    #moresearches_menu,
    #opacnav a,
    #other_resources,
    #listsmenu,
    #cartmenulink,
    .koha_url,
    .addtocart,
    .addtoshelf,
    .print-large`;

$( outsideDomainHandleClick ).on("click", function(e){
    e.preventDefault;
});

$("#addto").attr("disabled", "disabled");

$( outsideDomainCSS ).css({
    "pointer-events": "none",
    "cursor": "default",
    "color": "grey"
});

$( "#format, #furthersearches" ).css({
    "color": "grey"
});

//Get localization messages
let alert_debarred_heading = browser.i18n.getMessage("snapAlertHeading"),
alert_debarred_content     = browser.i18n.getMessage("snapAlertContent"),
extension_name             = browser.i18n.getMessage("extensionName"),
print_slip_button          = browser.i18n.getMessage("printSlipButton"),
heads_up                   = browser.i18n.getMessage("headsUp"),
sign_off_message           = browser.i18n.getMessage("signOffMessage"),
popover_message            = browser.i18n.getMessage("popoverMessage"),
modal_title                = browser.i18n.getMessage("modalTitle"),
card_number                = browser.i18n.getMessage("cardNumber"),
help_block_input           = browser.i18n.getMessage("helpBlockInput"),
logout_checkbox            = browser.i18n.getMessage("logoutCheckBox"),
print_button               = browser.i18n.getMessage("printButton"),
cancel_button              = browser.i18n.getMessage("cancelButton");

// Test if user is loggedin, If so, present button to print/ckeckout items else show a popover message
if ( $( "span.loggedinusername" ).length ) {
    if ( $( "li#userdebarred" ).length ) {
        browser.runtime.sendMessage({"button": 0});
        let userdebarred = `<button type="button" class="closebtn" data-dismiss="alert">&times;</button>
                           <h4 class="alert-heading">${alert_debarred_heading}</h4>
                           <p>${alert_debarred_content}</p>`;
        $( "div#notesaved" ).append( userdebarred );
        $( "div#notesaved" ).css({ "display": "block" });
        $( "div#notesaved" ).attr( "class", "alert alert-block alert-error fade in" );
    }

    //Get Boolean if true show button else don't show it
    let gettingItem = browser.storage.local.get( "set_button_print" );
    gettingItem.then( ( val ) => {
        if ( val.set_button_print == 1 ) {
            let append_button_print  = `<button class="btn btn-mini button-added" type="button">
                                       ${print_slip_button}</button>`;
            $( ".item-status.available" ).append( append_button_print );
        //Add printSlip() as a listener to click events on the class "button-added".
        //listener added at this point due timing in promises.
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#Timing
            let buttonAdded = document.getElementsByClassName( "button-added" ), i;
            for ( i = 0; i < buttonAdded.length; i++ ) {
                buttonAdded[i].addEventListener( "click", printSlip );
            }
        }
    }, onError);

    if ( $( "#userdetails" ).length ) {
        let warning_alert = `<div class="alert alert-info">
                             <button type="button" class="closebtn" data-dismiss="alert">&times;</button>
                             <p class="text-center lead">${heads_up} ${sign_off_message}</p></div>`;
        $( "#header-region" ).append( warning_alert );
    }
} else {
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).attr( "data-toggle", "popover" );
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).attr( "data-placement", "bottom" );
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).attr( "data-original-title", extension_name );
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).attr( "data-content", popover_message );
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).attr( "data-trigger", "manual" );
    $( "[href='/cgi-bin/koha/opac-user.pl']" ).popover( "show" );
    browser.runtime.sendMessage({"button": 1});
}

$( "#logout" ).on( "click", function(){
    browser.runtime.sendMessage({"logout": 1});
});

//Generic error logger
function onError(e) {
    console.error(e);
}

//Send a message to the page script

function printSlip() {
    //look up if modal exist, if true then remove it
    if ( $( "#print_slip_modal" ).length ) {
        $( "#print_slip_modal" ).remove();
    }
    // Take tile, author of book and borrower name
    let book_title_resp_stmt = $( "h1.title" ).text(),
    borrowername             = $( "span.loggedinusername" ).text();

    //take the index of the element clicked
    let click_row = $( this ).parent().parent().parent().index(),
    click_col     = $( this ).parent().parent().index(),
    table         = $( "#DataTables_Table_0" );
    //iterating through table
    table.find( "tr" ).each(function () {
        var tds = $( this ).find( "td" ),
        barcode = tds.eq( click_col + 2 ),
        col     = barcode.index(),
        row     = barcode.parent().index();
        if ( $( "#item_ccode" ).length ) {
            if ( $( "#item_enumchron" ).length && $( "#item_copy" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_ccode            = tds.eq(2).text(),
                item_call_number      = tds.eq(3).text(),
                item_enum_chron       = tds.eq(4).text(),
                item_copy             = tds.eq(5).text(),
                item_status           = tds.eq(6).text(),
                item_date_due         = tds.eq(7).text(),
                item_barcode          = tds.eq(8).text();
            } else if ( $( "#item_copy" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_ccode            = tds.eq(2).text(),
                item_call_number      = tds.eq(3).text(),
                item_copy             = tds.eq(4).text(),
                item_status           = tds.eq(5).text(),
                item_date_due         = tds.eq(6).text(),
                item_barcode          = tds.eq(7).text(),
                item_enum_chron       = "";
           } else if ( $( "#item_enumchron" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_ccode            = tds.eq(2).text(),
                item_call_number      = tds.eq(3).text(),
                item_enum_chron       = tds.eq(4).text(),
                item_status           = tds.eq(5).text(),
                item_date_due         = tds.eq(6).text(),
                item_barcode          = tds.eq(7).text(),
                item_copy             = "";
            } else {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_ccode            = tds.eq(2).text(),
                item_call_number      = tds.eq(3).text(),
                item_status           = tds.eq(4).text(),
                item_date_due         = tds.eq(5).text(),
                item_barcode          = tds.eq(6).text(),
                item_enum_chron       = "",
                item_copy             = "";
            }
        } else {
            if ( $( "#item_enumchron" ).length && $( "#item_copy" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_call_number      = tds.eq(2).text(),
                item_enum_chron       = tds.eq(3).text(),
                item_copy             = tds.eq(4).text(),
                item_status           = tds.eq(5).text(),
                item_date_due         = tds.eq(6).text(),
                item_barcode          = tds.eq(7).text(),
                item_ccode            = "";
            } else if ( $( "#item_copy" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_call_number      = tds.eq(2).text(),
                item_copy             = tds.eq(3).text(),
                item_status           = tds.eq(4).text(),
                item_date_due         = tds.eq(5).text(),
                item_barcode          = tds.eq(6).text(),
                item_enum_chron       = "",
                item_ccode = "";
           } else if ( $( "#item_enumchron" ).length ) {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_call_number      = tds.eq(2).text(),
                item_enum_chron       = tds.eq(3).text(),
                item_status           = tds.eq(4).text(),
                item_date_due         = tds.eq(5).text(),
                item_barcode          = tds.eq(6).text(),
                item_copy             = "",
                item_ccode            = "";
            } else {
                var item_type         = tds.eq(0).text(),
                item_current_location = tds.eq(1).text(),
                item_call_number      = tds.eq(2).text(),
                item_status           = tds.eq(3).text(),
                item_date_due         = tds.eq(4).text(),
                item_barcode          = tds.eq(5).text(),
                item_enum_chron       = "",
                item_ccode            = "",
                item_copy             = "";
            }
        }
        //trim double, triple and so on... spaces between words
        let item_type_trimed         = item_type.replace( /\s\s+/g, ' ' ),
        item_current_location_trimed = item_current_location.replace( /\s\s+/g, ' ' ),
        item_ccode_trimed            = item_ccode.replace( /\s\s+/g, ' ' );

        //NOTE: Testing... to know how to get bardcode, and position clicked
        // alert("barcode: " + barcode.text() + " colindex: " + col + " rowindex: " + row + " clicking row: " + click_row);
        if ( click_row == row ) {
            //insert modal to take borrower card number
            let print_slip_modal = `<div id="print_slip_modal" class="modal hide fade">
                                   <div class="modal-header">
                                   <button type="button" class="closebtn" data-dismiss="modal" aria-hidden="true">
                                   &times;</button>
                                   <h3>${modal_title}</h3></div>
                                   <form id="print_slip_form" onsubmit="return printSlipForm()">
                                   <fieldset><div class="modal-body">
                                   <label>${card_number}</label>
                                   <input type="text" id="borrowercard" placeholder="26345000012941" required>
                                   <span class="help-block">${help_block_input}</span>
                                   <label class="checkbox"><input id="logout_checkbox" type="checkbox" checked>
                                   ${logout_checkbox}</label>
                                   </div><div class="modal-footer">
                                   <button type="submit" class="btn btn-primary"><i class="icon-print icon-white"></i>
                                   ${print_button}</button>
                                   <a href="#" class="close" data-dismiss="modal" aria-hidden="true">${cancel_button}</a>
                                   </div></fieldset></form></div>`;
            $( "body" ).append( print_slip_modal );

           //Pass data to input hidden values, show modal and stop the each bucle
           $("<input>").attr({
           type: 'hidden',
           id: "borrowername",
           value: borrowername
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_title",
           value: book_title_resp_stmt.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_type",
           value: item_type_trimed.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_current_location",
           value: item_current_location_trimed.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_ccode",
           value: item_ccode_trimed.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_call_number",
           value: item_call_number.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_enum_chron",
           value: item_enum_chron.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_copy",
           value: item_copy.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_status",
           value: item_status.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_date_due",
           value: item_date_due.trim()
           }).appendTo('#print_slip_form');
           $("<input>").attr({
           type: 'hidden',
           id: "resource_barcode",
           value: item_barcode.trim()
           }).appendTo('#print_slip_form');

           $( "#print_slip_modal" ).modal( "show" );

          return false;
        }
    });
}

window.addEventListener("message", (event) => {
  if (event.source == window &&
      event.data.message == "1" &&
      event.data.direction == "from-page-script") {
      browser.runtime.sendMessage({"logout": 1});
  }
});


