// DOM Elements
const loginContainer = document.getElementById("login-container")
const registerContainer = document.getElementById("register-container")
const appContainer = document.getElementById("app-container")
const showRegisterLink = document.getElementById("show-register")
const showLoginLink = document.getElementById("show-login")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const logoutBtn = document.getElementById("logout-btn")
const userNameElement = document.getElementById("user-name")

// Add these functions after the DOM Elements section
function togglePasswordVisibility(inputId) {
  const passwordInput = document.getElementById(inputId)
  const type = passwordInput.type === "password" ? "text" : "password"
  passwordInput.type = type
}

// Show notification function
function showNotification(message, type) {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type} show`

  setTimeout(() => {
    notification.className = notification.className.replace("show", "")
  }, 3000)
}

// Toggle between login and register forms
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault()
  loginContainer.classList.add("hidden")
  registerContainer.classList.remove("hidden")
})

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault()
  registerContainer.classList.add("hidden")
  loginContainer.classList.remove("hidden")
})

// Register user
registerForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value

  // Get existing users or initialize empty array
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    showNotification("Email already registered", "error")
    return
  }

  // Create new user
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password, // Note: In a real app, you should hash passwords!
    transactions: [],
  }

  // Add user to array and save to localStorage
  users.push(user)
  localStorage.setItem("users", JSON.stringify(users))

  // Auto login after registration
  sessionStorage.setItem("currentUser", JSON.stringify(user))

  showNotification("Registration successful!", "success")
  registerForm.reset()

  // Show app and update UI
  updateAppUI(user)
})

// Login user
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Find user with matching credentials
  const user = users.find((user) => user.email === email && user.password === password)

  if (user) {
    // Store current user in sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(user))

    showNotification("Login successful!", "success")
    loginForm.reset()

    // Show app and update UI
    updateAppUI(user)
  } else {
    showNotification("Invalid email or password", "error")
  }
})

// Logout user
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("currentUser")
  appContainer.classList.add("hidden")
  loginContainer.classList.remove("hidden")
  showNotification("Logged out successfully", "success")
})

// Update application UI with user data
function updateAppUI(user) {
  userNameElement.textContent = `Welcome, ${user.name}`

  // Hide auth containers and show app
  loginContainer.classList.add("hidden")
  registerContainer.classList.add("hidden")
  appContainer.classList.remove("hidden")

  // Update transactions UI
  updateTransactionUI()
}

// Check if user is logged in on page load
window.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))

  if (currentUser) {
    updateAppUI(currentUser)
  }
})

// Function to save transaction for current user
function saveTransaction(transaction) {
  // Get current user
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))

  if (!currentUser) {
    showNotification("You must be logged in to add transactions", "error")
    return false
  }

  // Get all users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Find current user in the users array
  const userIndex = users.findIndex((user) => user.id === currentUser.id)

  if (userIndex === -1) {
    showNotification("User not found", "error")
    return false
  }

  // Add transaction to user's transactions
  if (!users[userIndex].transactions) {
    users[userIndex].transactions = []
  }

  users[userIndex].transactions.push(transaction)

  // Update local and session storage
  localStorage.setItem("users", JSON.stringify(users))
  sessionStorage.setItem("currentUser", JSON.stringify(users[userIndex]))

  return true
}

// Function to delete transaction
function deleteTransaction(transactionId) {
  // Get current user
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))

  if (!currentUser) {
    showNotification("You must be logged in to delete transactions", "error")
    return false
  }

  // Get all users
  const users = JSON.parse(localStorage.getItem("users")) || []

  // Find current user in the users array
  const userIndex = users.findIndex((user) => user.id === currentUser.id)

  if (userIndex === -1) {
    showNotification("User not found", "error")
    return false
  }

  // Filter out the transaction to delete
  users[userIndex].transactions = users[userIndex].transactions.filter(
    (transaction) => transaction.id !== transactionId,
  )

  // Update local and session storage
  localStorage.setItem("users", JSON.stringify(users))
  sessionStorage.setItem("currentUser", JSON.stringify(users[userIndex]))

  return true
}

// Get current user's transactions
function getUserTransactions() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"))
  return currentUser && currentUser.transactions ? currentUser.transactions : []
}

// Add event listeners after other event listeners
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.getAttribute("data-for")
    togglePasswordVisibility(inputId)
    const icon = button.querySelector("i")
    icon.classList.toggle("fa-eye")
    icon.classList.toggle("fa-eye-slash")
  })
})

