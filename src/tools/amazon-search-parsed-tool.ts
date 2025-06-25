import z from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ScraperAPIParams, ScrapingMCPParams } from 'types';
import { ScraperApiClient } from 'clients/scraper-api-client';
import { SCRAPER_API_TARGETS } from '../constants';
import { removeKeyFromNestedObject } from '../utils';
import { zodGeo, zodLocale, zodJsRender } from '../zod/zod-types';

export class AmazonSearchParsedTool {
  static FIELDS_WITH_HIGH_CHAR_COUNT = ['suggested', 'amazons_choices', 'refinements'];

  static transformAutoParsedResponse = ({ obj }: { obj: object }): string => {
    for (const fieldToRemove of AmazonSearchParsedTool.FIELDS_WITH_HIGH_CHAR_COUNT) {
      obj = removeKeyFromNestedObject({ obj, keyToRemove: fieldToRemove });
    }

    const text = JSON.stringify(obj);

    return text;
  };

  static register = ({
    server,
    sapiClient,
  }: {
    server: McpServer;
    sapiClient: ScraperApiClient;
  }) => {
    server.registerTool(
      'amazon_search_parsed',
      {
        description: 'Scrape Amazon Search results with automatic parsing',
        inputSchema: {
          query: z.string().describe('Search query'),
          geo: zodGeo,
          jsRender: zodJsRender,
        },
      },
      async (scrapingParams: ScrapingMCPParams) => {
        const params = {
          ...scrapingParams,
          target: SCRAPER_API_TARGETS.AMAZON_SEARCH,
          parse: true,
        } satisfies ScraperAPIParams;

        const { data } = await sapiClient.scrape<object>({ scrapingParams: params });

        const text = this.transformAutoParsedResponse({ obj: data });

        return {
          content: [
            {
              type: 'text',
              text,
            },
          ],
        };
      }
    );
  };
}
