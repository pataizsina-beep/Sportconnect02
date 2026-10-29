
import PocketBase from
  "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs";

// Connect to your local PocketBase server.
const pb = new PocketBase("http://127.0.0.1:8090");

const form = document.querySelector("#auth-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const nameField = document.querySelector("#name-field");
const confirmField = document.querySelector("#confirm-field");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmInput = document.querySelector("#confirm-password");
const title = document.querySelector("#form-title");
const subtitle = document.querySelector("#form-subtitle");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#message");
const switchCopy = document.querySelector("#switch-copy");
const switchButton = document.querySelector("#switch-button");

const authCard = document.querySelector(".auth-card");
const dashboard = document.querySelector("#dashboard");
const welcomeName = document.querySelector("#welcome-name");
const logoutButton = document.querySelector("#logout-button");
const findPartnerButton = document.querySelector("#find-partner-button");


let mode = "login";

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setMode(newMode) {
  mode = newMode;
  const registering = mode === "register";

  title.textContent = registering ? "Create your account" : "Welcome back";
  subtitle.textContent = registering
    ? "Join your local sports community."
    : "Sign in to pick up where you left off.";

  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);

  loginTab.setAttribute("aria-selected", String(!registering));
  registerTab.setAttribute("aria-selected", String(registering));

  nameField.hidden = !registering;
  confirmField.hidden = !registering;

  nameInput.required = registering;
  confirmInput.required = registering;

  passwordInput.autocomplete = registering
    ? "new-password"
    : "current-password";

  submitButton.textContent = registering
    ? "Create account"
    : "Log in";

  switchCopy.firstChild.textContent = registering
    ? "Already have an account? "
    : "New to SportConnect? ";

  switchButton.textContent = registering
    ? "Log in"
    : "Create an account";

  showMessage("");
}

function showDashboard() {
  const user = pb.authStore.record;

  welcomeName.textContent = user?.name?.trim() || "there";

  // Use the compact, full-width layout while a user is signed in.
  document.body.classList.add("dashboard-mode");
  authCard.hidden = true;
  dashboard.hidden = false;
}

function showLoginPage() {
  document.body.classList.remove("dashboard-mode");
  dashboard.hidden = true;
  authCard.hidden = false;
  setMode("login");
}

logoutButton.addEventListener("click", () => {
  pb.authStore.clear();
  showLoginPage();
});


// Restore the dashboard when a valid session exists.
if (pb.authStore.isValid) {
  showDashboard();
} else {
  showLoginPage();
}


loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

switchButton.addEventListener("click", () => {
  setMode(mode === "login" ? "register" : "login");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (mode === "register") {
    if (password !== confirmInput.value) {
      showMessage("Your passwords do not match.", "error");
      return;
    }

    if (password.length < 8) {
      showMessage(
        "Your password must contain at least 8 characters.",
        "error"
      );
      return;
    }
  }

  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  try {
    if (mode === "register") {
      // Register a new SportConnect user
      await pb.collection("sp_users").create({
        name: nameInput.value.trim(),
        email,
        password,
        passwordConfirm: confirmInput.value,
        emailVisibility: false
      });

      // Try to sign in after successful registration.
      try {
        // Log in an existing SportConnect user
        await pb.collection("sp_users").authWithPassword(
          email,
          password
        );

        showDashboard();

      } catch {
        showMessage(
          "Account created! Please log in. If email verification " +
          "is required, verify your email first.",
          "success"
        );
        setMode("login");
      }
    } else {
      await pb.collection("sp_users").authWithPassword(email, password);

      showMessage(
        `Welcome back, ${pb.authStore.record.name || email}!`,
        "success"
      );
    }

  } catch (error) {
    console.error("Authentication error:", error);

    const data = error.response?.data || {};

    // Handle duplicate email during registration.
    if (
      mode === "register" &&
      data.email?.code === "validation_not_unique"
    ) {
      showMessage(
        "An account with this email already exists. Please log in instead.",
        "error"
      );
    } else if (
      mode === "register" &&
      data.email?.message?.toLowerCase().includes("unique")
    ) {
      showMessage(
        "An account with this email already exists. Please log in instead.",
        "error"
      );
    } else if (error.status === 400) {
      const fieldErrors = Object.values(data)
        .map((item) => item.message)
        .filter(Boolean)
        .join(" ");

      showMessage(
        fieldErrors || "Please check your details and try again.",
        "error"
      );
    } else if (error.status === 0) {
      showMessage(
        "Cannot connect to SportConnect. Check that PocketBase is running.",
        "error"
      );
    } else {
      showMessage(
        "Something went wrong. Please try again.",
        "error"
      );
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent =
      mode === "register" ? "Create account" : "Log in";

    if (pb.authStore.isValid) {
      showDashboard();
    }
  }
});



console.log("SportConnect authentication interface is ready.");


// Profile and sports services.
const openProfileButton = document.querySelector("#open-profile");
const openSportsButton = document.querySelector("#open-sports");
const profilePanel = document.querySelector("#profile-panel");
const sportsPanel = document.querySelector("#sports-panel");
const profileForm = document.querySelector("#profile-form");
const profileMessage = document.querySelector("#profile-message");
const sportsForm = document.querySelector("#sports-form");
const sportsMessage = document.querySelector("#sports-message");
const sportChoice = document.querySelector("#sport-choice");
const mySportsList = document.querySelector("#my-sports-list");
const openActivitiesButton = document.querySelector("#open-activities");
const openFinderButton = document.querySelector("#open-finder");
const openRequestsButton = document.querySelector("#open-requests");
const requestsPanel = document.querySelector("#requests-panel");
const requestsMessage = document.querySelector("#requests-message");
const incomingRequests = document.querySelector("#incoming-requests");
const sentRequests = document.querySelector("#sent-requests");
const openMessagesButton = document.querySelector("#open-messages");
const messagesPanel = document.querySelector("#messages-panel");
const messagesStatus = document.querySelector("#messages-status");
const conversationList = document.querySelector("#conversation-list");
const conversationPlaceholder = document.querySelector("#conversation-placeholder");
const activeConversationPanel = document.querySelector("#active-conversation");
const conversationPartnerName = document.querySelector("#conversation-partner-name");
const conversationSubtitle = document.querySelector("#conversation-subtitle");
const conversationMessages = document.querySelector("#conversation-messages");
const chatForm = document.querySelector("#chat-form");
const chatMessageInput = document.querySelector("#chat-message-input");
const sendChatMessageButton = document.querySelector("#send-chat-message");
const refreshConversationButton = document.querySelector("#refresh-conversation");
const finderPanel = document.querySelector("#finder-panel");
const finderForm = document.querySelector("#finder-form");
const finderSport = document.querySelector("#finder-sport");
const finderLevel = document.querySelector("#finder-level");
const finderCity = document.querySelector("#finder-city");
const finderSearch = document.querySelector("#finder-search");
const finderMessage = document.querySelector("#finder-message");
const finderResults = document.querySelector("#finder-results");
const activitiesPanel = document.querySelector("#activities-panel");
const activitiesForm = document.querySelector("#activities-form");
const activitiesMessage = document.querySelector("#activities-message");
const activitySport = document.querySelector("#activity-sport");
const activityLevel = document.querySelector("#activity-level");
const activityFrequency = document.querySelector("#activity-frequency");
const activityDate = document.querySelector("#activity-date");
const activityDateField = document.querySelector("#activity-date-field");
const activityWeekday = document.querySelector("#activity-weekday");
const activityWeekdayField = document.querySelector("#activity-weekday-field");
const activityStartTime = document.querySelector("#activity-start-time");
const activityEndTime = document.querySelector("#activity-end-time");
const activityLocationType = document.querySelector("#activity-location-type");
const activityGym = document.querySelector("#activity-gym");
const activityGymField = document.querySelector("#activity-gym-field");
const activityLocationText = document.querySelector("#activity-location-text");
const activityLocationTextField = document.querySelector("#activity-location-text-field");
const myActivitiesList = document.querySelector("#my-activities-list");
const saveActivityButton = document.querySelector("#save-activity");
const cancelActivityEditButton = document.querySelector("#cancel-activity-edit");
const activitiesHeading = document.querySelector("#activities-heading");

let profileRecord = null;
let localAvatarPreviewUrl = null;
let sportsCatalogue = [];
let userSports = [];
let gymsCatalogue = [];
let userActivities = [];
let activityBeingEdited = null;
let acceptedConnections = [];
let publicProfilesByUser = new Map();
let chatSportsById = new Map();
let activeConnection = null;

function setPanelMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `message ${type}`;
}

