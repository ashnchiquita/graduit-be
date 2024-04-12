import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MaxLength } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MataKuliah {
  @ApiProperty({ minLength: 6, maxLength: 6, example: "IF4031" })
  @IsString()
  @Length(6)
  @PrimaryColumn({ type: "varchar", length: 6 })
  kode: string;

  @ApiProperty({ maxLength: 256 })
  @IsString()
  @MaxLength(256)
  @Column({ type: "varchar", length: 256 })
  nama: string;
}
