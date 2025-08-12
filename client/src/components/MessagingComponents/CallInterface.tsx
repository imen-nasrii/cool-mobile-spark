import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallInterfaceProps {
  isIncoming?: boolean;
  callerName?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  callType: 'audio' | 'video';
  isActive?: boolean;
}

export function CallInterface({
  isIncoming = false,
  callerName = '',
  onAccept,
  onReject,
  onEnd,
  callType,
  isActive = false
}: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute/unmute functionality
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // TODO: Implement actual video on/off functionality
  };

  if (isIncoming && !isActive) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/90 to-blue-900/80 backdrop-blur-lg flex items-center justify-center z-50">
        <div className="glass-card border-0 rounded-3xl p-8 max-w-sm w-full mx-4 text-center modern-shadow-lg animate-float">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center modern-shadow-lg animate-pulse">
              <span className="text-3xl font-bold text-white">
                {callerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{callerName}</h3>
            <p className="text-gray-600 text-lg">
              Appel {callType === 'video' ? 'vidéo' : 'audio'} entrant...
            </p>
          </div>
          
          <div className="flex justify-center space-x-8">
            <Button
              onClick={onReject}
              variant="destructive"
              size="lg"
              className="rounded-full w-20 h-20 p-0 glass-card border-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
            >
              <PhoneOff className="w-10 h-10" />
            </Button>
            <Button
              onClick={onAccept}
              variant="default"
              size="lg"
              className="rounded-full w-20 h-20 p-0 glass-card border-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
            >
              <Phone className="w-10 h-10" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video container */}
        {callType === 'video' && (
          <div className="flex-1 relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Local video */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            
            {/* Call info overlay */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
              <p className="font-medium">{callerName}</p>
              <p className="text-sm">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Audio call interface */}
        {callType === 'audio' && (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {callerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{callerName}</h3>
              <p className="text-lg opacity-80">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Call controls */}
        <div className="glass-card bg-black/90 p-8 border-0 backdrop-blur-xl">
          <div className="flex justify-center items-center space-x-8">
            {/* Mute button */}
            <Button
              onClick={handleToggleMute}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-16 h-16 p-0 glass-card border-0 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300",
                isMuted ? "bg-gradient-to-r from-red-500 to-red-600 text-white" : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
              )}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {/* Video toggle (only for video calls) */}
            {callType === 'video' && (
              <Button
                onClick={handleToggleVideo}
                variant="outline"
                size="lg"
                className={cn(
                  "rounded-full w-14 h-14 p-0",
                  !isVideoOn ? "bg-red-600 hover:bg-red-700 border-red-600" : "bg-gray-600 hover:bg-gray-700"
                )}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
            )}

            {/* End call button */}
            <Button
              onClick={onEnd}
              variant="destructive"
              size="lg"
              className="rounded-full w-20 h-20 p-0 glass-card border-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 modern-shadow hover:modern-shadow-lg hover:scale-110 transition-all duration-300"
            >
              <PhoneOff className="w-10 h-10" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}