function showServicePanel(which) {
  profilePanel.hidden = which !== "profile";
  sportsPanel.hidden = which !== "sports";
  activitiesPanel.hidden = which !== "activities";
  finderPanel.hidden = which !== "finder";
  requestsPanel.hidden = which !== "requests";
  messagesPanel.hidden = which !== "messages";
  if (which === "profile") loadProfile();
  if (which === "sports") loadMySports();
  if (which === "activities") loadMyActivities();
  if (which === "finder") loadPartnerFinder();
  if (which === "requests") loadMyRequests();
  if (which === "messages") loadAcceptedConversations();
  const panel = { profile: profilePanel, sports: sportsPanel, activities: activitiesPanel, finder: finderPanel, requests: requestsPanel, messages: messagesPanel }[which];
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

openProfileButton.addEventListener("click", () => showServicePanel("profile"));
openSportsButton.addEventListener("click", () => showServicePanel("sports"));
openActivitiesButton.addEventListener("click", () => showServicePanel("activities"));
openFinderButton.addEventListener("click", () => showServicePanel("finder"));
openRequestsButton.addEventListener("click", () => showServicePanel("requests"));
openMessagesButton.addEventListener("click", () => showServicePanel("messages"));
document.querySelector("#close-profile").addEventListener("click", () => {
  profilePanel.hidden = true;
});
document.querySelector("#close-sports").addEventListener("click", () => {
  sportsPanel.hidden = true;
});
document.querySelector("#close-activities").addEventListener("click", () => {
  activitiesPanel.hidden = true;
});
document.querySelector("#close-finder").addEventListener("click", () => {
  finderPanel.hidden = true;
});
document.querySelector("#close-requests").addEventListener("click", () => {
  requestsPanel.hidden = true;
});
document.querySelector("#close-messages").addEventListener("click", () => {
  messagesPanel.hidden = true;
});

function currentUser() {
  return pb.authStore.record;
}

const profileAvatarInput = document.querySelector("#profile-avatar");
const profileAvatarPreview = document.querySelector("#profile-avatar-preview");
const profileAvatarInitials = document.querySelector("#profile-avatar-initials");
const profileAboutMe = document.querySelector("#profile-about-me");
const profileAboutCount = document.querySelector("#profile-about-count");

function setProfileAvatarPreview(url, initials = "?") {
  if (localAvatarPreviewUrl) {
    URL.revokeObjectURL(localAvatarPreviewUrl);
    localAvatarPreviewUrl = null;
  }
  profileAvatarPreview.removeAttribute("src");
  profileAvatarPreview.hidden = !url;
  profileAvatarInitials.hidden = Boolean(url);
  profileAvatarInitials.textContent = initials;
  if (url) profileAvatarPreview.src = url;
}

function updateProfileAboutCount() {
  profileAboutCount.textContent = `${profileAboutMe.value.length} / 500`;
}

profileAboutMe.addEventListener("input", updateProfileAboutCount);
profileAvatarInput.addEventListener("change", () => {
  const file = profileAvatarInput.files?.[0];
  if (!file) {
    setProfileAvatarPreview(
      profileRecord?.avatar ? pb.files.getURL(profileRecord, profileRecord.avatar) : "",
      (currentUser()?.name || "?").trim().charAt(0).toUpperCase() || "?"
    );
    return;
  }
  if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
    profileAvatarInput.value = "";
    setPanelMessage(profileMessage, "Choose a JPG, PNG or WebP image up to 5 MB.", "error");
    return;
  }
  if (localAvatarPreviewUrl) URL.revokeObjectURL(localAvatarPreviewUrl);
  localAvatarPreviewUrl = URL.createObjectURL(file);
  profileAvatarPreview.src = localAvatarPreviewUrl;
  profileAvatarPreview.hidden = false;
  profileAvatarInitials.hidden = true;
  setPanelMessage(profileMessage, "Picture preview updated. Save your profile to upload it.");
});

