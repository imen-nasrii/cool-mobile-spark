import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      const fileMessage = {
        conversationId: selectedConversation,
        content: selectedFile.name,
        message_type: fileType === 'image' || fileType === 'camera' ? 'image' : 'file',
        file_url: URL.createObjectURL(selectedFile),
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white">
      <div className="flex gap-6 h-[600px]">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3`}>
          <Card className="h-full border border-gray-300">
            <CardHeader className="bg-red-500 text-white">
              <CardTitle className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5" />
                <span className="font-bold">Messages ({conversations.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune conversation</p>
                    <p className="text-sm">Contactez un vendeur pour commencer</p>
                  </div>
                ) : (
                  conversations.map((conversation: any) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-100 ${
                        selectedConversation === conversation.id ? 'bg-red-50 border-l-4 border-red-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            {conversation.other_user_avatar_url ? (
                              <img 
                                src={conversation.other_user_avatar_url} 
                                alt={conversation.other_user_name || 'Avatar'}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <AvatarFallback className="bg-red-500 text-white font-bold">
                                {conversation.other_user_name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-black">
                              {conversation.other_user_name || conversation.other_user_email}
                            </h3>
                          </div>
                          <p className="text-sm text-red-600 mb-1 font-semibold">
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
          <div className="w-full lg:w-2/3">
            <Card className="h-full border border-gray-300">
              <CardHeader className="pb-3 bg-white border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {selectedConversationData?.other_user_avatar_url ? (
                          <img 
                            src={selectedConversationData.other_user_avatar_url} 
                            alt={selectedConversationData.other_user_name || 'Avatar'}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-red-500 text-white font-bold">
                            {selectedConversationData?.other_user_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-black">
                          {selectedConversationData?.other_user_name || selectedConversationData?.other_user_email}
                        </h3>
                        <p className="text-sm text-gray-600">
                          À propos de: <span className="text-red-600 font-semibold">{selectedConversationData?.product_title}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('audio')}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('video')}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 bg-white">
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
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                          {!isOwn && (
                            <Avatar className="h-8 w-8 mb-1">
                              {message.sender_avatar_url ? (
                                <img 
                                  src={message.sender_avatar_url} 
                                  alt={message.sender_name || 'Avatar'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <AvatarFallback className="bg-red-500 text-white text-xs font-bold">
                                  {(message.sender_name || message.sender_email || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg border ${
                            isOwn 
                              ? 'bg-red-500 text-white border-red-500' 
                              : 'bg-white text-black border-gray-300'
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
                            <p className={`text-xs mt-1 ${isOwn ? 'text-red-100' : 'text-gray-500'}`}>
                              {formatDistanceToNow(new Date(message.created_at), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </p>
                          </div>
                          {isOwn && (
                            <Avatar className="h-8 w-8 mb-1">
                              {user?.avatar_url ? (
                                <img 
                                  src={user.avatar_url} 
                                  alt={user.display_name || 'Mon avatar'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <AvatarFallback className="bg-red-500 text-white text-xs font-semibold">
                                  {(user?.display_name || user?.email || 'M').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
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

                {/* Quick Response Suggestions */}
                <div className="border-t p-3 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Pouvez-vous me donner votre localisation exacte ?")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      📍 Localisation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Pouvons-nous prendre rendez-vous pour voir le produit ?")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      📅 Rendez-vous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Quel est votre meilleur prix ?")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      💰 Prix
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Le produit est-il encore disponible ?")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      ✅ Disponibilité
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Pouvez-vous m'envoyer plus de photos ?")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      📸 Photos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewMessage("Merci beaucoup !")}
                      className="text-xs bg-white hover:bg-red-50 border border-red-200 text-red-700"
                    >
                      🙏 Merci
                    </Button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="border-gray-300 text-red-500 hover:bg-red-50">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-red-500 hover:bg-red-50">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      disabled={isSendingMessage || uploadingFile}
                    />
                    <div className="flex-1 flex gap-3">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSendingMessage || uploadingFile}
                        className="border-gray-300"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSendingMessage || uploadingFile}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Send className="h-5 w-5" />
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