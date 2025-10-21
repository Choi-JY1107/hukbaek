import { useState } from 'react';
import { api } from '@/shared/api/endpoints';
import { useRoomStore } from '@/entities/room/store';
import { usePlayerStore } from '@/entities/player/store';
import { RoomInfo } from '@shared/types/room';
import { FORMAT_LABELS } from '@shared/constants/index';
import s from './RoomJoinModal.module.scss';

type Props = {
  room: RoomInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const RoomJoinModal: React.FC<Props> = ({ room, isOpen, onClose, onSuccess }) => {
  const { setRoom } = useRoomStore();
  const { setMe } = usePlayerStore();
  const [formData, setFormData] = useState({ nickname: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    setError('');

    if (!formData.nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    if (room.locked && !formData.password) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.joinRoom({
        roomId: room.id,
        nickname: formData.nickname,
        password: formData.password || undefined,
      });

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
        nickname: formData.nickname,
        ready: false,
        tilesLeft: [],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '방 참가에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className={s.modal} onClick={onClose}>
      <div className={s['modal__content']} onClick={(e) => e.stopPropagation()}>
        <h2 className={s['modal__title']}>방 참가</h2>
        <div className={s['join-room-info']}>
          <div className={s['join-room-info__title']}>방 제목 : {room.title}</div>
          <div className={s['join-room-info__meta']}>
            <span className={s['join-room-info__label']}>승부 수 : </span>
            <span className={s['join-room-info__format']}>{FORMAT_LABELS[room.format]}</span>
            {room.overtime && <span className={s['join-room-info__overtime']}>연장</span>}
          </div>
        </div>

        <form className={s['modal__form']} onSubmit={handleSubmit}>
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
              autoFocus
            />
          </div>

          {room.locked && (
            <div className={s['form__group']}>
              <label className={s['form__label']}>비밀번호</label>
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
          )}

          {error && <div className={s['form__error']}>{error}</div>}

          <div className={s['modal__actions']}>
            <button
              type="button"
              className={s['modal__cancel']}
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className={s['modal__submit']}
              disabled={isLoading}
            >
              {isLoading ? '참가 중...' : '참가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
