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
  // Check if we're dealing with the large audio file
  const isLargeFile = audioSrc.includes('aca-enrollment-guidelines-2025.wav');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset states when audioSrc changes
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const handleLoadedMetadata = () => {
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
      setErrorMessage('Audio file could not be loaded. The file may be too large or unavailable.');
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleStalled = () => {
      console.warn('Audio loading stalled');
      setErrorMessage('Audio loading is taking longer than expected...');
    };

    const handleSuspend = () => {
      console.warn('Audio loading suspended');
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

    // Set a timeout for loading
    const loadTimeout = setTimeout(() => {
      if (isLoading && !hasError) {
        setHasError(true);
        setIsLoading(false);
        setErrorMessage('Audio loading timed out. The file may be too large or unavailable.');
      }
    }, 30000); // 30 second timeout

    // Force load the audio
    audio.load();

    return () => {
      clearTimeout(loadTimeout);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
    };
  }, [audioSrc]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
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

  // If it's the large file, show alternative content
  if (isLargeFile) {
    return (
      <Card className={`shadow-lg border-2 border-primary/20 ${className}`}>
        <CardContent className="p-3">
          <div className="flex flex-col space-y-3 text-center">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                📁 Audio file is too large for web streaming (85MB)
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                For the best experience, please download the audio file or access it via external platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleDownload}
                  variant="default"
                  size="sm"
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download Audio (85MB)
                </Button>
                <Button
                  onClick={() => window.open('https://example.com/podcast', '_blank')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Listen on Platform
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
        <audio ref={audioRef} preload="metadata">
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
              disabled={isLoading || duration === 0}
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
                disabled={isLoading || hasError}
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
