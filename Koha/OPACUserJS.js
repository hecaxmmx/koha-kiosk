/*!
 * This file is part of Koha Kiosk
 * Copyright 2017 Hector Castro
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

/* INSTRUCTIONS: Copy this script into Koha OPAC Preference => OPACUserJS system preference in order to the extension works properly.
 * Change html variable for the print-slip to fit at your library requirements.
 */

var html = "<body>";
html += "<div style='float:left; width:50%'>";
html += "<h7>Universidad de El Salvador</h7><br />";
html += "<h7>Sistema Bibliotecario</h7><br />";
html += "<h7>Biblioteca:</h7><br /></div>";
html += "<div style='float:left; width:50%'>Nombre del Usuario: " + $( "input#borrowername" ).val() + "<br />";
html += "No. de carné: (" + $("input#borrowercard").val() + ") <br /><span id='today'>" + today.toDateString() + "</span></div>";
html += "<div style='clear:both'>";
html += "<p>Título del ítem:" +  $( "input#resource_title" ).val() + "<br />";
html += "<b>Código de barras:</b> " + $( "input#resource_barcode" ).val();
html += " <b>Ubicación:</b> " + $( "input#resource_call_number" ).val() + " " + $( "input#resource_copy" ).val() + " <b>Num. Ser.:</b> " + $( "input#resource_enum_chron" ).val() + "<br />";
html += "<b>Biblioteca actual/Colección:</b> " + $( "input#resource_current_location" ).val() + "<br />";
html +="<b>SubColección:</b> " + $( "input#resource_ccode" ).val() + "<br />";
html += "Fecha de vencimiento: </p></div>";
html += "<div style='position:relative'>";
html += "<div style='float:left; width:60%'>";
html += "<cite>Me comprometo a devolver el material prestado en la fecha estipulada, caso contrario que se proceda de acuerdo al reglamento de la Biblioteca</cite></div>";
html += "<div style='float:left; width:40%'>";
html += "<p style='float:right;'>Firma:_________________</p></div></div>";
html += "</body>";

//functions to print in iframe object
function closePrint () {
    document.body.removeChild(this.__container__);
}

function setPrint () {
    this.contentWindow.__container__ = this;
    this.contentWindow.onbeforeunload = closePrint;
    this.contentWindow.onafterprint = closePrint;
    this.contentWindow.focus(); // Required for IE
    this.contentWindow.print();
}

function printSlipForm() {
    if( document.getElementById("logout_checkbox").checked ) {
        window.location.href = '/cgi-bin/koha/opac-main.pl?logout.x=1';
    }
    var today = new Date();
    var iframe = document.createElement("iframe");

    iframe.src = "data:text/html;charset=utf-8," + encodeURI(html);
    iframe.onload = setPrint;
    iframe.style.visibility = "hidden";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    document.body.appendChild(iframe);
    $( "#print_slip_modal" ).modal( "hide" );
    $( "#print_slip_modal" ).remove();

   return false;
}
