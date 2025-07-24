import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const DmPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const { data } = await res.json();
          // This is a simplified grouping. A more robust solution might be needed.
          const grouped = data.reduce((acc, msg) => {
            const otherUser = msg.sender ? msg.sender.username : 'Anonymous';
            if (!acc[otherUser]) {
              acc[otherUser] = {
                user: msg.sender || { username: 'Anonymous', profilePicture: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${otherUser}` },
                messages: []
              };
            }
            acc[otherUser].messages.push(msg);
            return acc;
          }, {});

          const convos = Object.values(grouped).map(convo => ({
            ...convo,
            lastMessage: convo.messages[0], // Assumes messages are sorted by date
          }));
          setConversations(convos);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };

    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  const handleStartNewChat = (user) => {
    navigate(`/dm/${user.username}`);
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>{t('direct_messages')} - {t('wanz_req')}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glassmorphism m-4">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>{t('direct_messages')}</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <PlusCircle />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a new chat</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search for a user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div key={user.id} onClick={() => handleStartNewChat(user)} className="p-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold">{user.username}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map(convo => (
              <Link to={`/dm/${convo.user.username}`} key={convo.user.username} className="p-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={convo.user.profilePicture} />
                  <AvatarFallback>{convo.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{convo.user.username.startsWith('Anonymous') ? 'Anonymous' : convo.user.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default DmPage;
