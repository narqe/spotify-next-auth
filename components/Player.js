import { useSession } from 'next-auth/react';
import useSpotify from '../hooks/useSpotify';
import useSongInfo from '../hooks/useSongInfo';
import {currentTrackIdState, isPlayingState} from '../atoms/songAtom';
import { useRecoilState } from 'recoil';
import { useState, useEffect, useCallback} from 'react';
import { FastForwardIcon, ReplyIcon, SwitchHorizontalIcon, VolumeOffIcon, VolumeUpIcon } from '@heroicons/react/outline';
import {  RewindIcon, PauseIcon, PlayIcon } from '@heroicons/react/solid';
import { debounce } from 'lodash';

function Player() {
    const spotifyApi = useSpotify();
    const songInfo = useSongInfo()
    const {data: session} = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState)
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50)

    const fetchCurrentSong = () => {
        if(!songInfo) {
            spotifyApi.getMyCurrentPlayingTrack().then(data => {
                setCurrentTrackId(data.body?.item?.id)
                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing)
                })
            })
        }
    }

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if(data.body.is_playing){
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play()
                setIsPlaying(true);
            }
        })
    }

    useEffect(() => {
        if(spotifyApi.getAccessToken() && !currentTrackId) {
            fetchCurrentSong()
            setVolume(75)
        }
    }, [currentTrackId, spotifyApi, session])

    useEffect(() => {
        if(volume > 0 && volume < 100) {
            debouncedAjustVolume(volume)
        }
    }, [volume])

    const debouncedAjustVolume = useCallback(
        debounce((volume) => {
            spotifyApi.setVolume(volume).catch(e => {})
        }, 500), []
    )

    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-700 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
            <div  className="flex items-center space-x-4">
                <img 
                    className="hidden md:inline h-10 w-10"
                    src={songInfo?.album?.images?.[0].url} 
                />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="btn" />
                <RewindIcon className="btn" />
                {!!isPlaying ? (<PauseIcon onClick={() => handlePlayPause()} className="btn w-10 h-10" />) : 
                    (<PlayIcon onClick={() => handlePlayPause()} className="btn w-10 h-10" />)
                }
                <FastForwardIcon className="btn" />
                <ReplyIcon className="btn" />
            </div>
            <div className="flex items-center justify-evenly">
                <VolumeOffIcon onClick={() => volume > 0 && setVolume(volume - 10)} className="btn" />
                <input 
                    className="w-15 md:w-28" 
                    type="range" 
                    value={volume} 
                    min={0} 
                    max={100} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <VolumeUpIcon onClick={() => volume < 100 && setVolume(volume + 10)} className="btn" />
            </div>
        </div>
    )
}

export default Player
