import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Phone, Heart, Smile, ArrowLeft, Video, ImageIcon } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CallInterface } from '@/components/MessagingComponents/CallInterface';
import { FileUpload, FilePreview } from '@/components/MessagingComponents/FileUpload';

export default function MessagesPage() {
  const { user } = useAuth();
  const { 
    conversations, 
    isLoadingConversations, 
    useConversationMessages, 
    sendMessage, 
    isSendingMessage 
  } = useMessaging();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | 'camera' | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    isIncoming: boolean;
    callerName: string;
    isActive: boolean;
  } | null>(null);

  const messagesQuery = useConversationMessages(selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await sendMessage({
        conversationId: selectedConversation,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (file: File, type: 'image' | 'file' | 'camera') => {
    setSelectedFile(file);
    setFileType(type);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation) return;
    
    setUploadingFile(true);
    try {
      // Here we would upload the file to cloud storage and get URL
      // For now, we'll simulate the process
      const fileMessage = {
        conversationId: selectedConversation,
        content: selectedFile.name,
        message_type: fileType === 'image' || fileType === 'camera' ? 'image' : 'file',
        file_url: URL.createObjectURL(selectedFile), // Temporary URL for demo
        file_name: selectedFile.name,
        file_size: selectedFile.size
      };
      
      await sendMessage(fileMessage);
      handleRemoveFile();
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!selectedConversationData) return;
    
    setActiveCall({
      type,
      isIncoming: false,
      callerName: selectedConversationData.other_user_name || selectedConversationData.other_user_email,
      isActive: true
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleAcceptCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, isActive: true });
    }
  };

  const handleRejectCall = () => {
    setActiveCall(null);
  };

  const selectedConversationData = conversations.find((c: any) => c.id === selectedConversation);

  if (isLoadingConversations) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 h-[600px]">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3`}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages ({conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune conversation</p>
                    <p className="text-sm">Contactez un vendeur depuis la carte pour commencer</p>
                  </div>
                ) : (
                  conversations.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.other_user_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.other_user_name || conversation.other_user_email}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {conversation.product_title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message || 'Nouvelle conversation'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(conversation.last_message_time), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        {selectedConversation ? (
          <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} w-full lg:w-2/3`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {selectedConversationData?.other_user_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {selectedConversationData?.other_user_name || selectedConversationData?.other_user_email}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversationData?.product_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('audio')}
                      title="Appel audio"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('video')}
                      title="Appel vidéo"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                  {messagesQuery.isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-pulse text-gray-500">Chargement des messages...</div>
                    </div>
                  ) : messagesQuery.data?.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Commencez la conversation</p>
                    </div>
                  ) : (
                    messagesQuery.data?.map((message: any) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.message_type === 'image' && message.file_url ? (
                              <div className="mb-2">
                                <img 
                                  src={message.file_url} 
                                  alt={message.file_name || 'Image'}
                                  className="max-w-full h-auto rounded border"
                                />
                                {message.file_name && (
                                  <p className="text-xs mt-1 opacity-80">{message.file_name}</p>
                                )}
                              </div>
                            ) : message.message_type === 'file' && message.file_url ? (
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4" />
                                <div>
                                  <p className="text-sm font-medium">{message.file_name}</p>
                                  {message.file_size && (
                                    <p className="text-xs opacity-80">
                                      {(message.file_size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatDistanceToNow(new Date(message.created_at), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="border-t p-4">
                    <FilePreview
                      file={selectedFile}
                      onRemove={handleRemoveFile}
                      onSend={handleSendFile}
                      uploading={uploadingFile}
                    />
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      disabled={isSendingMessage || uploadingFile}
                    />
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSendingMessage || uploadingFile}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSendingMessage || uploadingFile}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="hidden lg:flex w-2/3 items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
              <p>Choisissez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Interface Overlay */}
      {activeCall && (
        <CallInterface
          isIncoming={activeCall.isIncoming}
          callerName={activeCall.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          onEnd={handleEndCall}
          callType={activeCall.type}
          isActive={activeCall.isActive}
        />
      )}
    </div>
  );
}

// Also export as named export for compatibility
export { MessagesPage as Messages };