<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { roomStore } from '@/entities/room/store';
  import { playerStore } from '@/entities/player/store';
  import { gameStore } from '@/entities/game/store';
  import { disconnectSocket, onMessage, sendMessage } from '@/shared/lib/websocket';
  import s from './RoomPage.module.scss';

  export let onNavigateToLobby: () => void;
  export let onNavigateToGame: () => void;

  let room: any;
  let player: any;
  let ready = false;
  let players = 1;
  let readyStates: [boolean, boolean] = [false, false];
  let isHost = true;

  roomStore.subscribe((value) => (room = value));
  playerStore.subscribe((value) => (player = value));

  $: me = player?.me;
  $: opponent = player?.opponent;
  $: oppReady = isHost ? readyStates[1] : readyStates[0];
  $: myReady = isHost ? readyStates[0] : readyStates[1];

  let unsubGameStart: (() => void) | null = null;
  let unsubRoomUpdated: (() => void) | null = null;

  onMount(() => {
    if (room && me) {
      sendMessage({ t: 'join_room', roomId: room.id, playerId: me.id });
    }

    unsubRoomUpdated = onMessage('room_updated', (data) => {
      console.log('🔔 [room_updated]', data);
      console.log('🔔 내 닉네임:', me?.nickname);
      players = data.players;
      readyStates = data.readyStates;

      if (data.playerNames && me && data.playerNames.length === 2) {
        console.log('🔔 playerNames:', data.playerNames);
        const oppName = data.playerNames.find((name: string) => name !== me.nickname);
        console.log('🔔 상대 닉네임:', oppName);
        if (oppName) {
          playerStore.setOpponent({
            id: '',
            nickname: oppName,
            ready: false,
            tilesLeft: [],
          });
        }
      }
    });

    unsubGameStart = onMessage('game_start', (data) => {
      if (me && data.myTiles) {
        playerStore.setMe({ ...me, tilesLeft: data.myTiles });
      }

      gameStore.setGame({
        round: 1,
        starterId: data.starterId,
        myTurn: me?.id === data.starterId,
        score: { me: 0, opp: 0, need: 3 },
      });
      onNavigateToGame();
    });
  });

  onDestroy(() => {
    if (unsubRoomUpdated) unsubRoomUpdated();
    if (unsubGameStart) unsubGameStart();
  });

  const handleReady = () => {
    if (!room || players < 2) return;
    const newReady = !ready;
    ready = newReady;
    sendMessage({ t: 'set_ready', roomId: room.id, ready: newReady });
  };

  const handleLeave = () => {
    disconnectSocket();
    onNavigateToLobby();
  };
</script>

{#if !room}
  <div class={s['room__empty']}>방 정보가 없습니다.</div>
{:else}
  <div class={s.room}>
    <header class={s['room__header']}>
      <button class={s['room__back-btn']} on:click={handleLeave}>
        ← 나가기
      </button>
      <h1 class={s['room__title']}>{room.title}</h1>
      <div class={s['room__info']}>
        <span class={s['room__format']}>{room.format.toUpperCase()}</span>
        {#if room.overtime}
          <span class={s['room__overtime']}>연장</span>
        {/if}
      </div>
    </header>

    <div class={s['room__content']}>
      <div class={s['room__opponent']}>
        <div class="{s['room__player']} {players >= 2 ? s['room__player--filled'] : ''}">
          <div class={s['room__player-icon']}>
            {players >= 2 ? '👤' : '💺'}
          </div>
          <div class={s['room__player-info']}>
            <div class={s['room__player-label']}>
              상대 {opponent?.nickname ? `(${opponent.nickname})` : ''}
            </div>
            {#if players >= 2}
              <div class="{s['room__player-status']} {oppReady ? s['room__player-status--ready'] : ''}">
                {oppReady ? '✓ 준비 완료' : '대기 중'}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class={s['room__vs']}>VS</div>

      <div class={s['room__me']}>
        <div class="{s['room__player']} {s['room__player--filled']}">
          <div class={s['room__player-icon']}>👤</div>
          <div class={s['room__player-info']}>
            <div class={s['room__player-label']}>나 ({me?.nickname || '플레이어'})</div>
            <div class="{s['room__player-status']} {myReady ? s['room__player-status--ready'] : ''}">
              {myReady ? '✓ 준비 완료' : '대기 중'}
            </div>
          </div>
        </div>
      </div>

      {#if players < 2}
        <div class={s['room__waiting']}>
          <div class={s['room__waiting-text']}>상대 플레이어를 기다리는 중...</div>
        </div>
      {/if}
    </div>

    {#if players >= 2}
      <button
        class="{s['room__ready-btn']} {ready ? s['room__ready-btn--ready'] : ''}"
        on:click={handleReady}
      >
        {ready ? '✓ 준비 완료' : '준비하기'}
      </button>
    {/if}
  </div>
{/if}
