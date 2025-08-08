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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {callerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{callerName}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Appel {callType === 'video' ? 'vidéo' : 'audio'} entrant...
            </p>
          </div>
          
          <div className="flex justify-center space-x-6">
            <Button
              onClick={onReject}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16 p-0"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
            <Button
              onClick={onAccept}
              variant="default"
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-8 h-8" />
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
        <div className="bg-black/80 p-6">
          <div className="flex justify-center items-center space-x-6">
            {/* Mute button */}
            <Button
              onClick={handleToggleMute}
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 p-0",
                isMuted ? "bg-red-600 hover:bg-red-700 border-red-600" : "bg-gray-600 hover:bg-gray-700"
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
              className="rounded-full w-16 h-16 p-0"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}