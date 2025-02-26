document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");
    const chatTitle = document.getElementById("chat-title");
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggle-sidebar");

    let selectedBot = "business";
    const bots = {
        "business": "You are a Business Assistant that helps with automation and workflow optimization.",
        "ecommerce": "You are an E-commerce Helper that recommends products and assists with sales.",
        "customer_support": "You handle Customer Support and provide answers to common questions.",
        "real_estate": "You are a Real Estate Agent AI that assists clients with buying and selling homes."
    };

    // ✅ Toggle Sidebar
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("show");
    });

    // ✅ Switch Chatbot & Retract Sidebar
    window.selectBot = function (bot) {
        selectedBot = bot;
        chatTitle.innerText = `Chat with ${bot.replace("_", " ").toUpperCase()}`;
        chatBox.innerHTML += `<p class="bot-message">You are now talking to the ${bot.replace("_", " ")} bot.</p>`;
        sidebar.classList.remove("show"); // Close sidebar after selecting a bot
    };

    // ✅ Send Message
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });

    async function sendMessage() {
        let userText = userInput.value.trim();
        if (userText === "") return;

        appendMessage("You", userText, "user-message");
        userInput.value = "";

        try {
            let response = await getChatGPTResponse(userText);
            appendMessage("Bot", response, "bot-message");
        } catch (error) {
            appendMessage("Bot", "Sorry, I'm having trouble responding right now.", "bot-message");
            console.error(error);
        }
    }

    function appendMessage(sender, message, className) {
        let messageElement = document.createElement("p");
        messageElement.classList.add("chat-message", className);
        messageElement.innerText = `${sender}: ${message}`;
        chatBox.appendChild(messageElement);

        // ✅ Apply Fade-in Animation
        messageElement.style.opacity = 0;
        setTimeout(() => messageElement.style.opacity = 1, 50);

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // ✅ Fetch AI Response from OpenAI
    async function getChatGPTResponse(userMessage) {
        const API_KEY = "sk-8arWWGdtbBYrjv7FO2aHPjCWJ_c1HGk7gw9SFCsYMhT3BlbkFJBvQ6a-pfqwi4LOcaluOHnKbpBV94bXRp-XCYvmCBgA"; // 🔹 Replace with your actual API key
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        const requestData = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: bots[selectedBot] },
                { role: "user", content: userMessage }
            ],
            max_tokens: 100,
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        const responseData = await response.json();
        return responseData.choices[0].message.content.trim();
    }
});
