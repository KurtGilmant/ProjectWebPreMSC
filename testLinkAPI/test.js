import {
  accessToken,
  setAccessToken,
  getNameFromToken,
} from "../authentification/authController.js";

async function userAction() {
  var result = "";

  const paragraph = document.getElementById("demo");
  var response = await fetch("http://localhost:3000/User", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  console.log(response.status + " First request");
  if (response.status == 401 || response.status == 403) {
    // Try to refresh the access token
    const refreshRes = await fetch("http://localhost:3000/User/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      // Retry original request with new token
      const userName = getNameFromToken(); // Move this line after setAccessToken
      response = await fetch(
        "http://localhost:3000/User",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.status + " Second request");
    } else {
      console.error("Failed to refresh token");
    }
  }

  const userName = getNameFromToken();
  var response = await fetch("http://localhost:3000/User/find-user/" + userName, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const myJson = await response.json();
  const skillUser = await fetch(
    "http://localhost:3000/User_Skills/" + myJson["user_id"]
  );
  const skillJson = await skillUser.json();
  console.log(skillJson);
  for (let i = 0; i < skillJson.length; i++) {
    var specificSkill = await fetch(
      "http://localhost:3000/Skills/" + skillJson[i]["skill_id"]
    );
    var specificJson = await specificSkill.json();
    console.log(specificJson);
    result += specificJson["name"] + ", ";
  }
  paragraph.innerHTML =
    "Salut je m'appelle : " +
    myJson["full_name"] +
    " et mes compétences sont :" +
    result;
}

window.userAction = userAction;
