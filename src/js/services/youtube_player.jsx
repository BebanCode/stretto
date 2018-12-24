import * as React from 'react';
import { Button } from 'react-bootstrap';
import getHistory from 'react-router-global-history'; 
import Alerter from './alerter';

let readyPromise;
let readyResolve;

export default class YoutubePlayer {
  constructor(song, options = {}) {
    if (options.autoPlay === undefined) options.autoPlay = true;
    options.currentTime = options.currentTime || 0;
    YoutubePlayer.readyPromise().then(() => {
      YoutubePlayer.song = song;
      YoutubePlayer.player.cueVideoById(song.originalId, options.currentTime, 'default');
       options.autoPlay && YoutubePlayer.player.playVideo();
    });
  }

  get durationCacheSeconds() {
    return this._lastDuration;
  }

  dispose() {
    YoutubePlayer.player && YoutubePlayer.player.stopVideo();
  }

  getDuration() {
    return this._lastDuration = YoutubePlayer.player.getDuration();
  }

  getPosition() {
    return YoutubePlayer.readyPromise().then(() => {
      return Promise.resolve(YoutubePlayer.player.getCurrentTime());
    });
  }

  getPositionFraction() {
    return YoutubePlayer.readyPromise().then(() => {
      return Promise.resolve(YoutubePlayer.player.getCurrentTime() / this.getDuration());
    });
  }

  setCurrentTime(timeFraction) {
    YoutubePlayer.readyPromise().then(() => {
      YoutubePlayer.player.seekTo(timeFraction * YoutubePlayer.player.getDuration());
    });
  }

  toggle() {
    YoutubePlayer.readyPromise().then(() => {
      YoutubePlayer.isPlaying() ? YoutubePlayer.player.pauseVideo() : YoutubePlayer.player.playVideo();
    });
  }

  static injectHandlers(playstateChange, onEnded) {
    YoutubePlayer.playstateChangeHandler = playstateChange;
    YoutubePlayer.endHandler = onEnded;
  }

  static isPlaying() {
    return YoutubePlayer.player.getPlayerState() === YT.PlayerState.PLAYING;
  }

  static readyPromise() {
    return readyPromise || (readyPromise = new Promise((resolve) => {
      readyResolve ? resolve() : readyResolve = resolve;
    }));
  }

  static setupYoutube() {
    YoutubePlayer.player = new YT.Player('ytplayer', {
      height: '480',
      width: '853',
      videoId: '',
      events: {
        onError: YoutubePlayer.onYoutubePlayerError,
        onReady: YoutubePlayer.onYoutubePlayerReady,
        onStateChange: YoutubePlayer.onYoutubePlayerStateChange,
      },
    });
  }


  static onYoutubePlayerError(error) {
    const errorSong = YoutubePlayer.song;
    errorSong && Alerter.error(<p>
      Unable to play youtube backing track.
      <Button onClick={() => {
        window.lastRoute = getHistory().location.pathname;
        getHistory().push('/edit/' + errorSong.id);
      }}>Edit Track</Button>
    </p>);
    console.error(`Youtube playback error: ${error.data}`);
    console.error(error);
    YoutubePlayer.endHandler();
  }

  static onYoutubePlayerReady(event) {
    readyResolve ? readyResolve() : readyResolve = true;
  }

  static onYoutubePlayerStateChange(event) {
    YoutubePlayer.playstateChangeHandler(YoutubePlayer.isPlaying());
    YoutubePlayer.player.getPlayerState() === YT.PlayerState.ENDED && YoutubePlayer.endHandler();
  }
}

window.onYouTubeIframeAPIReady = () => {
  YoutubePlayer.setupYoutube();
};
