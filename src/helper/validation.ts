import { NotFoundException } from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

interface ID {
  id: string;
  object: string;
}

export function validateId(items: ID[]) {
  for (const item of items) {
    const isValidUUID = uuidValidate(item.id);

    if (!isValidUUID) {
      throw new NotFoundException(`${item.object} not found.`);
    }
  }
}
