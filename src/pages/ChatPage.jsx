import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Smile } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ChatPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { chatUsername } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
  };

  const lottieEmojiMap = {
    '❤️': 'https://lottie.host/8da54823-3908-4663-9545-037e90958814/P33a7n2N1Q.lottie',
    '😂': 'https://lottie.host/2787688a-b461-4993-9549-105068427549/Q4a2QvD1pU.lottie',
    '👍': 'https://lottie.host/a3f654b2-3831-48a6-9f88-4286663f7073/fJp8rSj2Xg.lottie',
    '😏': 'https://lottie.host/06fb3f9d-e3fa-4074-8ba1-207ca2fd66d7/WnH6OIVa0a.lottie',
  };

  const renderMessage = (text) => {
    const emoji = text.trim();
    if (lottieEmojiMap[emoji]) {
      return <DotLottieReact src={lottieEmojiMap[emoji]} loop autoplay style={{ width: 100, height: 100 }} />;
    }
    return <p>{text}</p>;
  };


  useEffect(() => {
    const fetchMessages = async () => {
      // This is a bit tricky since we don't have a dedicated endpoint for a specific chat
      // We'll filter from the general messages endpoint
      try {
        const res = await fetch('/api/messages', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const { data } = await res.json();
          const chatMessages = data.filter(msg =>
            (msg.sender && msg.sender.username === chatUsername) || (msg.recipient && msg.recipient.username === chatUsername)
          );
          setMessages(chatMessages.reverse()); // reverse to show oldest first
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users/${chatUsername}`);
            if(res.ok){
                const {data} = await res.json();
                setOtherUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user", error)
        }
    }

    if (currentUser) {
      fetchMessages();
      fetchUser();
    }
  }, [chatUsername, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      recipientUsername: chatUsername,
      text: newMessage,
    };

    try {
      // The API will determine the sender from the token
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData),
      });

      if (res.ok) {
        const {data: newMessageData} = await res.json();
        // The sender info should come back from the API
        setMessages([...messages, newMessageData]);
        setNewMessage('');
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Chat with {otherUser.username} - {t('wanz_req')}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-[calc(100vh-80px)] glassmorphism m-4 rounded-lg"
      >
        <CardHeader className="flex flex-row items-center gap-3 border-b">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dm">
              <ArrowLeft />
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src={otherUser.profilePicture} />
            <AvatarFallback>{otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle>{otherUser.username}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.senderUsername === currentUser.username ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-lg max-w-xs ${msg.senderUsername === currentUser.username ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {renderMessage(msg.text)}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t">
          {showEmojiPicker && (
            <div className="absolute bottom-20">
              <Picker data={data} onEmojiSelect={addEmoji} />
            </div>
          )}
          <div className="relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('type_a_message')}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} size="icon" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Smile className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage} size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatPage;
