import { useState, useEffect } from 'react';
import { sendMessage, onMessage } from '@/shared/lib/websocket';
import { useRoomStore } from '@/entities/room/store';
import { usePlayerStore } from '@/entities/player/store';

export const useRoomReady = () => {
  const { room } = useRoomStore();
  const { me, setOpponent } = usePlayerStore();
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState<number>(1);
  const [readyStates, setReadyStates] = useState<[boolean, boolean]>([false, false]);
  const [isHost] = useState(true);

  useEffect(() => {
    if (room && me) {
      sendMessage({ t: 'join_room', roomId: room.id, playerId: me.id });
    }

    const unsubRoomUpdated = onMessage('room_updated', (data) => {
      console.log('🔔 [room_updated]', data);
      console.log('🔔 내 닉네임:', me?.nickname);
      setPlayers(data.players);
      setReadyStates(data.readyStates);

      if (data.playerNames && me && data.playerNames.length === 2) {
        console.log('🔔 playerNames:', data.playerNames);
        const oppName = data.playerNames.find(name => name !== me.nickname);
        console.log('🔔 상대 닉네임:', oppName);
        if (oppName) {
          setOpponent({
            id: '',
            nickname: oppName,
            ready: false,
            tilesLeft: [],
          });
        }
      }
    });

    return () => {
      unsubRoomUpdated();
    };
  }, [me, room, setOpponent]);

  const handleReady = () => {
    if (!room || players < 2) return;
    const newReady = !ready;
    setReady(newReady);
    sendMessage({ t: 'set_ready', roomId: room.id, ready: newReady });
  };

  const oppReady = isHost ? readyStates[1] : readyStates[0];
  const myReady = isHost ? readyStates[0] : readyStates[1];

  return {
    ready,
    players,
    oppReady,
    myReady,
    handleReady,
  };
};
