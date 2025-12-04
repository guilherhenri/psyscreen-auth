import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ length: 500 })
  name: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string
}
