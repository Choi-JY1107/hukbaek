<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { roomStore } from '@/entities/room/store';
  import { playerStore } from '@/entities/player/store';
  import { gameStore } from '@/entities/game/store';
  import { appStore } from '@/app/model/store';
  import GameBoard from '@/widgets/game-board/GameBoard.svelte';
  import GameHistory from '@/widgets/game-history/GameHistory.svelte';
  import TileHand from '@/features/game-play-tile/TileHand.svelte';
  import GameResultModal from '@/features/game-result/GameResultModal.svelte';
  import { onMessage } from '@/shared/lib/websocket';
  import type { Tile, RoomState, GameState, PlayerState } from '@/shared/types';
  import type { MatchResult } from '@shared/types/game';
  import { FORMAT_LABELS } from '@shared/constants/index';
  import s from './GamePage.module.scss';

  let room: RoomState | null = null;
  let game: GameState | null = null;
  let player: { me: PlayerState | null; opponent: PlayerState | null } | null = null;

  roomStore.subscribe((value) => (room = value));
  gameStore.subscribe((value) => (game = value));
  playerStore.subscribe((value) => (player = value));

  $: me = player?.me;

  let result: 'win' | 'lose' | 'draw' | null = null;
  let myPlayedTile: Tile | null = null;
  let oppPlayedColor: 'black' | 'white' | null = null;
  let oppColorHistory: ('black' | 'white')[] = [];
  let myHistory: { tile: number; result: 'win' | 'lose' | 'draw' }[] = [];
  let roundWins = { me: 0, opp: 0 };
  let oppTileMemo: Record<number, 'check' | 'question' | null> = {};
  let isMemoCollapsed = true;
  let matchResult: MatchResult | null = null;
  let showResultModal = false;

  let unsubGameStart: (() => void) | null = null;
  let unsubTileAck: (() => void) | null = null;
  let unsubOppPlayed: (() => void) | null = null;
  let unsubRoundResult: (() => void) | null = null;
  let unsubTurnInfo: (() => void) | null = null;
  let unsubScore: (() => void) | null = null;
  let unsubMatchResult: (() => void) | null = null;

  onMount(() => {
    unsubGameStart = onMessage('game_start', (data) => {
      oppColorHistory = [];
      myHistory = [];
      roundWins = { me: 0, opp: 0 };
      oppTileMemo = {};

      if (me && data.myTiles) {
        playerStore.setMe({ ...me, tilesLeft: data.myTiles });
      }
    });

    unsubTileAck = onMessage('tile_ack', (data) => {
      if (!data.accepted) {
        alert(data.reason || '잘못된 타일입니다');
      }
    });

    unsubOppPlayed = onMessage('opp_played', (data) => {
      oppPlayedColor = data.tileColor;
    });

    unsubRoundResult = onMessage('round_result', (data) => {
      result = data.winner;

      oppColorHistory = [...oppColorHistory, data.oppTileColor];
      myHistory = [...myHistory, { tile: data.myTile, result: data.winner }];

      setTimeout(() => {
        result = null;
        myPlayedTile = null;
        oppPlayedColor = null;
      }, 2000);
    });

    unsubTurnInfo = onMessage('turn_info', (data) => {
      gameStore.updateGameTurn(data.yourTurn, data.round);
    });

    unsubScore = onMessage('score', (data) => {
      gameStore.updateScore(data.me, data.opp, data.need);
      roundWins = { me: data.meRoundWins, opp: data.oppRoundWins };
    });

    unsubMatchResult = onMessage('match_result', (data) => {
      setTimeout(() => {
        matchResult = data.result;
        showResultModal = true;
      }, 500);
    });
  });

  onDestroy(() => {
    if (unsubGameStart) unsubGameStart();
    if (unsubTileAck) unsubTileAck();
    if (unsubOppPlayed) unsubOppPlayed();
    if (unsubRoundResult) unsubRoundResult();
    if (unsubTurnInfo) unsubTurnInfo();
    if (unsubScore) unsubScore();
    if (unsubMatchResult) unsubMatchResult();
  });

  const toggleOppTileMemo = (tile: number) => {
    const current = oppTileMemo[tile];
    let next: 'check' | 'question' | null;

    if (!current) {
      next = 'check';
    } else if (current === 'check') {
      next = 'question';
    } else {
      next = null;
    }

    oppTileMemo = {
      ...oppTileMemo,
      [tile]: next,
    };
  };

  const handleCloseResultModal = () => {
    showResultModal = false;
    matchResult = null;
    appStore.setView('lobby');
  };
</script>

{#if !game || !me || !room}
  <div>게임 정보가 없습니다.</div>
{:else}
  <div class={s.game}>
    <header class={s['game__header']}>
      <div class={s['game__score']}>
        <span>나: {game.score.me} ({roundWins.me}승)</span>
        <span>vs</span>
        <span>상대: {game.score.opp} ({roundWins.opp}승)</span>
      </div>
      <div class={s['game__round-info']}>
        <span>라운드 ({game.round}/9)</span>
        <span>{FORMAT_LABELS[room.format]}</span>
      </div>

      {#if game.round > 0}
        <div class={s['game__memo-widget']}>
          <button
            type="button"
            class={s['game__memo-header']}
            on:click={() => (isMemoCollapsed = !isMemoCollapsed)}
            aria-expanded={!isMemoCollapsed}
          >
            <div class={s['game__memo-title']}>상대 패 메모</div>
            <div class={s['game__memo-toggle']}>{isMemoCollapsed ? '▼' : '▲'}</div>
          </button>
          {#if !isMemoCollapsed}
            <div class={s['game__memo-tiles']}>
              {#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as tile (tile)}
                {@const isBlack = tile % 2 === 0}
                {@const memoState = oppTileMemo[tile]}
                <button
                  class="{s['game__memo-btn']} {isBlack ? s['game__memo-btn--black'] : s['game__memo-btn--white']} {memoState ? s[`game__memo-btn--${memoState}`] : ''}"
                  on:click={() => toggleOppTileMemo(tile)}
                >
                  {tile}
                  {#if memoState === 'check'}
                    <span class="{s['game__memo-mark']} {s['game__memo-mark--check']}">✓</span>
                  {/if}
                  {#if memoState === 'question'}
                    <span class="{s['game__memo-mark']} {s['game__memo-mark--question']}">?</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <GameHistory oppColorHistory={oppColorHistory} myHistory={myHistory} />
    </header>

    <GameBoard
      result={result}
      myPlayedTile={myPlayedTile}
      oppPlayedColor={oppPlayedColor}
      myTurn={game.myTurn}
    />

    <TileHand myPlayedTile={myPlayedTile} onPlayTile={(tile) => (myPlayedTile = tile)} />
  </div>

  <GameResultModal
    isOpen={showResultModal}
    result={matchResult}
    onClose={handleCloseResultModal}
  />
{/if}
