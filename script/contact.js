/**
 * Asynchronously initialization of the board.
 * 
 */
async function initContact(tabID){
    await init(tabID);
    renderContactList(contactListSorted);
    await getAddTaskHTML();
}

/**
 * Renders a contact list in the specified content element based on the sorted contact data.
 *
 * @param {Array} contactListsorted - An array of contact data sorted alphabetically.
 */
function renderContactList(contactListsorted){
    let content = document.getElementById('contactlist');
    if (contactListsorted.length > 0) {
        let letter = contactListsorted[0]['first_name'][0];
        content.innerHTML = getContactListLetterHTML(letter);;
        for (let i = 0; i < contactListsorted.length; i++) {
            let contactData = contactListsorted[i];
            if (contactData['first_name'][0] == letter) {
                content.innerHTML += getContactListContactHTML(i,contactData);
            } else {
                letter = contactData['first_name'][0];
                content.innerHTML += getContactListLetterHTML(letter);
                content.innerHTML += getContactListContactHTML(i,contactData);
            }
            setInitialsColor(i,contactData['color_code']);
        }
    } else content.innerHTML = getContactlistEmptyHTML();
}

/**
 * Sets the background color of the initials element for a contact at the specified index.
 *
 * @param {number} idx - The index of the contact.
 * @param {string} color - The color to be set as the background color.
 */
function setInitialsColor(idx,color){
    document.getElementById("contactinitialsList" + idx).style.backgroundColor = color;
}

/**
 * Sets the contact details data in the corresponding HTML elements based on the contact index and sorted contact list.
 *
 * @param {number} idx - The index of the contact in the sorted contact list.
 * @param {Array} contactListsorted - An array of contact data sorted alphabetically.
 */
function setContactDetailsData(idx,contactListsorted){
    let contactData = contactListsorted[idx];
    document.getElementById('contactinitials').innerHTML = contactData['initials'];
    document.getElementById('contactinitials').style.backgroundColor = contactData['color_code'];
    document.getElementById('contactname').innerHTML = contactData['first_name'] + ' ' + contactData['last_name'];
    document.getElementById('contactemail').innerHTML = contactData['email'];
    document.getElementById('contactemail').setAttribute('href', 'mailto:' + contactData['email']);
    document.getElementById('contactnumber').innerHTML = contactData['phone'];
    document.getElementById('contactnumber').setAttribute('href' ,'Tel:' + contactData['phone']);
    document.getElementById('btneditContact').setAttribute('onclick',`showOvlyCard(getOvlyCardEditContactHTML(${idx}))`);
    document.getElementById('btneditContactRes').setAttribute('onclick',`showOvlyCard(getOvlyCardEditContactHTML(${idx}))`);
    document.getElementById('btndeleteContactRes').setAttribute('onclick',`deleteContact(${idx})`);
}

/**
 * Displays contact details based on the contact ID, sets data, shows the contact card, and applies styling.
 *
 * @param {Event} event - The event object triggering the function (optional).
 * @param {number} contactID - The ID of the contact to display details for.
 */
function showContactDetails(event,contactID){
    hideContactDetails();
    if(event){stopHideElement(event)};
    setContactDetailsData(contactID,contactListSorted);
    setTimeout(function(){document.getElementById('contactCard').classList.add('showcontactCard')},1);
    setContactListActiveStyle(contactID);
    document.getElementById('wrappercontact').style.display = 'block';
    showElement(['wrappercontact'],);
}

/**
 * Sets the active styling for the specified contact in the contact list.
 *
 * @param {number} contactID - The ID of the contact for which to apply active styling.
 */
function setContactListActiveStyle(contactID){
    setContactListPassivStyle();
    document.getElementById('contact'+contactID).classList.add('active');
    document.getElementById('contactNameList'+contactID).style.color = '#FFFFFF';
}

/**
 * Sets the passive styling for the currently active contact in the contact list.
 *
 */
