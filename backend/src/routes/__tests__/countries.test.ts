/**
 * Integration tests for GET /countries/:code/transfer-info
 *
 * Uses Fastify's built-in `inject` for all HTTP assertions.
 * Includes example-based tests and property-based tests (Properties 7, 8, 9, 13).
 */

import * as fc from 'fast-check';
import { buildApp } from '../../app';

describe('Countries Route — GET /countries/:code/transfer-info', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── HTTP 200 — supported countries ──────────────────────────────────────

  describe('HTTP 200 — supported countries', () => {
    const supportedCodes = ['MX', 'PH', 'GT', 'SV'] as const;

    it.each(supportedCodes)('returns 200 for %s', async (code) => {
      const response = await app.inject({
        method: 'GET',
        url: `/countries/${code}/transfer-info`,
      });
      expect(response.statusCode).toBe(200);
    });

    it.each(supportedCodes)('returns full schema for %s', async (code) => {
      const response = await app.inject({
        method: 'GET',
        url: `/countries/${code}/transfer-info`,
      });
      const body = JSON.parse(response.body);

      expect(typeof body.countryCode).toBe('string');
      expect(typeof body.countryName).toBe('string');
      expect(typeof body.currencyCode).toBe('string');
      // exchangeRate may be a number or null
      expect(body.exchangeRate === null || typeof body.exchangeRate === 'number').toBe(true);
      expect(typeof body.isRestricted).toBe('boolean');
      expect(Array.isArray(body.complianceRules)).toBe(true);
      expect(Array.isArray(body.cashOutMethods)).toBe(true);
    });

    it('returns correct countryCode in response body for MX', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/MX/transfer-info',
      });
      const body = JSON.parse(response.body);
      expect(body.countryCode).toBe('MX');
      expect(body.countryName).toBe('Mexico');
      expect(body.currencyCode).toBe('MXN');
      expect(body.isRestricted).toBe(false);
      expect(body.cashOutMethods.length).toBeGreaterThan(0);
    });

    it('each cashOutMethod has required fields for MX', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/MX/transfer-info',
      });
      const body = JSON.parse(response.body);

      for (const method of body.cashOutMethods) {
        expect(['cash_pickup', 'bank_transfer', 'mobile_money', 'home_delivery']).toContain(method.type);
        expect(typeof method.partnerName).toBe('string');
        expect(method.partnerName.length).toBeGreaterThan(0);
        expect(typeof method.deliveryMinMinutes).toBe('number');
        expect(typeof method.deliveryMaxMinutes).toBe('number');
      }
    });
  });

  // ─── HTTP 200 — restricted countries ─────────────────────────────────────

  describe('HTTP 200 — restricted countries', () => {
    const restrictedCodes = ['RU', 'BY', 'IR', 'KP'] as const;

    it.each(restrictedCodes)('returns 200 for restricted country %s', async (code) => {
      const response = await app.inject({
        method: 'GET',
        url: `/countries/${code}/transfer-info`,
      });
      expect(response.statusCode).toBe(200);
    });

    it.each(restrictedCodes)('returns isRestricted: true for %s', async (code) => {
      const response = await app.inject({
        method: 'GET',
        url: `/countries/${code}/transfer-info`,
      });
      const body = JSON.parse(response.body);
      expect(body.isRestricted).toBe(true);
    });

    it.each(restrictedCodes)('returns empty cashOutMethods for %s', async (code) => {
      const response = await app.inject({
        method: 'GET',
        url: `/countries/${code}/transfer-info`,
      });
      const body = JSON.parse(response.body);
      expect(body.cashOutMethods).toEqual([]);
    });
  });

  // ─── HTTP 400 — invalid country codes ────────────────────────────────────

  describe('HTTP 400 — invalid country codes', () => {
    const invalidCodes = ['123', 'abc', 'MEXICO', 'mx', 'A', 'ABC', ''];

    it.each(invalidCodes)('returns 400 for invalid code %j', async (code) => {
      const url = code === '' ? '/countries//transfer-info' : `/countries/${encodeURIComponent(code)}/transfer-info`;
      const response = await app.inject({ method: 'GET', url });
      // Empty string results in a 404 from Fastify routing (no param), which is acceptable
      expect([400, 404]).toContain(response.statusCode);
    });

    it('returns error body for invalid code "123"', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/123/transfer-info',
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid country code');
    });

    it('returns error body for lowercase code "mx"', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/mx/transfer-info',
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid country code');
    });

    it('returns error body for three-letter code "ABC"', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/ABC/transfer-info',
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid country code');
    });
  });

  // ─── HTTP 404 — unknown but valid-format codes ────────────────────────────

  describe('HTTP 404 — unknown country codes', () => {
    it('returns 404 for unknown code ZZ', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/ZZ/transfer-info',
      });
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Country not supported');
    });

    it('returns 404 for unknown code XX', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/countries/XX/transfer-info',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  // ─── Property 7: API response schema completeness for supported countries ─

  /**
   * Property 7: API response schema completeness for supported countries
   * Validates: Requirements 4.2
   */
  it('Property 7 — schema completeness for all supported countries', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('MX', 'PH', 'GT', 'SV'), async (code) => {
        const response = await app.inject({
          method: 'GET',
          url: `/countries/${code}/transfer-info`,
        });
        const body = JSON.parse(response.body);

        return (
          response.statusCode === 200 &&
          typeof body.countryCode === 'string' &&
          typeof body.countryName === 'string' &&
          typeof body.currencyCode === 'string' &&
          'exchangeRate' in body &&
          typeof body.isRestricted === 'boolean' &&
          Array.isArray(body.complianceRules) &&
          Array.isArray(body.cashOutMethods) &&
          body.cashOutMethods.every(
            (m: any) =>
              typeof m.type === 'string' &&
              typeof m.partnerName === 'string' &&
              typeof m.deliveryMinMinutes === 'number' &&
              typeof m.deliveryMaxMinutes === 'number',
          )
        );
      }),
      { numRuns: 20 },
    );
  });

  // ─── Property 8: Restricted country API response shape ───────────────────

  /**
   * Property 8: Restricted country API response shape
   * Validates: Requirements 4.4
   */
  it('Property 8 — restricted countries return isRestricted: true and empty cashOutMethods', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('RU', 'BY', 'IR', 'KP'), async (code) => {
        const response = await app.inject({
          method: 'GET',
          url: `/countries/${code}/transfer-info`,
        });
        const body = JSON.parse(response.body);

        return (
          response.statusCode === 200 &&
          body.isRestricted === true &&
          Array.isArray(body.cashOutMethods) &&
          body.cashOutMethods.length === 0
        );
      }),
      { numRuns: 20 },
    );
  });

  // ─── Property 9: Country code validation rejects non-alpha-2 ─────────────

  /**
   * Property 9: Country code validation rejects non-alpha-2
   * Validates: Requirements 4.7
   */
  it('Property 9 — non-alpha-2 codes return HTTP 400', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => !/^[A-Z]{2}$/.test(s)),
        async (code) => {
          const response = await app.inject({
            method: 'GET',
            url: `/countries/${encodeURIComponent(code)}/transfer-info`,
          });
          return response.statusCode === 400;
        },
      ),
      { numRuns: 100 },
    );
  });

  // ─── Property 13: Stale rate cache still returns a rate ──────────────────

  /**
   * Property 13: Stale rate cache still returns a rate
   * Validates: Requirements 3.5, 4.6
   */
  it('Property 13 — stale cache returns non-null exchangeRate with rateStaleAt', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('MX', 'PH', 'GT', 'SV'), async (code) => {
        const service = app.container.services.countryMetadata;

        // Seed a stale cache entry (61 minutes old)
        const staleTime = Date.now() - 61 * 60 * 1000;
        service.setCacheEntry(code, { rate: 17.25, cachedAt: staleTime });

        // Mock upstream as unavailable so the stale entry is preserved
        const fetchSpy = jest
          .spyOn(service, 'fetchLiveRate')
          .mockRejectedValue(new Error('upstream unavailable'));

        try {
          const response = await app.inject({
            method: 'GET',
            url: `/countries/${code}/transfer-info`,
          });
          const body = JSON.parse(response.body);

          return (
            response.statusCode === 200 &&
            body.exchangeRate !== null &&
            typeof body.rateStaleAt === 'string' &&
            !isNaN(Date.parse(body.rateStaleAt))
          );
        } finally {
          fetchSpy.mockRestore();
          // Restore a fresh cache entry so other tests are not affected
          service.setCacheEntry(code, { rate: 17.25, cachedAt: Date.now() });
        }
      }),
      { numRuns: 20 },
    );
  });
});
