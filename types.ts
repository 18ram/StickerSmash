export interface Sticker {
  id: string;
  imageUrl: string;
  style: string;
  prompt: string;
  createdAt: number;
}

export enum StickerStyle {
  CARICATURE = 'Funny Caricature',
  CHIBI = 'Cute Chibi',
  MEME = 'Dank Meme',
  RETRO = '90s Cartoon',
  PIXEL = 'Pixel Art',
  CLAY = 'Claymation',
  GRAFFITI = 'Street Graffiti',
  VINTAGE = 'Vintage Badge'
}

export type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'success' | 'error';
