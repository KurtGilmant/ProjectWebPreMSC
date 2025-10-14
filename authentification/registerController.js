document
  .getElementById("registerForm")
  .addEventListener("submit", handleNewUser);

async function handleNewUser(event) {
  event.preventDefault();

  const name = event.target.name.value;
  const email = event.target.email.value;
  const password = event.target.password.value;
  const role = event.target.role.value;
  const resume = event.target.resume.value;

  const checkUser = await fetch("http://localhost:3000/User/check-exists/" + name);
  const checkUserJSON = await checkUser.json();

  if (checkUserJSON.exists) {
    alert("Username already exists. Please choose another one.");
    return;
  }

  await fetch("http://localhost:3000/User", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      full_name: name,
      role: role,
      resume: resume,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }
      console.log("Réponse du serveur:", data);
      alert("Registration successful!");
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
      alert("Registration failed: " + error.message);
    });
}
