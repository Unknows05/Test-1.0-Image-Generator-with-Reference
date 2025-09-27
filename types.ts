export enum Visibility {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface Prompt {
  id: string;
  name: string;
  text: string;
  category: string;
  visibility: Visibility;
  createdAt: number;
}