async function loadProfile() {
  const user = currentUser();
  if (!user) return;

  setPanelMessage(profileMessage, "Loading profile…");
  try {
    profileRecord = await pb.collection("sp_user_profiles")
      .getFirstListItem(`user = "${user.id}"`);
    document.querySelector("#profile-birthdate").value =
      profileRecord.birthdate
        ? profileRecord.birthdate.slice(0, 10)
        : "";
    document.querySelector("#profile-sex").value = profileRecord.sex || "";
    document.querySelector("#profile-city").value = profileRecord.city || "";
    document.querySelector("#profile-street").value = profileRecord.street || "";
    document.querySelector("#profile-house-number").value =
      profileRecord.house_number || "";
    profileAboutMe.value = profileRecord.about_me || "";
    updateProfileAboutCount();
    profileAvatarInput.value = "";
    setProfileAvatarPreview(
      profileRecord.avatar ? pb.files.getURL(profileRecord, profileRecord.avatar) : "",
      (user.name || "?").trim().charAt(0).toUpperCase() || "?"
    );
    setPanelMessage(profileMessage, "");
  } catch (error) {
    // A 404 means this user has not created a profile yet.
    if (error.status === 404) {
      profileRecord = null;
      profileForm.reset();
      updateProfileAboutCount();
      profileAvatarInput.value = "";
      setProfileAvatarPreview("", (user.name || "?").trim().charAt(0).toUpperCase() || "?");
      setPanelMessage(profileMessage, "Add your details, then save your profile.");
    } else {
      console.error("Profile load error:", error);
      setPanelMessage(
        profileMessage,
        "Could not load your profile. Check the sp_user_profiles API rules and fields.",
        "error"
      );
    }
  }
}

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = currentUser();
  if (!user) return;

  const saveButton = document.querySelector("#save-profile");
  saveButton.disabled = true;
  setPanelMessage(profileMessage, "Saving…");

  const data = new FormData();
  data.append("user", user.id);
  data.append("birthdate", document.querySelector("#profile-birthdate").value);
  data.append("sex", document.querySelector("#profile-sex").value);
  data.append("city", document.querySelector("#profile-city").value.trim());
  data.append("street", document.querySelector("#profile-street").value.trim());
  data.append("house_number", document.querySelector("#profile-house-number").value.trim());
  data.append("about_me", profileAboutMe.value.trim());
  const avatarFile = profileAvatarInput.files?.[0];
  if (avatarFile) data.append("avatar", avatarFile);

  // Keep optional date/select fields empty instead of submitting invalid values.
  if (!document.querySelector("#profile-birthdate").value) data.delete("birthdate");
  if (!document.querySelector("#profile-sex").value) data.delete("sex");

  try {
    if (profileRecord) {
      profileRecord = await pb.collection("sp_user_profiles")
        .update(profileRecord.id, data);
    } else {
      profileRecord = await pb.collection("sp_user_profiles").create(data);
    }
    profileAvatarInput.value = "";
    setProfileAvatarPreview(
      profileRecord.avatar ? pb.files.getURL(profileRecord, profileRecord.avatar) : "",
      (user.name || "?").trim().charAt(0).toUpperCase() || "?"
    );
    try {
      await syncPublicProfile(user, profileRecord, avatarFile);
      setPanelMessage(profileMessage, "Profile saved successfully.", "success");
    } catch (publicError) {
      console.error("Public profile sync error:", publicError);
      setPanelMessage(profileMessage, "Your private profile was saved, but the public profile could not be updated. Check the sp_public_profiles API rules and migration.", "error");
    }
  } catch (error) {
    console.error("Profile save error:", error);
    setPanelMessage(
      profileMessage,
      error.response?.message ||
        "Could not save the profile. Check the collection fields and API rules.",
      "error"
    );
  } finally {
    saveButton.disabled = false;
  }
});

