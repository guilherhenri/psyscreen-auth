import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 500 })
  name: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string
}
