import z from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ScrapingMCPParams } from 'types';
import { ScraperApiClient } from '../clients/scraper-api-client';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { zodFullResponse, zodGeo, zodJsRender, zodLocale, zodTokenLimit } from '../zod/zod-types';

export class ScrapeAsMarkdownTool {
  static LARGE_CONTENT_SYMBOL_COUNT = 10_000;

  static isResponseOverLimit = (content: string) => {
    return content.length > this.LARGE_CONTENT_SYMBOL_COUNT;
  };

  static shouldTruncateResponse = ({
    content,
    shouldShowFullResponse,
  }: {
    content: string;
    shouldShowFullResponse?: boolean;
  }) => {
    if (shouldShowFullResponse) {
      return false;
    }

    return this.isResponseOverLimit(content);
  };

  static truncateResponse = ({ content, limit }: { content: string; limit: number }) => {
    return content.substring(0, limit);
  };

  static transformResponse = ({
    html,
    tokenLimit,
    shouldShowFullResponse,
  }: {
    html: string;
    tokenLimit?: number;
    shouldShowFullResponse?: boolean;
  }) => {
    const markdown = NodeHtmlMarkdown.translate(html, {});

    if (this.shouldTruncateResponse({ content: markdown, shouldShowFullResponse })) {
      const truncated = this.truncateResponse({
        content: markdown,
        limit: tokenLimit || this.LARGE_CONTENT_SYMBOL_COUNT,
      });

      return { markdown: truncated, isTruncated: true };
    }

    return { markdown, isTruncated: false };
  };

  static register = ({
    server,
    sapiClient,
  }: {
    server: McpServer;
    sapiClient: ScraperApiClient;
  }) => {
    server.tool(
      'scrape_as_markdown',
      'Scrape the contents of a website and return Markdown-formatted results',
      {
        url: z.string().describe('URL to scrape'),
        geo: zodGeo,
        locale: zodLocale,
        jsRender: zodJsRender,
        tokenLimit: zodTokenLimit,
        fullResponse: zodFullResponse,
      },
      async (scrapingParams: ScrapingMCPParams) => {
        const { data } = await sapiClient.scrape({ scrapingParams });

        const { markdown, isTruncated } = this.transformResponse({
          html: data,
          tokenLimit: scrapingParams.tokenLimit,
          shouldShowFullResponse: scrapingParams.fullResponse,
        });

        return {
          content: [
            {
              type: 'text',
              text: isTruncated
                ? `The website content is over ${this.LARGE_CONTENT_SYMBOL_COUNT} symbols, therefore, the content has been truncated. If you wish to obtain the full response, just say "full response". Alternatively, you say a specific token limit in the prompt.`
                : 'Full website content retrieved.',
            },
            {
              type: 'text',
              text: markdown,
            },
          ],
        };
      }
    );
  };
}
