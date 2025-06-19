import axios, { AxiosResponse } from 'axios';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { ScraperApiResponseData } from './types';
import { ScraperAPIParams, ScrapingMCPParams } from 'types';

export class ScraperApiClient {
  auth: string;

  constructor({ auth }: { auth: string }) {
    this.auth = auth;
  }

  transformScrapingParams = ({
    scrapingParams,
  }: {
    scrapingParams: ScrapingMCPParams;
  }): ScraperAPIParams => {
    const { jsRender, ...rest } = scrapingParams;
    const transformed = { ...(jsRender && { headless: 'html' }), ...rest };

    return transformed;
  };

  transformResponse = <T>({ res }: { res: AxiosResponse<ScraperApiResponseData<T>> }) => {
    const content = res.data.results[0].content;

    return { ...res, data: content };
  };

  scrape = async <T = string>({ scrapingParams }: { scrapingParams: ScrapingMCPParams }) => {
    const transformedParams = this.transformScrapingParams({ scrapingParams });

    const res = await axios.request<ScraperApiResponseData<T>>({
      url: 'https://scraper-api.decodo.com/v2/scrape',
      method: 'POST',
      headers: {
        authorization: `Basic ${this.auth}`,
        'x-integration': 'mcp',
      },
      data: {
        ...transformedParams,
      },
    });

    const response = this.transformResponse({ res });

    return response;
  };
}
