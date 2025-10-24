<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { appStore } from './model/store';
  import { gameStore } from '@/entities/game/store';
  import { onMessage } from '@/shared/lib/websocket';
  import LobbyPage from '@/pages/lobby/LobbyPage.svelte';
  import RoomPage from '@/pages/room/RoomPage.svelte';
  import GamePage from '@/pages/game/GamePage.svelte';
  import './styles/app.scss';

  let view: 'lobby' | 'room' | 'game' = 'lobby';

  appStore.subscribe((value) => (view = value));

  let unsubMatchResult: (() => void) | null = null;
  let unsubError: (() => void) | null = null;

  onMount(() => {
    unsubMatchResult = onMessage('match_result', (data) => {
      console.log('Match result:', data.result);
      setTimeout(() => {
        gameStore.setGame(null);
        appStore.setView('lobby');
      }, 3000);
    });

    unsubError = onMessage('error', (data) => {
      console.error('WebSocket error:', data.message);
    });
  });

  onDestroy(() => {
    if (unsubMatchResult) unsubMatchResult();
    if (unsubError) unsubError();
  });
</script>

{#if view === 'lobby'}
  <LobbyPage onNavigateToRoom={() => appStore.setView('room')} />
{:else if view === 'room'}
  <RoomPage
    onNavigateToLobby={() => appStore.setView('lobby')}
    onNavigateToGame={() => appStore.setView('game')}
  />
{:else if view === 'game'}
  <GamePage />
{/if}
