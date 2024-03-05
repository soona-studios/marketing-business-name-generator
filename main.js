const EMAIL_STORAGE_KEY = "submitted_email";
const baseUrl = "https://book.soona.co";

let pollCount = 0;

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
}

function resetPollCount() {
  pollCount = 0;
}

function throwError(error) {
  throw new Error(error);
}

function addClass(selector, className) {
  const $el = document.querySelector(selector);
  $el.classList.add(className);
}

function removeClass(selector, className) {
  const $el = document.querySelector(selector);
  $el.classList.remove(className);
}

function showLoadingState() {
  addClass("#loading-state", "show");
}

function hideLoadingState() {
  removeClass("#loading-state", "show");
}

function showErrorState() {
  addClass("#error-state", "show");
}

function hideErrorState() {
  removeClass("#error-state", "show");
}

function renderErrorState(error = null) {
  if (error) console.error(error);
  hideLoadingState();
  showErrorState();
  resetPollCount();
}

function resetState() {
  hideLoadingState();
  hideErrorState();
  resetPollCount();
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

function generateMainPayload() {
  const description = document.querySelector("#new-prompt-input").value
    ? document.querySelector("#new-prompt-input").value
    : document.querySelector("#main-prompt-input").value;

  return {
    generate: {
      provider: "respell",
      payload: {
        spellId: "iLr2yg8cC4yfrx4iPiLm9",
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

async function handleSubmitForm() {
  showLoadingState();
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
