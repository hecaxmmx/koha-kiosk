/*!
 * This file is part of Koha Kiosk
 * Copyright 2018 Hector Castro
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

function handleMessages(message) {

    //Local storage for button print
    browser.storage.local.set({set_button_print: message.button});
    let session_state, title;
    if ( message.button == 0 ) {
        session_state = browser.i18n.getMessage("AccountFrozen");
        title = browser.i18n.getMessage("AccountFrozenTitle");
    }
    if ( message.logout == 1 ) {
        session_state = browser.i18n.getMessage("SignedOffNotification");
        title = browser.i18n.getMessage("SignedOffNotificationTitle");
    }

    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icons/info-48.png"),
        "title": title,
        "message": session_state
    });

}

browser.runtime.onMessage.addListener(handleMessages);

