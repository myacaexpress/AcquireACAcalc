"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';

interface PodcastWidgetProps {
  audioSrc: string;
  title?: string;
  className?: string;
}

const PodcastWidget: React.FC<PodcastWidgetProps> = ({ 
  audioSrc, 
  title = "ACA Enrollment Guidelines and Resources for 2025",
  className 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);

  // Firebase Storage works well for large files, so we don't need special handling
  const isLargeFile = false;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset states when audioSrc changes
    setHasError(false);
    setErrorMessage('');
    setIsLoading(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Force load metadata for Firebase Storage URLs
    audio.load();

    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
      setIsLoading(false);
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', e);
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
      setErrorMessage('Audio file could not be loaded. Please try again or download the file.');
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleStalled = () => {
      console.warn('Audio loading stalled');
      // Don't set loading to false here, let other events handle it
    };

    const handleSuspend = () => {
      console.warn('Audio loading suspended');
      // Don't change loading state here
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setHasError(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioSrc]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      try {
        // Force load the audio if it hasn't been loaded yet
        if (audio.readyState === 0) {
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error playing audio:', error);
        setHasError(true);
        setIsPlaying(false);
        setErrorMessage('Failed to play audio. The file may be too large or unavailable.');
        setIsLoading(false);
      }
    }
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If we have duration, seek normally
    if (duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } else if (audio.seekable.length > 0) {
      // For streaming audio, try to seek within the buffered range
      const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
      const newTime = (value[0] / 100) * seekableEnd;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = title + '.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Show special UI for large files
  if (isLargeFile) {
    return (
      <Card className={`shadow-lg border-2 border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3 text-center">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 mb-2">
                📁 Large Audio File (85MB)
              </p>
              <p className="text-xs text-amber-700 mb-3">
                This file is too large for web streaming due to CORS restrictions. Choose an option below:
              </p>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full text-xs"
                  size="sm"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Download Audio File (85MB)
                </Button>
                <Button
                  onClick={() => window.open('https://example.com/podcast', '_blank')}
                  variant="outline"
                  className="w-full text-xs"
                  size="sm"
                >
                  🎧 Listen on Podcast Platform
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg border-2 border-primary/20 ${className}`}>
      <CardContent className="p-3">
        {/* Audio Element */}
        <audio 
          ref={audioRef} 
          preload="metadata"
        >
          <source src={audioSrc} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>

        {/* Compact Layout */}
        <div className="flex flex-col space-y-2">
          {/* Title Row */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {hasError && (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause Button */}
              <Button
                onClick={togglePlayPause}
                disabled={hasError}
                size="sm"
                className="rounded-full w-8 h-8"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 ml-0.5" />
                )}
              </Button>

              {/* Playback Speed */}
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => handlePlaybackRateChange(0.75)}
                  variant={playbackRate === 0.75 ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  0.75x
                </Button>
                <Button
                  onClick={() => handlePlaybackRateChange(1)}
                  variant={playbackRate === 1 ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  1x
                </Button>
                <Button
                  onClick={() => handlePlaybackRateChange(1.25)}
                  variant={playbackRate === 1.25 ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  1.25x
                </Button>
                <Button
                  onClick={() => handlePlaybackRateChange(1.5)}
                  variant={playbackRate === 1.5 ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  1.5x
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Volume Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-16"
                />
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="p-1 h-6 w-6"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodcastWidget;
