import Dexie, { Table } from "dexie";

export type MemoryEntity = {
  id: string;
  title: string;
  narrator: string;
  tags: string[];
  note?: string;
  createdAt: number;
  durationMs: number;

  audioMime: string;
  audioBlob: Blob;

  photoMime?: string;
  photoBlob?: Blob;

  version: number;
};

export type JournalEntryEntity = {
  id: string;
  title?: string;
  content: string;          // plain text
  createdAt: number;
  updatedAt: number;
  photos?: Blob[];          // MVP: ảnh đính kèm
};

class TAKDB extends Dexie {
  memories!: Table<MemoryEntity, string>;
  journals!: Table<JournalEntryEntity, string>;

  constructor() {
    super("tak_db");
    this.version(2).stores({
      memories: "id, createdAt, title, narrator",
      journals: "id, createdAt, updatedAt"
    });
  }
  
}

export const db = new TAKDB();
