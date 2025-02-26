document.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-btn");
  const chatTitle = document.getElementById("chat-title");
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-sidebar");
  const botButtons = document.querySelectorAll(".bot-select");

  let selectedBot = "business";
  const bots = {
    "business": "You are a Business Assistant that helps with automation and workflow optimization.",
    "ecommerce": "You are an E-commerce Helper that recommends products and assists with sales.",
    "customer_support": "You handle Customer Support and provide answers to common questions.",
    "real_estate": "You are a Real Estate Agent AI that assists clients with buying and selling homes."
  };

  // Initialize with welcome message
  appendMessage("Bot", "Hello! I'm your Business Assistant. How can I help you today?", "bot-message");

  // Toggle Sidebar
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("show");
  });

  // Bot Selection - Fix event handling
  botButtons.forEach(button => {
    button.addEventListener("click", function() {
      const bot = this.getAttribute("data-bot");
      selectBot(bot);
    });
  });

  function selectBot(bot) {
    selectedBot = bot;
    const botName = bot.replace("_", " ");
    chatTitle.innerText = `Chat with ${botName.charAt(0).toUpperCase() + botName.slice(1)}`;
    
    // Clear chat and add welcome message
    chatBox.innerHTML = "";
    appendMessage("Bot", `Hello! I'm your ${botName.charAt(0).toUpperCase() + botName.slice(1)}. How can I help you today?`, "bot-message");
    
    sidebar.classList.remove("show"); // Close sidebar after selecting a bot
  }

  // Send Message
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    let userText = userInput.value.trim();
    if (userText === "") return;

    appendMessage("You", userText, "user-message");
    userInput.value = "";

    // Show loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "bot-message loading";
    loadingIndicator.innerHTML = "<span>.</span><span>.</span><span>.</span>";
    chatBox.appendChild(loadingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Disable send button during API call
    sendButton.disabled = true;

    try {
      let response = await getChatGPTResponse(userText);
      chatBox.removeChild(loadingIndicator);
      appendMessage("Bot", response, "bot-message");
    } catch (error) {
      chatBox.removeChild(loadingIndicator);
      appendMessage("Bot", "Sorry, I'm having trouble responding right now. Please try again later.", "bot-message");
      console.error("API Error:", error);
    } finally {
      sendButton.disabled = false;
      userInput.focus();
    }
  }

  function appendMessage(sender, message, className) {
    let messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", className);
    
    let senderElement = document.createElement("div");
    senderElement.classList.add("sender");
    senderElement.innerText = sender;
    
    let contentElement = document.createElement("div");
    contentElement.classList.add("content");
    contentElement.innerText = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
    chatBox.appendChild(messageElement);

    // Apply Fade-in Animation
    messageElement.style.opacity = 0;
    setTimeout(() => (messageElement.style.opacity = 1), 50);

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Fetch AI Response via the server-side proxy
  async function getChatGPTResponse(userMessage) {
    const apiUrl = "/api/chat"; // This calls our local proxy endpoint

    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: bots[selectedBot] },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500, // Increased from 100 for more complete responses
      temperature: 0.7 // Added for more varied responses
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const responseData = await response.json();
      return responseData.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error in API call:", error);
      throw error;
    }
  }
});
