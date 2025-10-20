import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';
import { Round } from './round.entity';
import { RoomFormat } from '@shared/types/types/game';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roomId!: string;

  @OneToOne(() => Room, (room) => room.match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column()
  p1Id!: string;

  @Column()
  p2Id!: string;

  @Column()
  format!: RoomFormat;

  @Column({ default: 0 })
  p1Wins!: number; // P1이 이긴 게임 수

  @Column({ default: 0 })
  p2Wins!: number; // P2가 이긴 게임 수

  @Column({ default: 0 })
  p1CurrentGameWins!: number; // 현재 게임에서 P1이 이긴 라운드 수

  @Column({ default: 0 })
  p2CurrentGameWins!: number; // 현재 게임에서 P2가 이긴 라운드 수

  @Column({ default: 1 })
  currentGameNumber!: number; // 현재 진행 중인 게임 번호

  @Column({ nullable: true })
  winnerId?: string;

  @OneToMany(() => Round, (round) => round.match)
  rounds!: Round[];
}