async function syncPublicProfile(user, privateProfile, newlySelectedAvatar) {
  let publicRecord = null;
  try {
    publicRecord = await pb.collection("sp_public_profiles")
      .getFirstListItem(`user = "${user.id}"`);
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  const data = new FormData();
  data.append("user", user.id);
  data.append("display_name", (user.name || "SportConnect user").trim());
  data.append("city", privateProfile.city || "");
  data.append("about_me", privateProfile.about_me || "");
  data.append("sex", privateProfile.sex || "");
  if (privateProfile.birthdate) data.append("birthdate", privateProfile.birthdate);

  if (newlySelectedAvatar) {
    data.append("avatar", newlySelectedAvatar);
  } else if (privateProfile.avatar && !publicRecord?.avatar) {
    // Copy an existing private avatar to the public-only collection once.
    const response = await fetch(pb.files.getURL(privateProfile, privateProfile.avatar));
    if (!response.ok) throw new Error("Could not copy the profile picture to the public profile.");
    const blob = await response.blob();
    data.append("avatar", new File([blob], privateProfile.avatar, { type: blob.type || "image/jpeg" }));
  }

  if (publicRecord) {
    return pb.collection("sp_public_profiles").update(publicRecord.id, data);
  }
  return pb.collection("sp_public_profiles").create(data);
}

let finderProfiles = [];
let finderActivities = [];
let finderSports = [];
let finderConnections = [];

async function loadPartnerFinder() {
  const user = currentUser();
  if (!user) return;
  finderResults.replaceChildren();
  setPanelMessage(finderMessage, "Loading partners…");
  try {
    const [profiles, activities, sports] = await Promise.all([
      pb.collection("sp_public_profiles").getFullList({ sort: "display_name" }),
      pb.collection("sp_activities").getFullList({
        filter: 'status = "active"', expand: "sport,gym"
      }),
      pb.collection("sp_sports").getFullList({ sort: "name" })
    ]);
    finderProfiles = profiles.filter(profile => profile.user !== user.id);
    finderActivities = activities.filter(activity => activity.user !== user.id);
    finderSports = sports;
    finderSport.replaceChildren();
    const allOption = document.createElement("option");
    allOption.value = ""; allOption.textContent = "All sports";
    finderSport.appendChild(allOption);
    for (const sport of sports) {
      const option = document.createElement("option");
      option.value = sport.id; option.textContent = sport.name;
      finderSport.appendChild(option);
    }
    setPanelMessage(finderMessage, "");
    renderPartnerFinder();
  } catch (error) {
    console.error("Partner finder load error:", error);
    setPanelMessage(finderMessage, "Could not load partner search. Check the sp_public_profiles migration and the read rules for sp_public_profiles, sp_activities and sp_sports.", "error");
    finderResults.replaceChildren();
  }
}

function calculateAge(birthdate) {
  if (!birthdate) return "";
  const date = new Date(`${birthdate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() ||
      (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age--;
  return age >= 0 && age <= 120 ? age : "";
}

function renderPartnerFinder() {
  const sportId = finderSport.value;
  const level = finderLevel.value;
  const city = finderCity.value.trim().toLowerCase();
  const query = finderSearch.value.trim().toLowerCase();
  finderResults.replaceChildren();
  const cards = [];

  for (const profile of finderProfiles) {
    const activities = finderActivities.filter(activity => activity.user === profile.user &&
      (!sportId || activity.sport === sportId) && (!level || activity.level === level));
    if (!activities.length) continue;
    if (city && !(profile.city || "").toLowerCase().includes(city) &&
        !activities.some(a => `${a.location_text || ""} ${a.expand?.gym?.city || ""}`.toLowerCase().includes(city))) continue;
    const sportNames = activities.map(a => a.expand?.sport?.name || finderSports.find(s => s.id === a.sport)?.name || "Sport");
    const searchText = `${profile.display_name || ""} ${profile.about_me || ""} ${profile.city || ""} ${sportNames.join(" ")}`.toLowerCase();
    if (query && !searchText.includes(query)) continue;
    cards.push({ profile, activities, sportNames });
  }

  setPanelMessage(
    finderMessage,
    `Showing ${cards.length} matching partner${cards.length === 1 ? "" : "s"}.`
  );

  if (!cards.length) {
    const empty = document.createElement("p");
    empty.className = "panel-help";
    empty.textContent = "No matching partners found. Try changing or clearing your filters.";
    finderResults.appendChild(empty);
    return;
  }

  for (const { profile, activities } of cards) {
    const card = document.createElement("article");
    card.className = "partner-card";
    const head = document.createElement("div"); head.className = "partner-card-head";
    const avatar = document.createElement("div"); avatar.className = "partner-avatar";
    const initial = (profile.display_name || "?").trim().charAt(0).toUpperCase() || "?";
    if (profile.avatar) {
      const image = document.createElement("img");
      image.alt = `${profile.display_name || "Partner"}'s profile picture`;
      image.src = pb.files.getURL(profile, profile.avatar);
      avatar.appendChild(image);
    } else avatar.textContent = initial;
    const identity = document.createElement("div"); identity.className = "partner-identity";
    const name = document.createElement("h4"); name.textContent = profile.display_name || "SportConnect user";
    const age = calculateAge(profile.birthdate);
    const meta = document.createElement("p"); meta.className = "partner-meta";
    meta.textContent = [age !== "" ? `${age} years old` : "", profile.city || "Location not added", profile.sex || ""].filter(Boolean).join(" · ");
    identity.append(name, meta); head.append(avatar, identity); card.appendChild(head);
    if (profile.about_me) {
      const bio = document.createElement("p"); bio.className = "partner-bio"; bio.textContent = profile.about_me; card.appendChild(bio);
    }
    const activityHeading = document.createElement("h5"); activityHeading.textContent = "Looking to do"; card.appendChild(activityHeading);
    for (const activity of activities) {
      const row = document.createElement("div"); row.className = "partner-activity";
      const details = document.createElement("div"); details.className = "partner-activity-details";
      const sportName = activity.expand?.sport?.name || finderSports.find(s => s.id === activity.sport)?.name || "Sport";
      const title = document.createElement("strong"); title.textContent = sportName;
      const schedule = activity.frequency === "once" ? (activity.activity_date ? activity.activity_date.slice(0, 10) : "One-time") : activity.frequency === "weekly" ? (activity.weekday || "Weekly") : "Flexible schedule";
      const time = activity.start_time ? `${activity.start_time}${activity.end_time ? "–" + activity.end_time : ""}` : "Time flexible";
      const location = activity.expand?.gym ? [activity.expand.gym.name, activity.expand.gym.city].filter(Boolean).join(" · ") : (activity.location_text || "Location to be decided");
      const info = document.createElement("span"); info.textContent = `${activity.level} · ${schedule} · ${time} · ${location}`;
      details.append(title, info); row.appendChild(details);
      const request = document.createElement("button"); request.type = "button"; request.className = "text-button partner-request"; request.textContent = "Send request";
      request.addEventListener("click", async () => {
        request.disabled = true; request.textContent = "Sending…";
        try {
          await pb.collection("sp_connections").create({
            requester: currentUser().id, partner: profile.user, sport: activity.sport,
            status: "pending", message: "Hi! I'd like to connect and do this sport together."
          });
          request.textContent = "Request sent";
          setPanelMessage(finderMessage, `Partner request sent to ${profile.display_name || "this user"}. Open My requests to track its status.`, "success");
        } catch (error) {
          console.error("Partner request error:", error);
          request.disabled = false; request.textContent = "Send request";
          const errors = Object.values(error.response?.data || {}).map(item => item.message).filter(Boolean).join(" ");
          setPanelMessage(finderMessage, errors || "Could not send the request. Check the sp_connections create rule and field names.", "error");
        }
      });
      row.appendChild(request); card.appendChild(row);
    }
    finderResults.appendChild(card);
  }
}

function setRequestStatusBadge(element, status) {
  const badge = document.createElement("span");
  badge.className = `request-status status-${status || "unknown"}`;
  badge.textContent = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  element.appendChild(badge);
}

function appendRequestEmpty(container, text) {
  const empty = document.createElement("p");
  empty.className = "panel-help";
  empty.textContent = text;
  container.appendChild(empty);
}

function makeRequestCard(record, direction, profileByUser, sportById) {
  const user = currentUser();
  const incoming = direction === "incoming";
  const otherUserId = incoming ? record.requester : record.partner;
  const profile = profileByUser.get(otherUserId);
  const otherName = profile?.display_name || "SportConnect member";
  const sport = sportById.get(record.sport)?.name || "Sport";
  const card = document.createElement("article");
  card.className = "connection-card";

  const top = document.createElement("div");
  top.className = "connection-card-top";
  const title = document.createElement("h5");
  title.textContent = incoming ? `Request from ${otherName}` : `Request to ${otherName}`;
  const badgeWrap = document.createElement("div");
  setRequestStatusBadge(badgeWrap, record.status);
  top.append(title, badgeWrap);

  const sportLine = document.createElement("p");
  sportLine.className = "connection-sport";
  sportLine.textContent = sport;
  card.append(top, sportLine);

  if (record.message) {
    const messageText = document.createElement("p");
    messageText.className = "connection-message";
    messageText.textContent = record.message;
    card.appendChild(messageText);
  }

  const actions = document.createElement("div");
  actions.className = "connection-actions";
  if (incoming && record.status === "pending") {
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "request-action request-accept";
    accept.textContent = "Accept";
    accept.addEventListener("click", () => updateRequestStatus(record.id, "accepted", accept, "Accepting…"));
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "request-action request-reject";
    reject.textContent = "Reject";
    reject.addEventListener("click", () => updateRequestStatus(record.id, "rejected", reject, "Rejecting…"));
    actions.append(accept, reject);
  } else if (!incoming && record.status === "pending") {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "text-button";
    cancel.textContent = "Cancel request";
    cancel.addEventListener("click", () => updateRequestStatus(record.id, "cancelled", cancel, "Cancelling…"));
    actions.appendChild(cancel);
  }
  if (actions.childElementCount) card.appendChild(actions);
  return card;
}

