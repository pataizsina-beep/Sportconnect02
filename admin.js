
import PocketBase from
  "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs";

const pb = new PocketBase("http://127.0.0.1:8090");

// Your SportConnect administrator's sp_users record ID.
const ADMIN_USER_ID = "le3r4aghtvee1zf";

const form = document.querySelector("#gym-form");
const nameInput = document.querySelector("#gym-name");
const cityInput = document.querySelector("#gym-city");
const streetInput = document.querySelector("#gym-street");
const numberInput = document.querySelector("#gym-house-number");
const sportsSelect = document.querySelector("#gym-sports");
const gymList = document.querySelector("#gym-list");
const status = document.querySelector("#status");
const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");

let editingId = null;
let gyms = [];

function showStatus(text, isError = false) {
  status.textContent = text;
  status.className = isError ? "message error" : "message success";
}

function checkAdmin() {
  if (
    !pb.authStore.isValid ||
    pb.authStore.record?.id !== ADMIN_USER_ID
  ) {
    document.querySelector(".admin-content").hidden = true;
    showStatus(
      "Access denied. Please log in using the administrator account.",
      true
    );
    return false;
  }

  return true;
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add a gym";
  saveButton.textContent = "Add gym";
  cancelButton.hidden = true;
}

function getSelectedSports() {
  return Array.from(sportsSelect.selectedOptions)
    .map(option => option.value);
}

async function loadSports() {
  const sports = await pb.collection("sp_sports").getFullList({
    sort: "name"
  });

  sportsSelect.replaceChildren();

  for (const sport of sports) {
    const option = document.createElement("option");
    option.value = sport.id;
    option.textContent = sport.name;
    sportsSelect.appendChild(option);
  }
}

async function loadGyms() {
  gyms = await pb.collection("sp_gyms").getFullList({
    sort: "name",
    expand: "sports"
  });

  renderGyms();
}

function renderGyms() {
  gymList.replaceChildren();

  if (gyms.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No gyms have been added yet.";
    gymList.appendChild(empty);
    return;
  }

  for (const gym of gyms) {
    const card = document.createElement("article");
    card.className = "gym-card";

    const heading = document.createElement("h3");
    heading.textContent = gym.name;

    const address = document.createElement("p");
    address.textContent = [
      gym.street,
      gym.house_number,
      gym.city
    ].filter(Boolean).join(", ");

    const sportNames = (gym.expand?.sports || [])
      .map(sport => sport.name)
      .join(", ");

    const sports = document.createElement("p");
    sports.textContent = `Sports: ${sportNames || "None selected"}`;

    const actions = document.createElement("div");
    actions.className = "gym-card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editGym(gym));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteGym(gym));

    actions.append(editButton, deleteButton);
    card.append(heading, address, sports, actions);
    gymList.appendChild(card);
  }
}

function editGym(gym) {
  editingId = gym.id;
  nameInput.value = gym.name;
  cityInput.value = gym.city;
  streetInput.value = gym.street || "";
  numberInput.value = gym.house_number || "";

  const selected = new Set(
    Array.isArray(gym.sports) ? gym.sports : []
  );

  for (const option of sportsSelect.options) {
    option.selected = selected.has(option.value);
  }

  formTitle.textContent = "Edit gym";
  saveButton.textContent = "Save changes";
  cancelButton.hidden = false;

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteGym(gym) {
  if (!confirm(`Delete "${gym.name}"? This cannot be undone.`)) {
    return;
  }

  try {
    await pb.collection("sp_gyms").delete(gym.id);
    showStatus("Gym deleted.");
    await loadGyms();
  } catch (error) {
    console.error(error);
    showStatus(
      error.response?.message || "Could not delete this gym.",
      true
    );
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!checkAdmin()) return;

  saveButton.disabled = true;

  const data = {
    name: nameInput.value.trim(),
    city: cityInput.value.trim(),
    street: streetInput.value.trim(),
    house_number: numberInput.value.trim(),
    sports: getSelectedSports()
  };

  try {
    if (editingId) {
      await pb.collection("sp_gyms").update(editingId, data);
      showStatus("Gym updated successfully.");
    } else {
      await pb.collection("sp_gyms").create(data);
      showStatus("Gym added successfully.");
    }

    resetForm();
    await loadGyms();
  } catch (error) {
    console.error("Gym save error:", error);
    showStatus(
      error.response?.message ||
      "Could not save the gym. Check the collection rules and fields.",
      true
    );
  } finally {
    saveButton.disabled = false;
  }
});

cancelButton.addEventListener("click", resetForm);

document.querySelector("#logout-button").addEventListener("click", () => {
  pb.authStore.clear();
  window.location.href = "index.html";
});

async function start() {
  if (!checkAdmin()) return;

  try {
    await loadSports();
    await loadGyms();
  } catch (error) {
    console.error(error);
    showStatus(
      "Could not load gyms or sports. Check that PocketBase is running.",
      true
    );
  }
}

start();
