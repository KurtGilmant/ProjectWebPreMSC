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
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        hashedPassword: checkUserJSON["password"],
      }),
    })
    var tryLoginJSON = await tryLogin.json()
    if(tryLoginJSON["success"]){
      console.log("User connected")
      errorLoginMessage.innerHTML = "You are connected !";
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


