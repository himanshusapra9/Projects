import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  FiltersSuggestRequestDto,
  FiltersSuggestResponseDto,
} from '../common/dto/filters.dto';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { FitScoringService } from '../services/fit-scoring.service';
import { RiskScoringService } from '../services/risk-scoring.service';

@ApiTags('filters')
@Controller('filters')
export class FiltersController {
  constructor(
    private readonly fit: FitScoringService,
    private readonly risk: RiskScoringService,
  ) {}

  @Post('suggest')
  @HttpCode(200)
  @ApiOperation({
    summary: 'AI-style filter suggestions and refinement chips for narrowing',
  })
  @ApiBody({ type: FiltersSuggestRequestDto })
  @ApiResponse({ status: 200, type: Object })
  async suggest(
    @ReqTenantId() tenantId: string,
    @Body() body: FiltersSuggestRequestDto,
  ): Promise<FiltersSuggestResponseDto> {
    const category = body.category_id
      ? (this.fit.resolveCategory(body.category_id) as string)
      : this.fit.resolveCategory(body.product_id);

    const rr = this.risk.profile({
      tenantId,
      productId: body.product_id,
    });

    const suggestedFilters: FiltersSuggestResponseDto['suggestedFilters'] = [];

    if (rr.riskScore > 0.45) {
      suggestedFilters.push({
        key: 'maxReturnRisk',
        value: 0.42,
        rationale: 'Current PDP risk is elevated; cap substitutes by return-risk.',
      });
    }

    if (category === 'FOOTWEAR') {
      suggestedFilters.push({
        key: 'attributes.width',
        value: ['WIDE'],
        rationale: 'Width often resolves the dominant footwear mismatch driver.',
      });
    }

    if (category === 'APPAREL') {
      suggestedFilters.push({
        key: 'attributes.fit',
        value: ['RELAXED', 'REGULAR'],
        rationale: 'Relaxing fit reduces slim-cut mismatch when layering.',
      });
    }

    suggestedFilters.push({
      key: 'price.max',
      value: 180,
      rationale: 'Keeps substitutes in a comparable band unless query implies budget.',
    });

    const chips: FiltersSuggestResponseDto['chips'] = [
      {
        id: 'chip_lower_risk',
        label: 'Lower return risk',
        appliedFilterPatch: { maxReturnRisk: Math.max(0.25, rr.riskScore - 0.12) },
        rationale: 'Prioritize historically safer substitutes',
      },
      {
        id: 'chip_same_category',
        label: 'Same category only',
        appliedFilterPatch: { categoryLock: true },
        rationale: 'Avoid cross-category substitutes that confuse fit priors',
      },
      {
        id: 'chip_neutral_color',
        label: 'Neutral colorways',
        appliedFilterPatch: { colorFamilies: ['NEUTRAL'] },
        rationale: 'Reduce expectation mismatch on color/tone',
      },
    ];

    if (body.query?.toLowerCase().includes('budget')) {
      chips.unshift({
        id: 'chip_under_price',
        label: 'Under $120',
        appliedFilterPatch: { price: { max: 120, currency: 'USD' } },
        rationale: 'Matched budget intent from query',
      });
    }

    return { suggestedFilters, chips };
  }
}
