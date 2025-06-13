export type ScraperApiResponseData<T = string> = {
  results: {
    content: T;
    headers: Record<string, string>;
    cookies: {}[];
    status_code: number;
    task_id: string;
    created_at: string;
    updated_at: string;
  }[];
};
