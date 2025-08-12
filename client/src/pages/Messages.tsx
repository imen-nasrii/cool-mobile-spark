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
      
      // Auto-send product photo if this is the first message in the conversation
      await handleAutoSendProductPhoto();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAutoSendProductPhoto = async () => {
    if (!selectedConversationData?.product_image_url || !selectedConversation) return;
    
    try {
      // Check if this is one of the first few messages (auto-send product photo logic)
      const messageCount = messagesQuery.data?.length || 0;
      if (messageCount <= 2) { // Send product photo in first few messages
        await sendMessage({
          conversationId: selectedConversation,
          content: `Voici le produit dont nous discutons: ${selectedConversationData.product_title}`
        });
      }
    } catch (error) {
      console.error('Error auto-sending product photo:', error);
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex gap-6 h-[600px]">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3`}>
          <Card className="h-full glass-card border-0 modern-shadow hover:modern-shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="font-bold">Messages ({conversations.length})</span>
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
                      className={`p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.02] ${
                        selectedConversation === conversation.id ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-blue-500 modern-shadow' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex items-center gap-2">
                          {/* User Avatar */}
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-3 border-white modern-shadow hover:scale-110 transition-transform duration-300">
                              {conversation.other_user_avatar_url ? (
                                <img 
                                  src={conversation.other_user_avatar_url} 
                                  alt={conversation.other_user_name || 'Avatar'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                                  {conversation.other_user_name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                          </div>
                          
                          {/* Product Image */}
                          {conversation.product_image_url && (
                            <div className="relative">
                              <div className="w-10 h-10 rounded-lg border-2 border-white bg-white overflow-hidden modern-shadow hover:scale-110 transition-transform duration-300">
                                <img 
                                  src={conversation.product_image_url} 
                                  alt={conversation.product_title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border border-white flex items-center justify-center">
                                <span className="text-xs text-white font-bold" style={{fontSize: '8px'}}>P</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm truncate bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                                {conversation.other_user_name || conversation.other_user_email}
                              </p>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            </div>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 modern-shadow">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 mb-1 font-semibold">
                            📦 {conversation.product_title}
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
            <Card className="h-full flex flex-col glass-card border-0 modern-shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-white/20">
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
                    <div className="relative flex items-center gap-3">
                      {/* User Avatar */}
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-3 border-white modern-shadow hover:scale-110 transition-transform duration-300">
                          {selectedConversationData?.other_user_avatar_url ? (
                            <img 
                              src={selectedConversationData.other_user_avatar_url} 
                              alt={selectedConversationData.other_user_name || 'Avatar'}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {selectedConversationData?.other_user_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white"></div>
                      </div>
                      
                      {/* Product Image */}
                      {selectedConversationData?.product_image_url && (
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl border-3 border-white bg-white overflow-hidden modern-shadow hover:scale-110 transition-transform duration-300">
                            <img 
                              src={selectedConversationData.product_image_url} 
                              alt={selectedConversationData.product_title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-white font-bold">P</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {selectedConversationData?.other_user_name || selectedConversationData?.other_user_email}
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        💬 À propos de: <span className="text-blue-600 font-semibold">{selectedConversationData?.product_title}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('audio')}
                      title="Appel audio"
                      className="glass-card border-0 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStartCall('video')}
                      title="Appel vidéo"
                      className="glass-card border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-white to-blue-50/30">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] relative">
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
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-3 group`}>
                          {!isOwn && (
                            <Avatar className="h-8 w-8 mb-1 border-2 border-white modern-shadow group-hover:scale-110 transition-transform duration-300">
                              {message.sender_avatar_url ? (
                                <img 
                                  src={message.sender_avatar_url} 
                                  alt={message.sender_name || 'Avatar'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                                  {(message.sender_name || message.sender_email || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl modern-shadow group-hover:modern-shadow-lg transition-all duration-300 message-bubble ${
                            isOwn 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'glass-card bg-white text-gray-900'
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
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100 hover:text-blue-100' : 'text-gray-500 hover:text-gray-500'}`}>
                              {formatDistanceToNow(new Date(message.created_at), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </p>
                          </div>
                          {isOwn && (
                            <Avatar className="h-8 w-8 mb-1 border-2 border-white shadow-sm">
                              {user?.avatar_url ? (
                                <img 
                                  src={user.avatar_url} 
                                  alt={user.display_name || 'Mon avatar'}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs font-semibold">
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

                {/* Message Input */}
                <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="glass-card border-0 bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 modern-shadow hover:scale-110 transition-all duration-300">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="glass-card border-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 modern-shadow hover:scale-110 transition-all duration-300">
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
                        className="glass-card border-0 rounded-full modern-shadow focus:modern-shadow-lg transition-all duration-300"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSendingMessage || uploadingFile}
                        className="glass-card border-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300 rounded-full w-12 h-12 p-0"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Product context indicator */}
                  {selectedConversationData?.product_title && (
                    <div className="mt-3 p-4 glass-card border-0 rounded-2xl modern-shadow bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
                      <div className="flex items-center gap-4">
                        {selectedConversationData.product_image_url && (
                          <div className="relative">
                            <img 
                              src={selectedConversationData.product_image_url} 
                              alt={selectedConversationData.product_title}
                              className="w-16 h-16 rounded-xl object-cover modern-shadow hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-white font-bold">📦</span>
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700 mb-1">💬 Discussion à propos de:</p>
                          <p className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedConversationData.product_title}</p>
                        </div>
                      </div>
                    </div>
                  )}
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