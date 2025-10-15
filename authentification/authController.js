// Example: Store access token after login
export let accessToken = null;

const errorLoginMessage = document.getElementById("errorLogin");
document.getElementById("loginForm").addEventListener("submit", handleLogin);

async function handleLogin(event) {
  event.preventDefault();

  const name = event.target.loginName.value;
  const password = event.target.loginPassword.value;

  try {
    const checkUser = await fetch("http://localhost:3000/User/find-user/" + name)
    var checkUserJSON = await checkUser.json()
    
  } catch (error) {
    console.error("Erreur lors de la requête:", error);
    errorLoginMessage.innerHTML = "User don't exist";
    return;
  }
  
  try {
    const tryLogin = await fetch("http://localhost:3000/User/login", {
      method: "POST",
      credentials: "include",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        hashedPassword: checkUserJSON["password"],
        name:checkUserJSON["full_name"]
      }),
    })
    var tryLoginJSON = await tryLogin.json()
    if(tryLoginJSON["success"]){
      console.log("User connected")
      errorLoginMessage.innerHTML = tryLoginJSON["message"];
      setAccessToken(tryLoginJSON["accessToken"]);
    } else {
      console.log("Wrong password");
      errorLoginMessage.innerHTML = "Wrong password";
      return;
    }
  } catch (error){
    console.error("Erreur lors de la requête:", error);
    return;
  }
}

export function setAccessToken(token) {
  accessToken = token;
}

export function getNameFromToken() {
  console.log('accessToken:', accessToken); // Debug line
  if (!accessToken) return null;
  
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    console.log('payload:', payload); // Debug line
    return payload.name;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
