import { AspectRatio, FocalLengthOption } from './types';

export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const FOCAL_LENGTHS: FocalLengthOption[] = [
  { name: 'Default', value: '' },
  { name: '35mm (Wide Angle)', value: '35mm lens, wide angle shot, deep focus' },
  { name: '50mm (Portrait)', value: '50mm lens, f/1.2, standard portrait, sharp subject' },
  { name: '85mm (Telephoto)', value: '85mm lens, f/1.2, telephoto portrait, beautiful depth of field, bokeh background' },
];