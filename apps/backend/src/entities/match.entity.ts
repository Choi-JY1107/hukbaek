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
  p1Wins!: number;

  @Column({ default: 0 })
  p2Wins!: number;

  @Column({ nullable: true })
  winnerId?: string;

  @OneToMany(() => Round, (round) => round.match)
  rounds!: Round[];
}
