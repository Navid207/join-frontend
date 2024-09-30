/**
 * Renders HTML content to a specified element with the given ID.
 *
 * @param {string} id - The ID of the target element where the HTML will be rendered.
 * @param {string} HTML - The HTML content to be rendered.
 */
function renderHTML(id, HTML) {
  let contentBox = document.getElementById(id);
  contentBox.innerHTML = HTML;
}

/**
 * Toggles the visibility of a password input field between "password" and "text" and updates its background.
 *
 * @param {string} id - The ID of the password input element to toggle.
 */
function togglPwd(id) {
  let element = document.getElementById(id);
  let type = element.getAttribute("type") === "password" ? "text" : "password";
  element.setAttribute("type", type);
  element.focus();
  showPwdBg(id);
}

/**
 * Updates the background of a password input field based on its visibility status.
 *
 * @param {string} id - The ID of the password input element to update the background for.
 */
function showPwdBg(id) {
  let element = document.getElementById(id);
  let type = element.getAttribute("type");
  if (type === "password")
    element.setAttribute(
      "style",
      "background-image:url(./img/icons/visibility_on.svg);"
    );
  else
    element.setAttribute(
      "style",
      "background-image:url(./img/icons/visibility_off.svg);"
    );
}

/**
 * Hides the visibility of a password input field and updates its background.
 *
 * @param {string} id - The ID of the password input element to hide.
 */
function hidePwd(id) {
  let element = document.getElementById(id);
  element.setAttribute("type", "password");
  element.setAttribute("style", "background-image:url(./img/icons/lock.svg);");
  element.blur();
}

//------------------------------------------------

// this part should be in the backend
let users = [];

/**
 * Asynchronously initializes the login process by fetching user data and contact list.
 *
 * @returns {Promise<void>} - A Promise that resolves when the initialization is complete.
 */
async function initLogin() {
  // users = await getItem('users');
  // mapUsers();
  // contactListSorted = await getItem('contacts');
  // loadLogin();
  // checkState();
  // getToken();
}

/**
 * Maps the existing user data to a new array of User objects with updated properties.
 */
function mapUsers() {
  users = users.map(
    (user) => new User(user.name, user.email, user.pwd, user.id)
  );
}

/**
 * Initiates the sign-in validation process by clearing all messages and checking the password.
 *
 */
function checkSignIn() {
  clearAllMsg();
  disableAllMsg();
  checkPwd();
  enableAllMsg();
}

function disableAllMsg() {
  let nameInp = document.getElementById("name");
  if (nameInp) nameInp.disabled = true;
  let emailInp = document.getElementById("email");
  if (emailInp) emailInp.disabled = true;
  let pwdInp = document.getElementById("pwd");
  if (pwdInp) pwdInp.disabled = true;
  let pwd2Inp = document.getElementById("pwdCon");
  if (pwd2Inp) pwd2Inp.disabled = true;
}

function enableAllMsg() {
    let nameInp = document.getElementById("name");
    if (nameInp) nameInp.disabled = false;
    let emailInp = document.getElementById("email");
    if (emailInp) emailInp.disabled = false;
    let pwdInp = document.getElementById("pwd");
    if (pwdInp) pwdInp.disabled = false;
    let pwd2Inp = document.getElementById("pwdCon");
    if (pwd2Inp) pwd2Inp.disabled = false;
  }

/**
 * Clears the content of message elements and removes the 'border-wrg' class from corresponding input elements.
 *
 */
function clearAllMsg() {
  clearMsg("msgName", "name");
  clearMsg("msgEmail", "email");
  clearMsg("msgPwd", "pwdCon");
}

/**
 * Clears the content of a message element and removes the 'border-wrg' class from an input element.
 *
 * @param {string} msgId - The ID of the message element to be cleared.
 * @param {string} inpId - The ID of the input element from which to remove the 'border-wrg' class.
 */
function clearMsg(msgId, inpId) {
  let msg = document.getElementById(msgId);
  let inp = document.getElementById(inpId);
  if (msg) msg.innerHTML = "";
  if (inp) inp.classList.remove("border-wrg");
}

function checkPwd() {
  let pwd1 = document.getElementById("pwd");
  let pwd2 = document.getElementById("pwdCon");
  if (pwd1.value === pwd2.value) return addUser();
  else return addMsg("pwdCon", "msgPwd", "Password confirmation is wrong!");
}

/**
 * Adds a new user to the system if the email is unique; otherwise, displays an error message.
 */
async function addUser() {
  let name = document.getElementById("name").value;
  let pwd = document.getElementById("pwd").value;
  let email = document.getElementById("email").value;
  let fn = splitString(name).first;
  let ln = splitString(name).second;
  let body = {
    first_name: fn,
    last_name: ln,
    password: pwd,
    email: email,
  };
  try {
    const res = await fetchData(API_URL + "register/","POST", body);
    const data = await res.json();
    if (res.ok) return addUserToData();
    if (data[0]==="{'Email already exists!'}") return addMsg('email', 'msgEmail', 'Email already exists!');
  } catch (error) { }
}