async function updateRequestStatus(recordId, status, button, busyText) {
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = busyText;
  setPanelMessage(requestsMessage, "Updating request…");
  try {
    await pb.collection("sp_connections").update(recordId, { status });
    await loadMyRequests();
    setPanelMessage(requestsMessage, `Request ${status}.`, "success");
  } catch (error) {
    console.error("Update partner request error:", error);
    button.disabled = false;
    button.textContent = originalText;
    const details = Object.values(error.response?.data || {})
      .map(item => item.message).filter(Boolean).join(" ");
    setPanelMessage(requestsMessage,
      details || "Could not update this request. Check the sp_connections update rule and status options.",
      "error");
  }
}

async function loadMyRequests() {
  const user = currentUser();
  if (!user) return;

  incomingRequests.replaceChildren();
  sentRequests.replaceChildren();
  setPanelMessage(requestsMessage, "Loading your requests…");

  // Load sent and received records separately. This avoids relying on a
  // combined relation-field OR filter and makes failures easier to diagnose.
  const loadCollection = async (label, collection, options = {}) => {
    try {
      // These reads can run in parallel against the same endpoint (for
      // example, sent and received sp_connections). PocketBase's default
      // auto-cancellation key is based on method + path, so one read may
      // cancel the other even when their filters differ. Disable automatic
      // cancellation for these independent list requests.
      return await pb.collection(collection).getFullList({
        ...options,
        requestKey: null
      });
    } catch (error) {
      console.error(`My Requests: failed to load ${label}`, error);
      const responseMessage = error.response?.message ||
        Object.values(error.response?.data || {})
          .map(item => item.message).filter(Boolean).join(" ");
      throw new Error(
        `${label} could not be loaded (HTTP ${error.status || "?"}). ` +
        (responseMessage || "Check this collection's List/View API rules.")
      );
    }
  };

  try {
    const [sent, received, profiles, sports] = await Promise.all([
      loadCollection(
        "Sent requests",
        "sp_connections",
        { filter: `requester = "${user.id}"` }
      ),
      loadCollection(
        "Received requests",
        "sp_connections",
        { filter: `partner = "${user.id}"` }
      ),
      loadCollection(
        "Public profiles",
        "sp_public_profiles",
        { sort: "display_name" }
      ),
      loadCollection("Sports", "sp_sports", { sort: "name" })
    ]);

    const newestFirst = (a, b) =>
      (b.created || "").localeCompare(a.created || "");
    sent.sort(newestFirst);
    received.sort(newestFirst);

    const profileByUser = new Map(
      profiles.map(profile => [profile.user, profile])
    );
    const sportById = new Map(sports.map(sport => [sport.id, sport]));

    if (received.length) {
      for (const record of received) {
        incomingRequests.appendChild(
          makeRequestCard(record, "incoming", profileByUser, sportById)
        );
      }
    } else {
      appendRequestEmpty(
        incomingRequests,
        "You haven't received any partner requests yet."
      );
    }

    if (sent.length) {
      for (const record of sent) {
        sentRequests.appendChild(
          makeRequestCard(record, "sent", profileByUser, sportById)
        );
      }
    } else {
      appendRequestEmpty(
        sentRequests,
        "You haven't sent any partner requests yet."
      );
    }

    setPanelMessage(
      requestsMessage,
      `${received.length} received · ${sent.length} sent.`
    );
  } catch (error) {
    console.error("Load partner requests error:", error);
    appendRequestEmpty(incomingRequests, "Received requests could not be loaded.");
    appendRequestEmpty(sentRequests, "Sent requests could not be loaded.");
    setPanelMessage(
      requestsMessage,
      error.message ||
        "Could not load requests. Check the sp_connections, " +
        "sp_public_profiles and sp_sports read rules.",
      "error"
    );
  }
}

// One conversation is attached to each accepted partner request.
function otherConnectionUserId(connection, currentUserId = currentUser()?.id) {
  if (!currentUserId) return "";
  return connection.requester === currentUserId
    ? connection.partner
    : connection.requester;
}

function getConnectionDisplayName(connection) {
  const otherUserId = otherConnectionUserId(connection);
  const profile = publicProfilesByUser.get(otherUserId);
  return profile?.display_name || "SportConnect member";
}

function getConnectionSportName(connection) {
  return chatSportsById.get(connection.sport)?.name || "Sport";
}

async function loadAcceptedConversations() {
  const user = currentUser();
  if (!user) return;

  conversationList.replaceChildren();
  setPanelMessage(messagesStatus, "Loading accepted partners…");

  // Load each side of the connection separately. This avoids depending on a
  // combined OR filter and lets the UI name the exact collection that failed.
  const load = async (label, collection, options = {}) => {
    try {
      return await pb.collection(collection).getFullList({
        ...options,
        requestKey: null
      });
    } catch (error) {
      console.error(`Messages: failed to load ${label}`, error);
      const fieldErrors = Object.values(error.response?.data || {})
        .map(item => item.message)
        .filter(Boolean)
        .join(" ");
      const reason = error.response?.message || fieldErrors || error.message ||
        "Check the collection's List/View API rules and filter fields.";
      throw new Error(`${label} failed (HTTP ${error.status || "?"}): ${reason}`);
    }
  };

  try {
    const [sentAccepted, receivedAccepted, profiles, sports] = await Promise.all([
      load("Sent accepted connections", "sp_connections", {
        filter: `requester = "${user.id}" && status = "accepted"`
      }),
      load("Received accepted connections", "sp_connections", {
        filter: `partner = "${user.id}" && status = "accepted"`
      }),
      load("Public profiles", "sp_public_profiles", { sort: "display_name" }),
      load("Sports", "sp_sports", { sort: "name" })
    ]);

    const byId = new Map();
    for (const connection of [...sentAccepted, ...receivedAccepted]) {
      byId.set(connection.id, connection);
    }
    const connections = [...byId.values()].sort((a, b) =>
      (b.updated || b.created || "").localeCompare(a.updated || a.created || "")
    );

    acceptedConnections = connections;
    publicProfilesByUser = new Map(profiles.map(profile => [profile.user, profile]));
    chatSportsById = new Map(sports.map(sport => [sport.id, sport]));

    if (activeConnection && !connections.some(item => item.id === activeConnection.id)) {
      activeConnection = null;
      activeConversationPanel.hidden = true;
      conversationPlaceholder.hidden = false;
    }

    renderConversationList();
    if (!connections.length) {
      const empty = document.createElement("p");
      empty.className = "panel-help conversation-list-empty";
      empty.textContent = "No accepted connections yet. When someone accepts your partner request, you can chat here.";
      conversationList.appendChild(empty);
      setPanelMessage(messagesStatus, "Messaging unlocks after a partner request is accepted.");
      return;
    }

    setPanelMessage(
      messagesStatus,
      `${connections.length} accepted connection${connections.length === 1 ? "" : "s"}. Select one to open the chat.`
    );

    // Keep the existing conversation selected after a manual refresh.
    if (activeConnection) {
      activeConnection = connections.find(item => item.id === activeConnection.id) || null;
      if (activeConnection) await loadConversationMessages();
    }
  } catch (error) {
    console.error("Load accepted conversations error:", error);
    conversationList.replaceChildren();
    const empty = document.createElement("p");
    empty.className = "panel-help";
    empty.textContent = "Accepted partners could not be loaded.";
    conversationList.appendChild(empty);
    setPanelMessage(messagesStatus, error.message ||
      "Could not load accepted partners. Check the collection's List/View API rules.", "error");
  }
}

