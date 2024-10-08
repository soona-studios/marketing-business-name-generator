const EMAIL_STORAGE_KEY = "submitted_email";
const baseUrl = "https://book.soona.co";

let pollCount = 0;
let hasClickedGenerate = false;
let hasResults = false;

initForm();

function initForm() {
  checkIfAlreadyGaveEmail();
  addEventListeners();
}

function checkIfAlreadyGaveEmail() {
  const email = localStorage.getItem(EMAIL_STORAGE_KEY);

  if (email) document.querySelector("#email-input").value = email;
}

function addEventListeners() {
  document
    .querySelector("#bng-nxt-btn")
    .addEventListener("click", handleSubmitForm);

  document
    .querySelector("#new-prompt-btn")
    .addEventListener("click", handleSubmitForm);

  document
    .querySelector("#regenerate-current-names")
    .addEventListener("click", handleSubmitForm);

  document
    .querySelector("#submit-email-btn")
    .addEventListener("click", handleGenerateClick);
}

function resetPollCount() {
  pollCount = 0;
}

function throwError(error) {
  throw new Error(error);
}

function checkForClass(selector, className) {
  const $el = document.querySelector(selector);
  if ($el) return $el.classList.contains(className);
  return false;
}

function addClass(selector, className) {
  const $el = document.querySelector(selector);
  $el.classList.add(className);
}

function removeClass(selector, className) {
  const $el = document.querySelector(selector);
  $el.classList.remove(className);
}

function showLoadingState(id = "#loading-state-1") {
  const isAlreadyShown = checkForClass(id, "show");
  if (!isAlreadyShown) addClass(id, "show");
}

function hideLoadingState(id = "#loading-state-1") {
  const isAlreadyShown = checkForClass(id, "show");
  if (isAlreadyShown) removeClass(id, "show");
}

function showErrorState() {
  const isAlreadyShown = checkForClass("#error-state", "show");
  if (!isAlreadyShown) addClass("#error-state", "show");
}

function hideErrorState() {
  const isAlreadyShown = checkForClass("#error-state", "show");
  if (isAlreadyShown) removeClass("#error-state", "show");
}

function renderErrorState(error = null) {
  if (error) console.error(error);
  hideLoadingState("#loading-state-2");
  showErrorState();
  resetPollCount();
}

function resetState() {
  hideLoadingState();
  hideLoadingState("#loading-state-2");
  hideErrorState();
  resetPollCount();
}

function checkForEmailValue() {
  const $el = document.querySelector("#email-input");
  return !!$el.value;
}

function updateActiveStep() {
  const $stepTwo = document.querySelector("#step-2");
  const $stepThree = document.querySelector("#step-3");

  if (hasClickedGenerate && !$stepTwo.classList.contains("hide")) {
    $stepTwo.classList.add("hide");
    $stepThree.classList.remove("hide");
  }
}

function hideLoadingStateIfNeeded() {
  setTimeout(() => {
    if (hasResults) {
      hideLoadingState();
      updateActiveStep();
    }
  }, 3000);
}

function focusEmailInput() {
  const $el = document.querySelector("#email-input");
  $el.focus();
}

function handleGenerateClick() {
  const isValid = checkForEmailValue();

  if (isValid) {
    hasClickedGenerate = true;
    showLoadingState();
    hideLoadingStateIfNeeded();
  } else focusEmailInput();
}

function generateEmailLeadPayload(email) {
  return {
    new_lead: {
      email: email,
      lead_source: "business name generator",
    },
  };
}

function setLocalStorage(email) {
  localStorage.setItem("submitted_email", email);
}

async function postEmailLead(payload) {
  try {
    await fetch(`${baseUrl}/api/eventing/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(error);
  }
}

function sendNewEmailLead(email) {
  if (!email) return;

  const payload = generateEmailLeadPayload(email);

  setLocalStorage(email);
  postEmailLead(payload);
}

function determineIfLoading(id) {
  // do not show loading state on first step 'next' click, but load on all other clicks
  if (!id || id === "bng-nxt-btn") return false;
  return true;
}

function removeSendButtonEventListener($el) {
  if ($el.id === "bng-nxt-btn") {
    $el.removeEventListener("click", handleSubmitForm);
  }
}

function generateMainPayload() {
  const description = document.querySelector("#new-prompt-input").value
    ? document.querySelector("#new-prompt-input").value
    : document.querySelector("#main-prompt-input").value;

  return {
    generate: {
      provider: "respell",
      payload: {
        spellId: "clzhrcyph00bmfid8ranjifwv",
        inputs: {
          business_brand_description: description,
        },
      },
    },
  };
}

function renderResultsToDOM(res) {
  for (let i = 0; i < res.length; i++) {
    document.querySelector(`#result-${i}`).innerText = res[i].trim();
  }
}

function formatOutput(output) {
  if (output) {
    return output.replace(/`|\[|\]|"|\n|javascript/g, "").split(",");
  }
}

function rerunPollStatus(jobId) {
  pollCount++;
  setTimeout(() => pollStatus(jobId), 3000);
}

function completeForm(output) {
  hasResults = true;
  updateActiveStep();
  renderResultsToDOM(output);
  resetState();
}

async function pollStatus(jobId) {
  try {
    const response = await fetch(`${baseUrl}/api/predictions/${jobId}`);
    const data = await response.json();
    const isComplete = data.status === "complete";
    const output = formatOutput(data.outputs?.company_name);
    const errorMessage = data.outputs?.message;

    if (!isComplete && pollCount < 10) rerunPollStatus(jobId);
    else if (isComplete && output) completeForm(output);
    else if (errorMessage) renderErrorState(errorMessage);
    else {
      throwError("Fetching the data failed. Please try again.");
      renderErrorState();
    }
  } catch (error) {
    renderErrorState(error);
  }
}

async function handleSubmitForm(e) {
  const showLoading = determineIfLoading(e.target.id);

  if (showLoading) showLoadingState("#loading-state-2");

  removeSendButtonEventListener(e.target);
  sendNewEmailLead(document.querySelector("#email-input").value);

  const payload = generateMainPayload();

  try {
    const response = await fetch(`${baseUrl}/api/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throwError("Sending the request failed. Please try again.");
      renderErrorState();
    }

    const responseData = await response.json();

    if (responseData.provider_job_id) {
      pollStatus(responseData.provider_job_id);
    }
  } catch (error) {
    renderErrorState(error);
  }
}
