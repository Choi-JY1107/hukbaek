import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Round } from './round.entity';
import { Tile } from '@shared/types/types/game';

@Entity()
export class Play {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roundId!: string;

  @ManyToOne(() => Round, (round) => round.plays, { onDelete: 'CASCADE' })
  round!: Round;

  @Column()
  playerId!: string;

  @Column()
  tile!: Tile;
}
