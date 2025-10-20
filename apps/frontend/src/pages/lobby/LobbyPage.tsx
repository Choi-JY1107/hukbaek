import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store';
import { api, CreateRoomRequest } from '../../shared/api/endpoints';
import { RoomInfo } from '@shared/types/room';
import { RoomFormat } from '@shared/types/game';
import { ROOM_FORMATS, FORMAT_LABELS } from '@shared/constants/index';
import s from './LobbyPage.module.scss';

export const LobbyPage: React.FC = () => {
  const { setView, setRoom, setMe } = useAppStore();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateRoomRequest>({
    title: '',
    password: '',
    format: 'bo3',
    overtime: false,
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleCreateRoom = () => {
    setShowModal(true);
    setError('');
    setFormData({
      title: '',
      password: '',
      format: 'bo3',
      overtime: false,
      nickname: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('방 제목을 입력해주세요');
      return;
    }

    if (!formData.nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const data: CreateRoomRequest = {
        ...formData,
        password: formData.password || undefined,
      };
      const response = await api.createRoom(data);
      console.log('Room created:', response);

      // 방 정보와 플레이어 정보를 store에 저장
      setRoom({
        id: response.roomId,
        title: formData.title,
        locked: !!formData.password,
        format: formData.format,
        overtime: formData.overtime,
        playerCount: 1,
      });

      setMe({
        id: response.playerId,
        nickname: formData.nickname,
        ready: false,
        tilesLeft: [],
      });

      setShowModal(false);
      setView('room');
      await loadRooms();
    } catch (err: any) {
      setError(err.message || '방 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (room: RoomInfo) => {
    // 2명이 차 있으면 참가 불가
    if (room.playerCount >= 2) {
      return;
    }

    const nickname = prompt('닉네임을 입력하세요');
    if (!nickname) return;

    let password: string | undefined;
    if (room.locked) {
      password = prompt('비밀번호를 입력하세요') || undefined;
      if (!password) return;
    }

    try {
      const response = await api.joinRoom({
        roomId: room.id,
        nickname,
        password,
      });

      // 방 정보와 플레이어 정보를 store에 저장
      setRoom({
        id: room.id,
        title: room.title,
        locked: room.locked,
        format: room.format,
        overtime: room.overtime,
        playerCount: room.playerCount,
      });

      setMe({
        id: response.playerId,
        nickname,
        ready: false,
        tilesLeft: [],
      });

      setView('room');
    } catch (err: any) {
      alert(err.message || '방 참가에 실패했습니다');
    }
  };

  return (
    <div className={s.lobby}>
      <header className={s['lobby__header']}>
        <h1 className={s['lobby__title']}>흑과백</h1>
        <button className={s['lobby__create-btn']} onClick={handleCreateRoom}>
          방 만들기
        </button>
      </header>

      <div className={s['lobby__content']}>
        {rooms.length === 0 ? (
          <div className={s['lobby__empty']}>방이 없습니다. 새로운 방을 만들어보세요!</div>
        ) : (
          <ul className={s['lobby__list']}>
            {rooms
              .sort((a, b) => {
                // 2명 차 있으면 맨 밑으로
                if (a.playerCount >= 2 && b.playerCount < 2) return 1;
                if (a.playerCount < 2 && b.playerCount >= 2) return -1;
                return 0;
              })
              .map((room) => (
                <li
                  key={room.id}
                  className={`${s['lobby__card']} ${room.locked ? s['lobby__card--locked'] : ''} ${
                    room.playerCount >= 2 ? s['lobby__card--full'] : ''
                  }`}
                  onClick={() => room.playerCount < 2 && handleJoinRoom(room)}
                  style={{ cursor: room.playerCount >= 2 ? 'not-allowed' : 'pointer' }}
                >
                  <div className={s['lobby__card-title']}>
                    {room.locked && <span className={s['lobby__lock-icon']}>🔒</span>}
                    {room.title}
                    {room.playerCount >= 2 && <span className={s['lobby__full-badge']}>만석</span>}
                  </div>
                  <div className={s['lobby__card-info']}>
                    <span className={s['lobby__format']}>{FORMAT_LABELS[room.format]}</span>
                    {room.overtime && <span className={s['lobby__overtime']}>연장</span>}
                    <span className={s['lobby__players']}>{room.playerCount}/2</span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className={s.modal} onClick={() => setShowModal(false)}>
          <div className={s['modal__content']} onClick={(e) => e.stopPropagation()}>
            <h2 className={s['modal__title']}>방 만들기</h2>

            <form className={s['modal__form']} onSubmit={handleSubmit}>
              <div className={s['form__group']}>
                <label className={s['form__label']}>방 제목</label>
                <input
                  type="text"
                  className={s['form__input']}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="방 제목을 입력하세요"
                  maxLength={30}
                  disabled={isLoading}
                />
              </div>

              <div className={s['form__group']}>
                <label className={s['form__label']}>닉네임</label>
                <input
                  type="text"
                  className={s['form__input']}
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>

              <div className={s['form__group']}>
                <label className={s['form__label']}>비밀번호 (선택)</label>
                <input
                  type="password"
                  className={s['form__input']}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>

              <div className={s['form__group']}>
                <label className={s['form__label']}>게임 형식</label>
                <div className={s['form__radio-group']}>
                  {ROOM_FORMATS.map((format) => (
                    <label key={format} className={s['form__radio']}>
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={formData.format === format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as RoomFormat })}
                        disabled={isLoading}
                      />
                      <span>{FORMAT_LABELS[format]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={s['form__group']}>
                <label className={s['form__checkbox']}>
                  <input
                    type="checkbox"
                    checked={formData.overtime}
                    onChange={(e) => setFormData({ ...formData, overtime: e.target.checked })}
                    disabled={isLoading}
                  />
                  <span>연장 허용</span>
                </label>
              </div>

              {error && <div className={s['form__error']}>{error}</div>}

              <div className={s['modal__actions']}>
                <button
                  type="button"
                  className={s['modal__cancel']}
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={s['modal__submit']}
                  disabled={isLoading}
                >
                  {isLoading ? '생성 중...' : '방 만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
