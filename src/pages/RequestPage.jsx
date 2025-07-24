import React, { useState, useEffect } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { useToast } from '@/components/ui/use-toast';
    import { Paperclip, Link as LinkIcon, Send, UserX, Home } from 'lucide-react';
    import { sendLocalNotification } from '@/utils/notifications';
import Swal from 'sweetalert2';
    
    const RequestPage = () => {
      const { username } = useParams();
      const { t } = useTranslation();
      const { toast } = useToast();
      const [user, setUser] = useState(null);
      const [message, setMessage] = useState('');
      const [link, setLink] = useState('');
      const [image, setImage] = useState(null);
      const [imagePreview, setImagePreview] = useState('');
      const [isLoading, setIsLoading] = useState(true);
      const [isSending, setIsSending] = useState(false);
    
      useEffect(() => {
        const fetchUser = async () => {
          try {
            const res = await fetch(`/api/users/${username}`);
            if (res.ok) {
              const { data } = await res.json();
              setUser(data);
            } else {
              setUser(null);
            }
          } catch (error) {
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        };
        fetchUser();
      }, [username]);
    
      const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImage(file);
          setImagePreview(URL.createObjectURL(file));
          toast({ title: "Image selected. Ready for upload!" });
        }
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
          toast({ variant: 'destructive', title: "Message cannot be empty." });
          return;
        }

        setIsSending(true);
        try {
          const body = {
            recipientUsername: user.username,
            text: message,
            link,
            image: imagePreview, // In a real app, you'd upload the image and send the URL
          };
          const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            Swal.fire({
              title: 'Pesan berhasil terkirim!',
              text: 'Pesan Anda telah berhasil dikirim ke ' + user.username,
              icon: 'success',
              confirmButtonText: 'OK'
            });
            setMessage('');
            setLink('');
            setImage(null);
            setImagePreview('');
          } else {
            const errorData = await res.json();
            toast({
              variant: 'destructive',
              title: 'Error',
              description: errorData.message || 'Failed to send message.',
            });
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred.',
          });
        } finally {
          setIsSending(false);
        }
      };
    
      if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
      }
    
      if (!user) {
        return (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Card className="w-full max-w-md text-center glassmorphism">
              <CardHeader>
                <div className="mx-auto bg-destructive/20 p-3 rounded-full w-fit">
                  <UserX className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="text-2xl mt-4">User Not Found</CardTitle>
                <CardDescription>The user profile you are looking for does not exist.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please check the username and try again.</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      }
    
      return (
        <>
          <Helmet>
            <title>{t('send_a_message')} {user.username} - {t('wanz_req')}</title>
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Card className="w-full max-w-lg glassmorphism">
              <CardHeader className="items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl break-words">{user.requestTitle}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                  <textarea
                    id="message"
                    placeholder={t('message_placeholder')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                  <div className="grid gap-2">
                    <Label htmlFor="link"><LinkIcon className="inline-block mr-2 h-4 w-4" />{t('view_link')} (Optional)</Label>
                    <Input id="link" type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image-upload"><Paperclip className="inline-block mr-2 h-4 w-4" />{t('upload_image')} (Optional)</Label>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="rounded-md max-h-40 mx-auto" />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSending}>
                    {isSending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Send className="mr-2 h-4 w-4" /> {t('send')}</>}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </>
      );
    };
    
    export default RequestPage;