import { useState } from 'react';
import { api, CreateRoomRequest } from '@/shared/api/endpoints';
import { useRoomStore } from '@/entities/room/store';
import { usePlayerStore } from '@/entities/player/store';
import { ROOM_FORMATS, FORMAT_LABELS } from '@shared/constants/index';
import s from './RoomCreateModal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const RoomCreateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { setRoom } = useRoomStore();
  const { setMe } = usePlayerStore();
  const [formData, setFormData] = useState<CreateRoomRequest>({
    title: '',
    password: '',
    format: 'bo1',
    overtime: false,
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '방 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={s.modal} onClick={onClose}>
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
            <div className={s['format-selector']}>
              {ROOM_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`${s['format-button']} ${formData.format === format ? s['format-button--active'] : ''}`}
                  onClick={() => setFormData({ ...formData, format })}
                  disabled={isLoading}
                >
                  <span className={s['format-button__icon']}>
                    {format === 'bo1' && '⚡'}
                    {format === 'bo3' && '🎯'}
                    {format === 'bo5' && '👑'}
                  </span>
                  <span className={s['format-button__label']}>{FORMAT_LABELS[format]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s['form__group']}>
            <label className={s['form__label']}>연장 허용</label>
            <label className={s['toggle-switch']}>
              <input
                type="checkbox"
                checked={formData.overtime}
                onChange={(e) => setFormData({ ...formData, overtime: e.target.checked })}
                disabled={isLoading}
              />
              <span className={s['toggle-switch__slider']}></span>
              <span className={s['toggle-switch__label']}>
                {formData.overtime ? '허용' : '비허용'}
              </span>
            </label>
          </div>

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
              {isLoading ? '생성 중...' : '방 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
