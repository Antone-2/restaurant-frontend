import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            text: "Hi there! Welcome to The Quill. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickReplies = [
        "Menu & Prices",
        "Opening Hours",
        "Make a Reservation",
        "Order for Delivery",
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");

        // Simulate bot response
        setTimeout(() => {
            const botResponse = getBotResponse(inputText);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: botResponse,
                    sender: "bot",
                    timestamp: new Date(),
                },
            ]);
        }, 1000);
    };

    const handleQuickReply = (text: string) => {
        setInputText(text);
        setTimeout(() => handleSend(), 100);
    };

    const getBotResponse = (input: string): string => {
        const lower = input.toLowerCase();
        if (lower.includes("menu") || lower.includes("price")) {
            return "Our menu features delicious dishes from Ksh 250-950. Check out our Starters, Main Dishes, Drinks, and Specials! Would you like to see our full menu?";
        }
        if (lower.includes("hour") || lower.includes("open")) {
            return "We're open 24 hours a day, 7 days a week! Perfect for any meal time.";
        }
        if (lower.includes("reservation") || lower.includes("book")) {
            return "You can make a reservation through our Order page or call us at 0113 857846. How many guests will be joining?";
        }
        if (lower.includes("delivery") || lower.includes("order")) {
            return "We offer delivery services! You can place your order through our Order page or call us directly. Delivery fees may apply.";
        }
        if (lower.includes("location") || lower.includes("where")) {
            return "We're located at B1, C4XP+MH Korinda along the Korinda corridor. Easy to find with ample parking!";
        }
        return "Thank you for your message! Our team will get back to you shortly. For urgent orders, please call us at 0113 857846.";
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="bg-background rounded-xl shadow-2xl w-80 h-96 mb-4 flex flex-col border animate-scale-in">
                    {/* Header */}
                    <div className="bg-primary text-primary-foreground p-4 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <div>
                                <h3 className="font-semibold text-sm">The Quill Assistant</h3>
                                <p className="text-xs text-primary-foreground/70">Online now</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/20">
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`flex gap-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-primary" : "bg-muted"}`}>
                                        {msg.sender === "user" ? <User size={12} className="text-primary-foreground" /> : <Bot size={12} />}
                                    </div>
                                    <div className={`p-2 rounded-lg text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1">
                            {quickReplies.map((reply) => (
                                <button
                                    key={reply}
                                    onClick={() => handleQuickReply(reply)}
                                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t flex gap-2">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button size="icon" onClick={handleSend} className="rounded-full bg-primary">
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Chat Button */}
            <Button onClick={() => setIsOpen(!isOpen)} className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg">
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </Button>
        </div>
    );
};

export default ChatWidget;
