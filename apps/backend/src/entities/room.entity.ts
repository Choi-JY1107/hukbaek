import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { RoomPlayer } from './room-player.entity';
import { Match } from './match.entity';
import { RoomFormat } from '@shared/types/types/game';
import { RoomStatus } from '@shared/types/types/room';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ default: false })
  locked!: boolean;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column()
  format!: RoomFormat;

  @Column()
  status!: RoomStatus;

  @OneToMany(() => RoomPlayer, (player) => player.room)
  roomPlayers!: RoomPlayer[];

  @OneToOne(() => Match, (match) => match.room, { nullable: true })
  match?: Match;
}
