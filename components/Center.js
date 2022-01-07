import React, {useState, useEffect} from 'react'
import {useSession } from 'next-auth/react'
import { ChevronDownIcon, RefreshIcon } from '@heroicons/react/outline'
import { shuffle } from 'lodash'
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import { useRecoilState, useRecoilValue } from 'recoil';
import useSpotify from '../hooks/useSpotify';
import Songs from './Songs';

const colors = [
    'from-red-500',
    'from-violet-500',
    'from-blue-500',
    'from-green-500',
    'from-yellow-500',
    'from-pink-500',
    'from-gray-500',
    'from-purple-500',
]

function Center() {
    const spotifyApi = useSpotify()
    const { data: session } = useSession();
    const [color, setColor] = useState(null);
    const playlistId = useRecoilValue(playlistIdState)
    const [playlist, setPlaylist] = useRecoilState(playlistState)

    useEffect(() => {
        setColor(shuffle(colors).pop())
    }, [playlistId])

    useEffect(() => {
        if(spotifyApi.getAccessToken()){
            spotifyApi.getPlaylist(playlistId).then((data) => {
                setPlaylist(data.body)
            }).catch((error) => console.error('Something went wrong! Try again' + error))
        }
    }, [spotifyApi, playlistId])

    return (
        <div className="flex-grow text-white h-screen overflow-y-scroll scrolbar-hide">
            <header className="absolute top-5 right-8">
                <div className="flex items-center bg-black space-x-3 opacity-90 hover:opacity-80 rounded-full cursor-pointer p-1 pr-2">
                    <img src={session?.user?.image} alt="" className="h-10 w-10 rounded-full" />
                    <h2>{session?.user?.name ?? 'Cargando...'}</h2>
                    <ChevronDownIcon className="h-5 w-5" />
                </div>
            </header>
            <section className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 text-white p-8`}>
                <img src={playlist?.images?.[0]?.url} className="h-44 w-44 shadow-2xl" />
                <div>
                    <p>PLAYLIST</p>
                    <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold">{playlist?.name ?? 'Cargando...'}</h1>
                </div>
            </section>
            <div>
                <Songs />
            </div>
        </div>
    )
}

export default Center