function setContactListPassivStyle(){
    let contactID = document.getElementsByClassName('active Contactlistelement');
    if (contactID.length > 0) {
        contactID = contactID[0]['id'].slice(7);
        document.getElementById('contact'+contactID).classList.remove('active');
        document.getElementById('contactNameList'+contactID).style.color = '#000000';
    }
}

/**
 * Hides the contact details by setting passive styling and removing the 'showcontactCard' class.
 *
 */
function hideContactDetails(){
    setContactListPassivStyle()
    document.getElementById('contactCard').classList.remove('showcontactCard');
}

/**
 * Saves the contact details at the specified index.
 *
 * @param {number} idx - The index of the contact to be saved.
 * @returns {Promise<void>} A promise that resolves after the contact data is updated, saved, and contact details are updated.
 */
async function saveContact(idx){
    if (document.getElementById('wrapperCardDetails').checkValidity()) {   
        let contact = getSavedDatas(idx);
        await requestItem('PUT','contacts/'+contact.id,contact);
        hideOvlyCard();
        contactListSorted = await requestItem("GET","contacts");
        renderContactList(contactListSorted);
        setContactDetailsData(idx,contactListSorted);
        setContactListActiveStyle(idx);
    }
}


function getSavedDatas(idx){
    let first_name = splitString(document.getElementById('formContactName').value).first;
    let last_name = splitString(document.getElementById('formContactName').value).second;
    let phone = document.getElementById('formContactPhone').value;
    let email = document.getElementById('formContactEmail').value;
    let contact = {
        "id": contactListSorted[idx].id,
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "email": email,
        "color_code": contactListSorted[idx].color_code,
        "initials": first_name[0]+last_name[0]
    }
    return contact
}

/**
 * Deletes the contact at the specified index.
 *
 * @param {number} idx - The index of the contact to be deleted.
 * @returns {Promise<void>} A promise that resolves after the contact data is updated, saved, and contact list is rendered.
 */
async function deleteContact(idx){
    let key = 'contacts'+'/'+contactListSorted[idx].id;
    let res = await requestItem('DELETE',key);
    if (res == 204) {
        contactListSorted.splice(idx,1);
        hideOvlyCard();
        renderContactList(contactListSorted);
        hideContactDetails();
    } else alert('Fehler beim Löschen des Kontakts');
}

/**
 * Creates a new contact with the provided form data, adds it to the contact list,
 * sets initials, generates a random color, renders the updated contact list,
 * shows the details of the newly created contact, hides the overlay card, and displays a success animation.
 *
 * @returns {Promise<void>} A promise that resolves after the contact is added, list is rendered, details are shown, and overlay is hidden.
 */
async function createContact(){
    if (! document.getElementById('wrapperCardDetails').checkValidity()) return
    try {
        await requestItem('POST', 'contacts', retContactData())
        contactListSorted = await requestItem("GET","contacts");
        renderContactList(contactListSorted);
        hideOvlyCard();
        document.getElementById('ovlyContactSuccCreated').classList.add("addAnimtaion");
        setTimeout(function(){document.getElementById('ovlyContactSuccCreated').classList.remove("addAnimtaion")},2000);    
    } catch (error) {
        alert('Fehler beim Erstellen des Kontakts');
    }
 }


function retContactData(){
    let contact =  {
        first_name: splitString(document.getElementById('formContactName').value).first,
        last_name: splitString(document.getElementById('formContactName').value).second,
        phone: document.getElementById('formContactPhone').value,
        email: document.getElementById('formContactEmail').value,
        color_code: generateRendomColor()
    }
    return contact
}


// functions for responsive design

function showBtnResContactDetails(event){
    event?stopHideElement(event):'';
    document.getElementById('wrapperBtnResContactDetails').classList.add('showBtnRes');
}

function hideBtnResContactDetails(){
    document.getElementById('wrapperBtnResContactDetails').classList.remove('showBtnRes');
}

// help functions

/**
 * This Function generates a random hex color value
 * 
 * @returns - return a hex color value as a string
 */
function generateRendomColor(){
    let randomColor = Math.floor(Math.random()*16777215).toString(16.).toUpperCase();
    return "#" + randomColor;
}