async function addUserToData() {
//   sendWelcomMail(user);
  renderLogin();
}


/**
 * Renders the login UI (User Interface) by updating the HTML content of specified elements and showing/hiding elements.
 */
function renderLogin() {
  renderHTML("content", loginHTML());
  showElementID("signUp");
  renderHTML("hidden", SendMailHTML());
  removeElementByClassName("ovlyMsg", 2000);
}

/**
 * Removes elements with a specified class name after a specified delay.
 *
 * @param {string} className - The class name of the elements to be removed.
 * @param {number} delayTime - The delay time (in milliseconds) before removing each element.
 */
function removeElementByClassName(className, delayTime) {
  let hidenMsg = document.getElementsByClassName(className);
  if (hidenMsg) {
    for (let i = 0; i < hidenMsg.length; i++) {
      setTimeout(function () {
        hidenMsg[i].remove();
      }, delayTime);
    }
  }
}

/**
 * function to check the Login
 */
async function login() {
  let name = document.getElementById("email").value;
  let pwd = document.getElementById("pwd").value;
  let user = await getToken(name, pwd);
  user
    ? loginSuccess(user)
    : addMsg("pwd", "msgPwd", "Ups, wrong password! Try again.");
}

/**
 * Redirects the user to the summary page.
 * Safely logs in the user and redirects the user to the summary page with the user's ID as a query parameter.
 *
 * @param {Object} user - The user object representing the logged-in user.
 * @property {string} user.id - The unique identifier of the user.
 */
function loginSuccess(user) {
  localStorage.setItem('user', JSON.stringify(user));
  safeLogin(JSON.stringify(user));
  window.location.href = "pages/summary.html" + "?user=" + user.id;
}

/**
 * Redirects the user to the summary page as a guest.
 */
function loginGuest() {
  window.location.href = "pages/summary.html";
}

/**
 * Safely manages user login information in local storage based on the user's preference.
 *
 * @param {string} user - The serialized user information to be stored in local storage.
 */
function safeLogin(user) {
  let save = document.getElementById("saveLogin");
  save.checked
    ? localStorage.setItem("UserD", user)
    : localStorage.removeItem("UserD");
}

/**
 * Loads user login information from local storage and populates the login form if available.
 */
function loadLogin() {
  let user = JSON.parse(localStorage.getItem("User"));
  if (user) {
    document.getElementById("email").value = user["email"];
    document.getElementById("pwd").value = user["pwd"];
    document.getElementById("saveLogin").checked = true;
  }
}

/**
 * Initiates the process for password recovery.
 * Checks if the entered email exists in the user data,
 * renders the appropriate HTML content, and displays relevant messages.
 */
function forgotPwd() {
  let email = document.getElementById("email");
  if (users.find((u) => u.email == email.value)) {
    renderHTML("hidden", SendMailHTML());
    removeElementByClassName("ovlyMsg", 2000);
    renderHTML("content", loginHTML());
    showElementID("signUp");
  } else addMsg("email", "msgMail", "Email not exist!");
}

/**
 * Checks the state of the URL parameters and performs actions based on the state.
 */
function checkState() {
  const msg = URL_PARAMS.get("msg");
  if (msg == "send_Mail") {
    renderHTML("hidden", SendMailHTML());
    removeElementByClassName("ovlyMsg", 2000);
    hideElementID("SendMailHTML");
    removeElementByClassName("ovlyMsg", 2000);
  }
}

/**
 * Changes the password for a user based on the provided email in the URL parameters.
 * Updates the user data, renders HTML content, and redirects to the start page after a delay.
 */
async function changePassword() {
  const mail = URL_PARAMS.get("mail");
  let userID = findIndexByValue("email", mail, users);
  users[userID]["pwd"] = document.getElementById("pwd").value;
  setItem("users", users);
  renderHTML("hidden", ChangePwdHTML());
  removeElementByClassName("ovlyMsg", 2000);
  setTimeout(function () {
    goToStartPage();
  }, 2000);
}

/**
 * Redirects the user to the Log in page.
 */
function goToStartPage() {
  window.location = "../index.html";
}

//------------------------------------------------

/**
 * Hides an HTML element with the specified ID by adding the 'display-none' class.
 *
 * @param {string} elementID - The ID of the HTML element to hide.
 */
function hideElementID(ElementID) {
  document.getElementById(ElementID).classList.add("display-none");
}
/**
 * Shows an HTML element with the specified ID by removing the 'display-none' class.
 *
 * @param {string} elementID - The ID of the HTML element to show.
 */
function showElementID(ElementID) {
  document.getElementById(ElementID).classList.remove("display-none");
}
/**
 * Adds an error message for a specified input field and clears its value.
 *
 * @param {string} inpID - The ID of the input field to which the error message is associated.
 * @param {string} msgID - The ID of the element where the error message will be displayed.
 * @param {string} msgString - The error message string to be displayed.
 */
function addMsg(inpID, msgID, msgString) {
  let inp = document.getElementById(inpID);
  inp.classList.add("border-wrg");
  inp.value = "";
  document.getElementById(msgID).innerHTML = msgString;
}
