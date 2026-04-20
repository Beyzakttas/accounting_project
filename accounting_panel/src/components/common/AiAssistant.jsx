import React, { useState, useRef, useEffect } from 'react';
import { askAiAssistant } from '../../services/aiService';
import { RobotIcon, CloseIcon } from './Icons';
import '../../assets/css/AiAssistant.css';

const AiAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Merhaba! Ben Muhasebe AI asistanıyım. Finansal verilerinizle ilgili size nasıl yardımcı olabilirim?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await askAiAssistant(userMessage);
            if (response.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.data }]);
            }
        } catch (error) {
            console.error('Asistan hatası:', error);
            const errorMsg = error.message || 'Şu an bağlantı kuramıyorum. Lütfen API anahtarınızı ve internetinizi kontrol edin.';
            setMessages(prev => [...prev, { role: 'assistant', content: `Üzgünüm, bir hata oluştu: ${errorMsg}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`ai-assistant-wrapper ${isOpen ? 'active' : ''}`}>
            {/* Floating Button */}
            <button 
                className="ai-fab" 
                onClick={() => setIsOpen(!isOpen)}
                title="AI Asistana Sor"
            >
                {isOpen ? <CloseIcon size={24} /> : <RobotIcon size={28} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window glass-card">
                    <div className="ai-chat-header">
                        <div className="ai-avatar">AI</div>
                        <div className="ai-header-info">
                            <h3>Finansal Asistan</h3>
                            <span>Çevrimiçi</span>
                        </div>
                        <button 
                            className="ai-close-window-btn" 
                            onClick={() => setIsOpen(false)}
                            title="Kapat"
                        >
                            <CloseIcon size={18} />
                        </button>
                    </div>

                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-bubble ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-bubble assistant loading">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-chat-input" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Bir soru sorun..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim() || isLoading}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;
