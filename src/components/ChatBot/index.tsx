import OpenAI from "openai";
import { useRef, useState } from "react";
interface Message {
  role: string;
  content: string;
}
function isBotMessage(message: Message) {
  return message.role === "assistant";
}

export default function ChatBot() {
  const [apiKey, setApiKey] = useState("");
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [messages, setMessages] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const openaiRef = useRef<OpenAI | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = {
      role: "user",
      content: messages,
    };
    const botWaitingMessage = {
      role: "assistant",
      content: "waiting bot answer",
    };
    const history = [...historyMessages, userMessage, botWaitingMessage];
    setHistoryMessages(history);
    setMessages("");
    try {
      const chatCompletion = await openaiRef.current?.chat.completions.create({
        messages: [...historyMessages, userMessage],
        model: "gemma2-9b-it",
      });
      const response = chatCompletion?.choices[0].message?.content;
      const botMessage = {
        role: "assistant",
        content: response,
      };
      setHistoryMessages([...historyMessages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const validateApiKey = async () => {
    if (apiKey.trim() !== "") {
      setIsKeyValid(true);
      openaiRef.current = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
    } else {
      alert("Please enter a valid API key");
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ChatUI với React + OpenAI</h1>
        {!isKeyValid ? (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="p-2 border border-gray-300 rounded-l w-full mb-2"
            />
            <button
              onClick={validateApiKey}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Validate API Key
            </button>
          </div>
        ) : (
          <>
            <form className="flex" onSubmit={handleSubmit}>
              <input
                type="text"
                value={messages}
                placeholder="Tin nhắn của bạn..."
                onChange={(e) => setMessages(e.target.value)}
                className="flex-grow p-2 rounded-l border border-gray-300"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Gửi tin nhắn
              </button>
            </form>
            <div className="flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
              {historyMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    isBotMessage(message) ? "text-right" : ""
                  }`}
                >
                  <p className="text-gray-600 text-sm">
                    {isBotMessage(message) ? "Bot" : "User"}
                  </p>
                  <p
                    className={`p-2 rounded-lg inline-block ${
                      isBotMessage(message) ? "bg-green-100" : "bg-blue-100"
                    }  `}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