function renderConversationList() {
  conversationList.replaceChildren();
  for (const connection of acceptedConnections) {
    const otherUserId = otherConnectionUserId(connection);
    const profile = publicProfilesByUser.get(otherUserId);
    const name = profile?.display_name || "SportConnect member";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "conversation-item" +
      (activeConnection?.id === connection.id ? " active" : "");
    button.addEventListener("click", () => openConversation(connection.id));

    const avatar = document.createElement("span");
    avatar.className = "conversation-avatar";
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    if (profile?.avatar) {
      const image = document.createElement("img");
      image.alt = "";
      image.src = pb.files.getURL(profile, profile.avatar);
      avatar.appendChild(image);
    } else {
      avatar.textContent = initial;
    }

    const copy = document.createElement("span");
    copy.className = "conversation-item-copy";
    const nameLine = document.createElement("strong");
    nameLine.textContent = name;
    const sportLine = document.createElement("span");
    sportLine.textContent = getConnectionSportName(connection);
    const openLine = document.createElement("small");
    openLine.textContent = "Open chat →";
    copy.append(nameLine, sportLine, openLine);
    button.append(avatar, copy);
    conversationList.appendChild(button);
  }
}

async function openConversation(connectionId) {
  const connection = acceptedConnections.find(item => item.id === connectionId);
  if (!connection) return;
  activeConnection = connection;
  conversationPlaceholder.hidden = true;
  activeConversationPanel.hidden = false;
  conversationPartnerName.textContent = getConnectionDisplayName(connection);
  conversationSubtitle.textContent = getConnectionSportName(connection) + " · Accepted partner";
  renderConversationList();
  chatMessageInput.focus();
  await loadConversationMessages();
}

function formatChatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

async function loadConversationMessages() {
  const user = currentUser();
  if (!user || !activeConnection) return;
  conversationMessages.replaceChildren();

  try {
    const records = await pb.collection("sp_messages").getFullList({
      filter: `connection = "${activeConnection.id}"`,
      sort: "created",
      requestKey: null
    });

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "conversation-empty";
      empty.textContent = "No messages yet. Say hello and plan your next session!";
      conversationMessages.appendChild(empty);
      return;
    }

    const otherName = getConnectionDisplayName(activeConnection);
    for (const record of records) {
      const ownMessage = record.sender === user.id;
      const row = document.createElement("div");
      row.className = "chat-message-row " + (ownMessage ? "chat-message-row-mine" : "chat-message-row-theirs");
      const bubble = document.createElement("article");
      bubble.className = "chat-message-bubble " + (ownMessage ? "chat-message-mine" : "chat-message-theirs");
      const author = document.createElement("span");
      author.className = "chat-message-author";
      author.textContent = ownMessage ? "You" : otherName;
      const content = document.createElement("p");
      content.className = "chat-message-content";
      content.textContent = record.content || "";
      const time = document.createElement("time");
      time.className = "chat-message-time";
      time.textContent = formatChatTime(record.created);
      if (record.created) time.dateTime = record.created;
      bubble.append(author, content, time);
      row.appendChild(bubble);
      conversationMessages.appendChild(row);
    }
    conversationMessages.scrollTop = conversationMessages.scrollHeight;
  } catch (error) {
    console.error("Load chat messages error:", error);
    const empty = document.createElement("p");
    empty.className = "panel-help";
    empty.textContent = "Messages could not be loaded. Check the sp_messages List/View API rules and confirm its migration ran.";
    conversationMessages.appendChild(empty);
  }
}

chatForm.addEventListener("submit", async event => {
  event.preventDefault();
  const user = currentUser();
  const content = chatMessageInput.value.trim();
  if (!user || !activeConnection || !content) return;

  sendChatMessageButton.disabled = true;
  const previousLabel = sendChatMessageButton.textContent;
  sendChatMessageButton.textContent = "Sending…";

  try {
    await pb.collection("sp_messages").create({
      connection: activeConnection.id,
      sender: user.id,
      content
    }, { requestKey: null });
    chatMessageInput.value = "";
    await loadConversationMessages();
    setPanelMessage(messagesStatus, "Message sent.", "success");
  } catch (error) {
    console.error("Send chat message error:", error);
    const details = error.response?.message ||
      Object.values(error.response?.data || {})
        .map(item => item.message).filter(Boolean).join(" ");
    setPanelMessage(
      messagesStatus,
      details || "Could not send your message. Check the sp_messages create rule and fields.",
      "error"
    );
  } finally {
    sendChatMessageButton.disabled = false;
    sendChatMessageButton.textContent = previousLabel;
    chatMessageInput.focus();
  }
});

refreshConversationButton.addEventListener("click", async () => {
  if (!activeConnection) return;
  refreshConversationButton.disabled = true;
  try {
    await loadConversationMessages();
  } finally {
    refreshConversationButton.disabled = false;
  }
});

finderForm.addEventListener("submit", event => {
  event.preventDefault();
  renderPartnerFinder();
});

// Update results as filters change, and also support the Apply filters button.
for (const filter of [finderSport, finderLevel]) {
  filter.addEventListener("change", renderPartnerFinder);
}
for (const filter of [finderCity, finderSearch]) {
  filter.addEventListener("input", renderPartnerFinder);
}

document.querySelector("#finder-reset").addEventListener("click", () => {
  finderSport.value = "";
  finderLevel.value = "";
  finderCity.value = "";
  finderSearch.value = "";
  renderPartnerFinder();
});

async function loadSportsCatalogue() {
  const sports = await pb.collection("sp_sports").getFullList({ sort: "name" });
  sportsCatalogue = sports;
  sportChoice.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a sport";
  sportChoice.appendChild(placeholder);

  for (const sport of sportsCatalogue) {
    const option = document.createElement("option");
    option.value = sport.id;
    option.textContent = sport.name;
    sportChoice.appendChild(option);
  }
}

