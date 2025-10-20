import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class RoomPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nickname!: string;

  @Column()
  socketId!: string;

  @Column()
  ready!: boolean;

  @Column()
  roomId!: string;

  @ManyToOne(() => Room, (room) => room.roomPlayers, { onDelete: 'CASCADE' })
  room!: Room;
}
