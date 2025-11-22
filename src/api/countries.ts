import client from "./client";

export interface Country {
  id: string;
  name: string;
}

export async function getCountries(): Promise<Country[]> {
  const res = await client.get<Country[]>("/countries");
  return res.data;
}
