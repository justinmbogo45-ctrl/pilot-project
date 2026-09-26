export const API_BASE = 'https://propfirmmap.com/api/v1';
export type JsonRecord = Record<string, any>;
export type CatalogSnapshot = { firms: JsonRecord[]; offers: JsonRecord[] };

export function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label} response`);
  return value as JsonRecord;
}
export function numeric(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value.trim())) return null;
  return Number(value);
}
export function validateFirm(value: unknown): JsonRecord {
  const f = record(value, 'firm');
  if (!Number.isSafeInteger(f.id) || typeof f.slug !== 'string' || !/^[a-z0-9-]+$/.test(f.slug) || typeof f.name !== 'string' || !f.name.trim()) throw new Error('Invalid firm identity');
  if (!Array.isArray(f.challenges) || !Array.isArray(f.offers)) throw new Error(`Incomplete firm detail: ${f.slug}`);
  const ids = new Set();
  for (const challenge of f.challenges) {
    if (!Number.isSafeInteger(challenge?.id) || ids.has(challenge.id)) throw new Error(`Invalid challenge identity: ${f.slug}`);
    ids.add(challenge.id);
  }
  return f;
}

// One importer holds the database lock; space requests below the public 60/minute limit.
export class PropFirmMapClient {
  private nextRequestAt = 0;
  constructor(private fetcher: typeof fetch = fetch, private intervalMs = 1100, private sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))) {}

  async get(path: string): Promise<JsonRecord> {
    for (let attempt = 0; attempt < 4; attempt++) {
      await this.sleep(Math.max(0, this.nextRequestAt - Date.now()));
      this.nextRequestAt = Date.now() + this.intervalMs;
      let response: Response;
      try {
        response = await this.fetcher(`${API_BASE}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
      } catch {
        if (attempt === 3) throw new Error('PropFirmMap request timed out or could not connect');
        await this.sleep(1000 * 2 ** attempt);
        continue;
      }
      if (response.status === 429 || response.status >= 500) {
        if (attempt === 3) throw new Error(`PropFirmMap returned HTTP ${response.status}`);
        const retry = response.headers.get('retry-after');
        const delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : retry ? Date.parse(retry) - Date.now() : 2000 * 2 ** attempt;
        // Wait at least one rate-limit window after a 429 without Retry-After.
        await this.sleep(Math.max(response.status === 429 ? 60000 : 1000, Number.isFinite(delay) ? delay : 0));
        continue;
      }
      if (!response.ok) throw new Error(`PropFirmMap returned HTTP ${response.status}`);
      return record(await response.json(), path);
    }
    throw new Error('PropFirmMap request failed');
  }

  async pages(path: '/firms' | '/deals', perPage: number): Promise<JsonRecord[]> {
    const rows: JsonRecord[] = [];
    let lastPage = 1;
    let total: number | undefined;
    for (let page = 1; page <= lastPage; page++) {
      const result = await this.get(`${path}?per_page=${perPage}&page=${page}`);
      const meta = record(result.meta, 'pagination');
      if (!Array.isArray(result.data) || meta.current_page !== page || !Number.isInteger(meta.last_page) || meta.last_page < page || meta.last_page > 1000 || !Number.isInteger(meta.total)) throw new Error('Invalid API pagination');
      if (total !== undefined && total !== meta.total) throw new Error('Catalog changed during pagination; retry sync');
      total = meta.total;
      lastPage = meta.last_page;
      rows.push(...result.data.map((v: unknown) => record(v, 'list item')));
    }
    if (rows.length !== total) throw new Error('Incomplete API pagination');
    return rows;
  }

  async snapshot(onProgress: (message: string) => void = () => {}): Promise<CatalogSnapshot> {
    const list = await this.pages('/firms', 50);
    if (!list.length) throw new Error('Empty firm catalog; keeping the previous snapshot');
    const firms = [];
    const slugs = new Set<string>();
    for (const entry of list) {
      if (typeof entry.slug !== 'string' || !/^[a-z0-9-]+$/.test(entry.slug) || slugs.has(entry.slug)) throw new Error('Invalid or duplicate firm slug');
      const firm = validateFirm((await this.get(`/firms/${entry.slug}`)).data);
      if (firm.slug !== entry.slug || firm.id !== entry.id) throw new Error('Firm identity changed during sync');
      slugs.add(firm.slug);
      firms.push(firm);
      if (firms.length % 25 === 0) onProgress(`Fetched ${firms.length}/${list.length} firms`);
    }
    const offers = await this.pages('/deals', 100);
    const offerIds = new Set();
    for (const offer of offers) {
      if (!Number.isSafeInteger(offer.id) || offerIds.has(offer.id) || !slugs.has(offer.firm?.slug)) throw new Error('Invalid deal identity or unknown firm');
      if (offer.expires_at != null && !Number.isFinite(Date.parse(offer.expires_at))) throw new Error('Invalid offer expiry');
      offerIds.add(offer.id);
    }
    return { firms, offers };
  }
}
