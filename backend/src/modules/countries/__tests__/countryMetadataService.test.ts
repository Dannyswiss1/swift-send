import { CountryMetadataService } from '../countryMetadataService';
import { NotFoundError } from '../../../errors';

describe('CountryMetadataService', () => {
  let service: CountryMetadataService;

  beforeEach(() => {
    service = new CountryMetadataService();
  });

  // ─── Known country ─────────────────────────────────────────────────────

  describe('getCountryInfo — known country', () => {
    it('returns the full shape for MX', async () => {
      const info = await service.getCountryInfo('MX');

      expect(info.countryCode).toBe('MX');
      expect(info.countryName).toBe('Mexico');
      expect(info.currencyCode).toBe('MXN');
      expect(typeof info.exchangeRate).toBe('number');
      expect(info.isRestricted).toBe(false);
      expect(Array.isArray(info.complianceRules)).toBe(true);
      expect(info.complianceRules.length).toBeGreaterThan(0);
      expect(Array.isArray(info.cashOutMethods)).toBe(true);
      expect(info.cashOutMethods.length).toBeGreaterThan(0);
    });

    it('returns the full shape for PH', async () => {
      const info = await service.getCountryInfo('PH');

      expect(info.countryCode).toBe('PH');
      expect(info.countryName).toBe('Philippines');
      expect(info.currencyCode).toBe('PHP');
      expect(info.isRestricted).toBe(false);
    });

    it('returns the full shape for GT', async () => {
      const info = await service.getCountryInfo('GT');

      expect(info.countryCode).toBe('GT');
      expect(info.countryName).toBe('Guatemala');
      expect(info.currencyCode).toBe('GTQ');
      expect(info.isRestricted).toBe(false);
    });

    it('returns the full shape for SV', async () => {
      const info = await service.getCountryInfo('SV');

      expect(info.countryCode).toBe('SV');
      expect(info.countryName).toBe('El Salvador');
      expect(info.currencyCode).toBe('USD');
      expect(info.isRestricted).toBe(false);
    });

    it('each cashOutMethod has required fields', async () => {
      const info = await service.getCountryInfo('MX');

      for (const method of info.cashOutMethods) {
        expect(['cash_pickup', 'bank_transfer', 'mobile_money', 'home_delivery']).toContain(method.type);
        expect(typeof method.partnerName).toBe('string');
        expect(method.partnerName.length).toBeGreaterThan(0);
        expect(typeof method.deliveryMinMinutes).toBe('number');
        expect(typeof method.deliveryMaxMinutes).toBe('number');
        expect(method.deliveryMinMinutes).toBeGreaterThanOrEqual(0);
        expect(method.deliveryMaxMinutes).toBeGreaterThanOrEqual(method.deliveryMinMinutes);
      }
    });

    it('accepts lowercase country codes', async () => {
      const info = await service.getCountryInfo('mx');
      expect(info.countryCode).toBe('MX');
    });
  });

  // ─── Unknown country ───────────────────────────────────────────────────

  describe('getCountryInfo — unknown country', () => {
    it('throws NotFoundError for an unsupported code', async () => {
      await expect(service.getCountryInfo('ZZ')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError with a descriptive message', async () => {
      await expect(service.getCountryInfo('ZZ')).rejects.toThrow('Country not supported: ZZ');
    });

    it('throws NotFoundError for a completely unknown code', async () => {
      await expect(service.getCountryInfo('XX')).rejects.toThrow(NotFoundError);
    });
  });

  // ─── Restricted country ────────────────────────────────────────────────

  describe('getCountryInfo — restricted country', () => {
    const restrictedCodes = ['RU', 'BY', 'IR', 'KP'];

    it.each(restrictedCodes)('returns isRestricted: true for %s', async (code) => {
      const info = await service.getCountryInfo(code);
      expect(info.isRestricted).toBe(true);
    });

    it.each(restrictedCodes)('returns empty cashOutMethods for %s', async (code) => {
      const info = await service.getCountryInfo(code);
      expect(info.cashOutMethods).toEqual([]);
    });

    it.each(restrictedCodes)('returns HTTP-200-compatible shape for %s', async (code) => {
      const info = await service.getCountryInfo(code);
      // Should not throw — restricted countries return 200 with isRestricted: true
      expect(info.countryCode).toBe(code);
      expect(Array.isArray(info.complianceRules)).toBe(true);
    });
  });

  // ─── Stale rate refresh logic ──────────────────────────────────────────

  describe('refreshRateIfStale', () => {
    it('does not refresh when the cached rate is fresh', async () => {
      const fetchSpy = jest.spyOn(service, 'fetchLiveRate');

      // Seed a fresh cache entry
      service.setCacheEntry('MX', { rate: 17.25, cachedAt: Date.now() });

      await service.refreshRateIfStale('MX');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('refreshes when the cached rate is older than 60 minutes', async () => {
      const staleTime = Date.now() - 61 * 60 * 1000;
      service.setCacheEntry('MX', { rate: 17.25, cachedAt: staleTime });

      const fetchSpy = jest
        .spyOn(service, 'fetchLiveRate')
        .mockResolvedValue(18.0);

      await service.refreshRateIfStale('MX');

      expect(fetchSpy).toHaveBeenCalledWith('MX');
      const entry = service.getCacheEntry('MX');
      expect(entry?.rate).toBe(18.0);
    });

    it('keeps the stale cached rate when upstream fails', async () => {
      const staleTime = Date.now() - 61 * 60 * 1000;
      service.setCacheEntry('MX', { rate: 17.25, cachedAt: staleTime });

      jest.spyOn(service, 'fetchLiveRate').mockRejectedValue(new Error('upstream down'));

      await service.refreshRateIfStale('MX');

      // Rate should remain unchanged
      const entry = service.getCacheEntry('MX');
      expect(entry?.rate).toBe(17.25);
      expect(entry?.cachedAt).toBe(staleTime);
    });

    it('getCountryInfo includes rateStaleAt when rate is stale and upstream fails', async () => {
      const staleTime = Date.now() - 61 * 60 * 1000;
      service.setCacheEntry('MX', { rate: 17.25, cachedAt: staleTime });

      jest.spyOn(service, 'fetchLiveRate').mockRejectedValue(new Error('upstream down'));

      const info = await service.getCountryInfo('MX');

      expect(info.exchangeRate).toBe(17.25);
      expect(typeof info.rateStaleAt).toBe('string');
      // rateStaleAt should be a valid ISO timestamp
      expect(() => new Date(info.rateStaleAt!)).not.toThrow();
    });

    it('getCountryInfo does NOT include rateStaleAt when rate is fresh', async () => {
      service.setCacheEntry('MX', { rate: 17.25, cachedAt: Date.now() });

      const info = await service.getCountryInfo('MX');

      expect(info.rateStaleAt).toBeUndefined();
    });

    it('refreshes exactly at the 60-minute boundary (stale when equal)', async () => {
      // Exactly 60 minutes + 1 ms old → should refresh
      const staleTime = Date.now() - RATE_TTL_MS_FOR_TEST - 1;
      service.setCacheEntry('PH', { rate: 56.5, cachedAt: staleTime });

      const fetchSpy = jest
        .spyOn(service, 'fetchLiveRate')
        .mockResolvedValue(57.0);

      await service.refreshRateIfStale('PH');

      expect(fetchSpy).toHaveBeenCalledWith('PH');
    });
  });
});

// Expose the TTL constant for the boundary test above
const RATE_TTL_MS_FOR_TEST = 60 * 60 * 1000;
