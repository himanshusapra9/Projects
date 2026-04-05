import { Injectable } from '@nestjs/common';
import { ClaudeService } from './claude.service';

const VISION_SYSTEM = `You are a product listing expert. Analyze product images and extract structured attributes.
Return ONLY valid JSON with this shape:
{
  "title": string | null,
  "brand": string | null,
  "color": string | null,
  "material": string | null,
  "condition": string | null,
  "category": string | null,
  "description": string | null,
  "notable_features": string[] | null,
  "certifications": string[] | null,
  "text_on_product": string | null
}
Only include values you can visually confirm. Set null for anything uncertain.`;

@Injectable()
export class VisionService {
  constructor(private readonly claude: ClaudeService) {}

  async extractProductAttributes(params: {
    organizationId: string;
    imageBase64: string;
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  }): Promise<Record<string, unknown>> {
    return this.claude.visionJson({
      organizationId: params.organizationId,
      system: VISION_SYSTEM,
      user: 'Analyze this product image carefully. Extract all visible product attributes. Return ONLY the JSON object, no other text.',
      imageBase64: params.imageBase64,
      mediaType: params.mediaType,
    });
  }
}
