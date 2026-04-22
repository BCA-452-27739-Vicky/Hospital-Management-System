import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageCircle, X, Send, Mic } from "lucide-react";
import "./GeminiChatbot.css";


// API KEY 
const API_KEY = "AIzaSyCakQ_3Q5C5ZJCjNiSdMM7XwIlhWcQMEQA";

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Namaste! Main aapki kya madad kar sakta hoon? 😊",
      
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Gemini AI correctly
  const genAI = new GoogleGenerativeAI(API_KEY); // initialization
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get the model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Prepare chat history
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Start chat with history
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const prompt = `${input} (Please reply in Hinglish - mix of Hindi and English. Keep it concise and helpful for hospital patients.)`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const botText = response.text();

      setMessages((prev) => [...prev, { text: botText, sender: "bot" }]);
      
      // Text to speech
      speakText(botText);

    } catch (error) {
      console.error("Error details:", error);
      setMessages((prev) => [
        ...prev,
        { 
          text: "Sorry, main abhi available nahi hoon. Kuch der baad try karein. 🙏", 
          sender: "bot" 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Input
  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Aapka browser voice support nahi karta. Please Chrome ya Edge use karein.");
        return;
      }

      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "hi-IN"; 

          recognition.onstart = () => {
            setIsListening(true);
            console.log("Listening started...");
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            console.log("Recognized:", transcript);
          };

          recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsListening(false);
            if (event.error === "not-allowed") {
              alert("Microphone permission nahi mili. Please permission dein.");
            }
          };

          recognition.onend = () => {
            setIsListening(false);
            console.log("Listening ended");
          };

          recognition.start();
        })
        .catch((err) => {
          console.error("Microphone error:", err);
          alert("Microphone access nahi ho paya. Please settings check karein.");
        });
    } catch (error) {
      console.error("Voice recognition error:", error);
      alert("Voice recognition start nahi ho paya.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakText = (text) => {
    try {
      if (!window.speechSynthesis) {
        console.log("Speech synthesis not supported");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "hi-IN";
      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;

      // Get available voices
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(voice => voice.lang.includes("hi"));
        if (hindiVoice) {
          speech.voice = hindiVoice;
        }
      };

      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("Speech error:", error);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="chatbot-toggle-btn"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="online-dot"></div>
              <span>🏥 Hospital Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="close-btn"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
              >
                <div className={`bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <span>🤔</span> Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <div className="input-container">
              <button 
                onClick={isListening ? stopListening : startListening}
                className={`icon-btn ${isListening ? "active" : ""}`}
                title={isListening ? "Stop listening" : "Start voice input"}
                disabled={isLoading}
              >
                <Mic size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="input-field"
                disabled={isLoading}
              />

              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="icon-btn send-btn"
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChatbot;