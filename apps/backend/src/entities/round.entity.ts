import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Match } from './match.entity';
import { Play } from './play.entity';
import { RoundResult } from '@shared/types/types/game';

@Entity()
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  matchId!: string;

  @ManyToOne(() => Match, (match) => match.rounds, { onDelete: 'CASCADE' })
  match!: Match;

  @Column()
  roundNumber!: number; // 1-9 (게임 내 라운드)

  @Column({ default: 1 })
  gameNumber!: number; // 1, 2, 3... (몇 번째 게임인지)

  @Column()
  starterId!: string;

  @Column({ nullable: true })
  result?: RoundResult;

  @OneToMany(() => Play, (play) => play.round)
  plays!: Play[];
}