async function loadMySports() {
  const user = currentUser();
  if (!user) return;

  setPanelMessage(sportsMessage, "");
  mySportsList.replaceChildren();

  try {
    if (sportsCatalogue.length === 0) {
      await loadSportsCatalogue();
    }
    console.log("Sports catalogue loaded:", sportsCatalogue.length);
    userSports = await pb.collection("sp_user_sports").getFullList({
      filter: `user = "${user.id}"`,
      expand: "sport"
    });

    console.log("My sports records:", userSports);

    userSports.sort((a, b) =>
      (a.expand?.sport?.name || "").localeCompare(
        b.expand?.sport?.name || ""
      )
    );

    renderMySports();
  } catch (error) {
    console.error("Sports load error:", error);
    const p = document.createElement("p");
    p.className = "message error";
    p.textContent =
      "Could not load sports. Check sp_sports and sp_user_sports API rules and fields.";
    mySportsList.appendChild(p);
  }
}

function renderMySports() {
  mySportsList.replaceChildren();

  if (userSports.length === 0) {
    const empty = document.createElement("p");
    empty.className = "panel-help";
    empty.textContent = "You haven't added any sports yet.";
    mySportsList.appendChild(empty);
    return;
  }

  for (const record of userSports) {
    const row = document.createElement("div");
    row.className = "my-sport-row";

    const details = document.createElement("div");
    details.className = "my-sport-details";

    const name = document.createElement("strong");
    name.textContent = record.expand?.sport?.name || "Sport";

    const level = document.createElement("span");
    const levelLabels = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      pro: "Pro"
    };
    level.textContent = levelLabels[record.level] || record.level || "Level not set";

    details.append(name, level);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "text-button remove-sport";
    remove.textContent = "Remove";
    remove.addEventListener("click", async () => {
      if (!confirm(`Remove ${name.textContent} from your sports?`)) return;
      remove.disabled = true;
      try {
        await pb.collection("sp_user_sports").delete(record.id);
        await loadMySports();
      } catch (error) {
        console.error("Remove sport error:", error);
        setPanelMessage(
          sportsMessage,
          "Could not remove this sport. Check the sp_user_sports delete rule.",
          "error"
        );
        remove.disabled = false;
      }
    });

    row.append(details, remove);
    mySportsList.appendChild(row);
  }
}

sportsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = currentUser();
  if (!user) return;

  const sportId = sportChoice.value;
  const level = document.querySelector("#sport-level").value;
  if (!sportId) {
    setPanelMessage(sportsMessage, "Please choose a sport.", "error");
    return;
  }

  const alreadyAdded = userSports.some(record =>
    record.sport === sportId || record.expand?.sport?.id === sportId
  );
  if (alreadyAdded) {
    setPanelMessage(sportsMessage, "You've already added this sport.", "error");
    return;
  }

  const addButton = document.querySelector("#add-sport");
  addButton.disabled = true;
  setPanelMessage(sportsMessage, "Adding sport…");

  try {
    await pb.collection("sp_user_sports").create({
      user: user.id,
      sport: sportId,
      level
    });
    setPanelMessage(sportsMessage, "Sport added successfully.", "success");
    await loadMySports();
  } catch (error) {
    console.error("Add sport error:", error);
    setPanelMessage(
      sportsMessage,
      error.response?.message ||
        "Could not add this sport. Check the sp_user_sports fields and API rules.",
      "error"
    );
  } finally {
    addButton.disabled = false;
  }
});

// Load the sports catalogue when the dashboard opens, so the service is ready.
const originalShowDashboard = showDashboard;
showDashboard = function () {
  originalShowDashboard();
  loadSportsCatalogue().catch(error => {
    console.error("Sports catalogue load error:", error);
  });
};



// Activities describe when a user wants to do a sport, not general availability.
async function loadGymsCatalogue() {
  gymsCatalogue = await pb.collection("sp_gyms").getFullList({ sort: "name" });
  activityGym.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a registered gym";
  activityGym.appendChild(placeholder);
  for (const gym of gymsCatalogue) {
    const option = document.createElement("option");
    option.value = gym.id;
    option.textContent = [gym.name, gym.city].filter(Boolean).join(" — ");
    activityGym.appendChild(option);
  }
}

function updateActivityScheduleFields() {
  const frequency = activityFrequency.value;
  activityDateField.hidden = frequency !== "once";
  activityWeekdayField.hidden = frequency !== "weekly";
  activityDate.required = frequency === "once";
  activityWeekday.required = frequency === "weekly";
}

function updateActivityLocationFields() {
  const type = activityLocationType.value;
  activityGymField.hidden = type !== "gym";
  activityLocationTextField.hidden = type !== "public";
  activityGym.required = type === "gym";
  activityLocationText.required = type === "public";
}

function updateActivityLevelFromSport() {
  const id = activitySport.value;
  const record = userSports.find(item => item.sport === id || item.expand?.sport?.id === id);
  if (record) activityLevel.value = record.level || "beginner";
}

function resetActivityForm() {
  activityBeingEdited = null;
  activitiesForm.reset();
  activitiesHeading.textContent = "My activities";
  saveActivityButton.textContent = "Save activity";
  cancelActivityEditButton.hidden = true;
  updateActivityScheduleFields();
  updateActivityLocationFields();
  updateActivityLevelFromSport();
}

async function loadMyActivities() {
  const user = currentUser();
  if (!user) return;
  setPanelMessage(activitiesMessage, "");
  myActivitiesList.replaceChildren();
  try {
    if (sportsCatalogue.length === 0) await loadSportsCatalogue();
    userSports = await pb.collection("sp_user_sports").getFullList({
      filter: `user = "${user.id}"`, expand: "sport"
    });
    userSports.sort((a, b) => (a.expand?.sport?.name || "").localeCompare(b.expand?.sport?.name || ""));
    activitySport.replaceChildren();
    const first = document.createElement("option");
    first.value = "";
    first.textContent = userSports.length ? "Choose one of your sports" : "Add a sport in My sports first";
    activitySport.appendChild(first);
    for (const item of userSports) {
      const id = item.sport || item.expand?.sport?.id;
      const name = item.expand?.sport?.name || sportsCatalogue.find(s => s.id === id)?.name || "Sport";
      if (!id) continue;
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      option.dataset.level = item.level || "beginner";
      activitySport.appendChild(option);
    }
    if (gymsCatalogue.length === 0) await loadGymsCatalogue();
    userActivities = await pb.collection("sp_activities").getFullList({
      filter: `user = "${user.id}"`, expand: "sport,gym"
    });
    updateActivityScheduleFields();
    updateActivityLocationFields();
    updateActivityLevelFromSport();
    renderMyActivities();
  } catch (error) {
    console.error("Activities load error:", error);
    const p = document.createElement("p");
    p.className = "message error";
    p.textContent = "Could not load activities. Check sp_activities, sp_user_sports, and sp_gyms API rules and fields.";
    myActivitiesList.appendChild(p);
  }
}

