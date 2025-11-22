import client from "./client";

export interface Tax {
  id: string;
  entity: string;
  gender: string;
  request_date: string;
  country: string;
  // in case API has extra fields
  [key: string]: unknown;
}

export async function getTaxes(): Promise<Tax[]> {
  const res = await client.get<Tax[]>("/taxes");
  return res.data;
}

export async function updateTax(id: string, payload: Partial<Tax>): Promise<Tax> {
  const res = await client.put<Tax>(`/taxes/${id}`, payload);
  return res.data;
}
