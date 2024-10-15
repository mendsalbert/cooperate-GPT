import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  Upload,
  Plus,
  Trash,
  Copy,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconBrandOpenai, IconBrandGoogleFilled } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTypewriter } from "react-simple-typewriter";

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Model {
  _id: string;
  name: string;
  provider: string;
}

const GenerateContentContent: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { data: session } = useSession() as any;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [text] = useTypewriter({
    words: [typingText],
    loop: 1,
    typeSpeed: 20,
    deleteSpeed: 50,
    delaySpeed: 1000,
    onLoopDone: () => {
      setIsTyping(false);
    },
  });

  useEffect(() => {
    fetchChats();
    fetchModels();
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await axios.get("/api/queries", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setChats(response.data.data);
      // If there's a current chat, load its messages
      if (currentChat) {
        const currentChatData = response.data.data.find(
          (chat: Chat) => chat._id === currentChat
        );
        if (currentChatData) {
          setMessages(currentChatData.messages);
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchModels = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await axios.get("/api/models", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setModels(response.data);
      if (response.data.length > 0) {
        setSelectedModel(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedModel) return;
    setIsLoading(true);
    setIsAIProcessing(true);
    const newMessage: Message = {
      role: "user",
      content: input || "File uploaded",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      const formData = new FormData();
      formData.append("text", input);
      formData.append("modelId", selectedModel);
      if (currentChat) {
        formData.append("chatId", currentChat);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post("/api/queries", formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const chatData = response.data.data;
      setMessages(chatData.messages);
      setCurrentChat(chatData._id);

      // Update the chats list with the new or updated chat
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat._id === chatData._id
        );
        if (chatIndex !== -1) {
          // Update existing chat
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = chatData;
          return updatedChats;
        } else {
          // Add new chat
          return [chatData, ...prevChats];
        }
      });

      const aiResponse =
        chatData.messages[chatData.messages.length - 1].content;
      setTypingText(aiResponse);
      setIsTyping(true);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessage = "An error occurred while processing your request.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsAIProcessing(false);
      setSelectedFile(null);
    }
  };

  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return <IconBrandOpenai className="w-5 h-5 text-green-500" />;
      case "Gemini":
        return <IconBrandGoogleFilled className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here to inform the user that the text has been copied
  };

  const renderMessage = (message: Message, index: number) => {
    return (
      <div
        key={index}
        className={`mb-4 ${
          message.role === "user" ? "text-right" : "text-left"
        }`}
      >
        <div
          className={`inline-block p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {message.role === "assistant" ? (
            <>
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(message.content)}
                className="mt-2"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </>
          ) : (
            message.content
          )}
        </div>
      </div>
    );
  };

  const loadChat = (chatId: string) => {
    const selectedChat = chats.find((chat) => chat._id === chatId);
    if (selectedChat) {
      setCurrentChat(chatId);
      setMessages(selectedChat.messages || []);
    } else {
      console.error("Chat not found:", chatId);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!session?.accessToken) return;
    try {
      console.log("Attempting to delete chat with ID:", chatId);
      const response = await axios.delete(`/api/queries/${chatId}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      console.log("Delete response:", response.data);
      setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));
      if (currentChat === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Backend error:", error.response.data);
        alert(
          `Error deleting chat: ${
            error.response.data.error || "An unknown error occurred"
          }`
        );
      } else {
        alert("An error occurred while deleting the chat");
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <Button onClick={startNewChat} className="w-full mb-4">
          <Plus className="w-4 h-4 mr-2" /> New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-180px)]">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-lg mb-2 ${
                currentChat === chat._id ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex-1" onClick={() => loadChat(chat._id)}>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">{chat.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat._id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Model Selection */}
        <div className="p-4 border-b border-gray-200">
          <Select
            value={selectedModel || undefined}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model._id} value={model._id}>
                  <div className="flex items-center">
                    {getProviderIcon(model.provider)}
                    <span className="ml-2">{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages && messages.length > 0 ? (
            messages.map((message, index) => renderMessage(message, index))
          ) : (
            <div className="text-center text-gray-500">No messages yet</div>
          )}
          {isTyping && (
            <div className="mb-4 text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {isAIProcessing && !isTyping && (
            <div className="mb-4 text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                AI is processing your request...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 mr-2"
              disabled={isAIProcessing}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              disabled={isAIProcessing}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mr-2"
              disabled={isAIProcessing}
            >
              {selectedFile ? (
                <Trash
                  className="w-4 h-4 text-red-500"
                  onClick={() => setSelectedFile(null)}
                />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedModel || isAIProcessing}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-500">
              Selected file: {selectedFile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateContentContent;
