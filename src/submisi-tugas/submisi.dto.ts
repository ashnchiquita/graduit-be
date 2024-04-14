import { ApiProperty, PickType } from "@nestjs/swagger";
import { SubmisiTugas } from "src/entities/submisiTugas";

class SubmisiRes extends PickType(SubmisiTugas, [
  "id",
  "mahasiswa",
  "jawaban",
  "isSubmitted",
  "berkasSubmisiTugas",
  "submittedAt",
] as const) {}

export class GetSubmisiResDto {
  @ApiProperty({
    type: SubmisiRes,
    example: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      mahasiswa: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        nama: "John Doe",
        email: "johndoe@gmail.com",
      },
      jawaban: "Lorem ipsum dolor sit amet",
      isSubmitted: true,
      berkasSubmisiTugas: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          nama: "Berkas Tugas 1",
          url: "https://example.com/file.pdf",
        },
      ],
      submittedAt: "2021-08-17T07:45:00.000Z",
    },
  })
  submisi: SubmisiRes;
}

export class CreateBerkasSubmisiReqDto {
  @ApiProperty({
    example: {
      nama: "Berkas Tugas 1",
      url: "https://example.com/file.pdf",
    },
  })
  nama: string;
  url: string;
}

export class CreateSubmisiReqDto {
  @ApiProperty({
    example: {
      jawaban: "Lorem ipsum dolor sit amet",
      berkasSubmisiTugas: [
        {
          nama: "Berkas Tugas 1",
          url: "https://example.com/file.pdf",
        },
      ],
      isSubmitted: true,
      tugas: "550e8400-e29b-41d4-a716-446655440000",
    },
  })
  jawaban: string;
  berkasSubmisiTugas: CreateBerkasSubmisiReqDto[];
  isSubmitted: boolean;
  tugas: string;
}

export class CreateSubmisiResDto {
  @ApiProperty({
    example: "Submisi tugas berhasil dibuat.",
  })
  message: string;
}
