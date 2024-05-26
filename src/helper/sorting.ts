import { OrderByCondition } from "typeorm";

export function generateQueryBuilderOrderByObj(
  keyToColumnMapping: Record<string, string>,
  key: string,
  sort?: "ASC" | "DESC",
): OrderByCondition {
  const orderByObj = {};
  orderByObj[keyToColumnMapping[key]] = sort ?? "DESC";
  return orderByObj;
}