function renderMyActivities() {
  myActivitiesList.replaceChildren();
  if (!userActivities.length) {
    const p = document.createElement("p");
    p.className = "panel-help";
    p.textContent = "You haven't created any activities yet.";
    myActivitiesList.appendChild(p);
    return;
  }
  const frequencies = { once: "One-time", weekly: "Weekly", flexible: "Flexible" };
  const levels = { beginner: "Beginner", intermediate: "Intermediate", pro: "Pro" };
  for (const record of userActivities) {
    const row = document.createElement("div"); row.className = "my-sport-row";
    const details = document.createElement("div"); details.className = "my-sport-details";
    const title = document.createElement("strong");
    const sportName = record.expand?.sport?.name || sportsCatalogue.find(s => s.id === record.sport)?.name || "Sport";
    title.textContent = sportName;
    const info = document.createElement("span");
    const schedule = record.frequency === "once" ? (record.activity_date ? record.activity_date.slice(0, 10) : "Date not set") : record.frequency === "weekly" ? (record.weekday || "Day not set") : "Schedule flexible";
    const time = record.start_time ? `${record.start_time}${record.end_time ? "–" + record.end_time : ""}` : "Time flexible";
    const gymName = record.expand?.gym?.name || gymsCatalogue.find(g => g.id === record.gym)?.name;
    info.textContent = `${frequencies[record.frequency] || record.frequency} · ${levels[record.level] || record.level} · ${schedule} · ${time} · ${gymName || record.location_text || "Location flexible"}`;
    details.append(title, info);
    const actions = document.createElement("div"); actions.className = "activity-actions";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "text-button"; edit.textContent = "Edit";
    edit.addEventListener("click", () => startEditingActivity(record));
    const del = document.createElement("button"); del.type = "button"; del.className = "text-button remove-sport"; del.textContent = "Delete";
    del.addEventListener("click", async () => {
      if (!confirm(`Delete your ${sportName} activity?`)) return;
      del.disabled = true;
      try {
        await pb.collection("sp_activities").delete(record.id);
        if (activityBeingEdited?.id === record.id) resetActivityForm();
        await loadMyActivities();
      } catch (error) {
        console.error("Delete activity error:", error);
        setPanelMessage(activitiesMessage, "Could not delete this activity. Check the sp_activities delete rule.", "error");
        del.disabled = false;
      }
    });
    actions.append(edit, del); row.append(details, actions); myActivitiesList.appendChild(row);
  }
}

function startEditingActivity(record) {
  activityBeingEdited = record;
  activitiesHeading.textContent = "Edit activity";
  saveActivityButton.textContent = "Save changes";
  cancelActivityEditButton.hidden = false;
  activitySport.value = record.sport || "";
  updateActivityLevelFromSport();
  activityLevel.value = record.level || activityLevel.value;
  activityFrequency.value = record.frequency || "flexible";
  activityDate.value = record.activity_date ? record.activity_date.slice(0, 10) : "";
  activityWeekday.value = record.weekday || "";
  activityStartTime.value = record.start_time || "";
  activityEndTime.value = record.end_time || "";
  if (record.gym) {
    activityLocationType.value = "gym"; activityGym.value = record.gym; activityLocationText.value = "";
  } else if (record.location_text) {
    activityLocationType.value = "public"; activityGym.value = ""; activityLocationText.value = record.location_text;
  } else {
    activityLocationType.value = "flexible"; activityGym.value = ""; activityLocationText.value = "";
  }
  updateActivityScheduleFields(); updateActivityLocationFields();
  setPanelMessage(activitiesMessage, "Editing activity. Save changes when ready.");
  activitiesForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

activitySport.addEventListener("change", updateActivityLevelFromSport);
activityFrequency.addEventListener("change", updateActivityScheduleFields);
activityLocationType.addEventListener("change", updateActivityLocationFields);
cancelActivityEditButton.addEventListener("click", resetActivityForm);

activitiesForm.addEventListener("submit", async event => {
  event.preventDefault();
  const user = currentUser(); if (!user) return;
  const frequency = activityFrequency.value;
  const locationType = activityLocationType.value;
  const data = {
    user: user.id, sport: activitySport.value, level: activityLevel.value,
    frequency,
    activity_date: frequency === "once" ? activityDate.value : "",
    weekday: frequency === "weekly" ? activityWeekday.value : "",
    start_time: activityStartTime.value, end_time: activityEndTime.value,
    gym: locationType === "gym" ? activityGym.value : "",
    location_text: locationType === "public" ? activityLocationText.value.trim() : "",
    status: "active"
  };
  if (!data.sport) return setPanelMessage(activitiesMessage, "Choose one of your sports first.", "error");
  if (frequency === "once" && !data.activity_date) return setPanelMessage(activitiesMessage, "Choose a date for a one-time activity.", "error");
  if (frequency === "weekly" && !data.weekday) return setPanelMessage(activitiesMessage, "Choose a weekday for a weekly activity.", "error");
  if (data.start_time && data.end_time && data.end_time <= data.start_time) return setPanelMessage(activitiesMessage, "The end time must be later than the start time.", "error");
  if (locationType === "gym" && !data.gym) return setPanelMessage(activitiesMessage, "Choose a registered gym or select another location option.", "error");
  if (locationType === "public" && !data.location_text) return setPanelMessage(activitiesMessage, "Enter a public place or area.", "error");
  for (const field of ["activity_date", "weekday", "start_time", "end_time", "gym", "location_text"]) if (!data[field]) delete data[field];
  saveActivityButton.disabled = true;
  setPanelMessage(activitiesMessage, activityBeingEdited ? "Saving changes…" : "Saving activity…");
  try {
    if (activityBeingEdited) {
      await pb.collection("sp_activities").update(activityBeingEdited.id, data);
      setPanelMessage(activitiesMessage, "Activity updated successfully.", "success");
    } else {
      await pb.collection("sp_activities").create(data);
      setPanelMessage(activitiesMessage, "Activity created successfully.", "success");
    }
    resetActivityForm();
    await loadMyActivities();
  } catch (error) {
    console.error("Save activity error:", error);
    const errors = Object.values(error.response?.data || {}).map(item => item.message).filter(Boolean).join(" ");
    setPanelMessage(activitiesMessage, errors || "Could not save the activity. Check the sp_activities fields and API rules.", "error");
  } finally { saveActivityButton.disabled = false; }
});
