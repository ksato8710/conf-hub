import { parseISO, isWithinInterval } from 'date-fns';
import { getDateRange } from '@/lib/utils/date';
import type {
  Event,
  EventFilters,
  EventFormat,
  TargetRole,
  TechCategory,
  DesignCategory,
  Region,
  EventSize,
  PriceType,
  TimePeriod,
} from '@/types/event';

export function parseFiltersFromParams(params: URLSearchParams): EventFilters {
  const roles = params.get('roles');
  const techCategories = params.get('techCategories');
  const designCategories = params.get('designCategories');

  return {
    roles: roles ? (roles.split(',') as TargetRole[]) : [],
    techCategories: techCategories ? (techCategories.split(',') as TechCategory[]) : [],
    designCategories: designCategories ? (designCategories.split(',') as DesignCategory[]) : [],
    format: (params.get('format') as EventFormat) || null,
    size: (params.get('size') as EventSize) || null,
    priceType: (params.get('priceType') as PriceType) || null,
    region: (params.get('region') as Region) || null,
    period: (params.get('period') as TimePeriod) || null,
    keyword: params.get('keyword') || '',
  };
}

export function buildFilterParams(filters: EventFilters): string {
  const params = new URLSearchParams();

  if (filters.roles.length > 0) params.set('roles', filters.roles.join(','));
  if (filters.techCategories.length > 0) params.set('techCategories', filters.techCategories.join(','));
  if (filters.designCategories.length > 0) params.set('designCategories', filters.designCategories.join(','));
  if (filters.format) params.set('format', filters.format);
  if (filters.size) params.set('size', filters.size);
  if (filters.priceType) params.set('priceType', filters.priceType);
  if (filters.region) params.set('region', filters.region);
  if (filters.period) params.set('period', filters.period);
  if (filters.keyword) params.set('keyword', filters.keyword);

  return params.toString();
}

export function applyFilters(events: Event[], filters: EventFilters): Event[] {
  return events.filter((event) => {
    // roles: OR match
    if (filters.roles.length > 0) {
      if (!filters.roles.some((role) => event.target_roles.includes(role))) {
        return false;
      }
    }

    // techCategories: OR match
    if (filters.techCategories.length > 0) {
      if (!filters.techCategories.some((cat) => event.tech_categories.includes(cat))) {
        return false;
      }
    }

    // designCategories: OR match
    if (filters.designCategories.length > 0) {
      if (!filters.designCategories.some((cat) => event.design_categories.includes(cat))) {
        return false;
      }
    }

    // format: exact match
    if (filters.format) {
      if (event.format !== filters.format) return false;
    }

    // size: capacity range (null capacity is not excluded)
    if (filters.size) {
      if (event.capacity !== null) {
        switch (filters.size) {
          case 'small':
            if (event.capacity > 100) return false;
            break;
          case 'medium':
            if (event.capacity <= 100 || event.capacity > 500) return false;
            break;
          case 'large':
            if (event.capacity <= 500) return false;
            break;
        }
      }
    }

    // priceType
    if (filters.priceType) {
      switch (filters.priceType) {
        case 'free':
          if (event.price !== 0) return false;
          break;
        case 'paid':
          if (event.price <= 0) return false;
          break;
        case 'early_bird':
          if (event.early_bird_price === null) return false;
          break;
      }
    }

    // region: exact match
    if (filters.region) {
      if (event.region !== filters.region) return false;
    }

    // period: start_date within range
    if (filters.period) {
      const range = getDateRange(filters.period);
      const eventDate = parseISO(event.start_date);
      if (!isWithinInterval(eventDate, { start: range.start, end: range.end })) {
        return false;
      }
    }

    // keyword: title or description (case-insensitive)
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const titleMatch = event.title.toLowerCase().includes(kw);
      const descMatch = event.description?.toLowerCase().includes(kw) ?? false;
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });
}
