import { SCRAPER_API_TARGETS } from './constants';

export type ScrapingMCPParams = {
  url?: string;
  query?: string;
  geo?: string;
  locale?: string;
  jsRender?: boolean;
};

export type ScraperAPIParams = {
  target?: SCRAPER_API_TARGETS;
  url?: string;
  query?: string;
  geo?: string;
  locale?: string;
  headless?: string;
  parse?: boolean;
};
