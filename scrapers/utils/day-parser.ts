/**
 * Parses Spanish text representing days of the week into a list of integers.
 * 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday.
 * Empty array [] represents "all days" (every day).
 */
export function parseDaysOfWeek(text: string): number[] {
  if (!text) return [];

  // Normalize string
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[,;.]/g, ' ') // Remove punctuation
    .trim();

  // Check for "all days" keywords
  const allDaysKeywords = [
    'todos los dias',
    'toda la semana',
    'diario',
    'diariamente',
    'cualquier dia',
    'lunes a domingo',
    'lun a dom'
  ];
  if (allDaysKeywords.some(keyword => normalized.includes(keyword))) {
    return [];
  }

  // Check for common ranges
  if (normalized.includes('lunes a viernes') || normalized.includes('lun a vie')) {
    return [1, 2, 3, 4, 5];
  }
  if (normalized.includes('lunes a sabado') || normalized.includes('lun a sab')) {
    return [1, 2, 3, 4, 5, 6];
  }
  if (normalized.includes('fin de semana') || normalized.includes('fines de semana') || normalized.includes('sabado y domingo')) {
    return [6, 0];
  }

  // Days mapping
  const daysMap: { [key: string]: number } = {
    domingo: 0, dom: 0,
    lunes: 1, lun: 1,
    martes: 2, mar: 2,
    miercoles: 3, mie: 3,
    jueves: 4, jue: 4,
    viernes: 5, vie: 5,
    sabado: 6, sab: 6
  };

  // Helper to parse day from string
  const getDayNum = (dayStr: string): number | null => {
    return daysMap[dayStr] !== undefined ? daysMap[dayStr] : null;
  };

  // Check for generic ranges like "miercoles a viernes" or "mar a jue"
  const rangeRegex = /(lunes|martes|miercoles|jueves|viernes|sabado|domingo|lun|mar|mie|jue|vie|sab|dom)\s+(?:a|al)\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo|lun|mar|mie|jue|vie|sab|dom)/i;
  const match = normalized.match(rangeRegex);
  if (match) {
    const startDay = getDayNum(match[1]);
    const endDay = getDayNum(match[2]);

    if (startDay !== null && endDay !== null) {
      const days: number[] = [];
      let current = startDay;
      while (true) {
        days.push(current);
        if (current === endDay) break;
        current = (current + 1) % 7;
      }
      return days;
    }
  }

  // Individual days extraction
  const foundDays = new Set<number>();
  const words = normalized.split(/\s+/);
  
  // Check full words and prefixes
  for (const word of words) {
    const dayNum = getDayNum(word);
    if (dayNum !== null) {
      foundDays.add(dayNum);
    }
  }

  // As a fallback, check if any of the full day names appear in the text
  const fullDays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  fullDays.forEach((day, index) => {
    if (normalized.includes(day)) {
      foundDays.add(index);
    }
  });

  const result = Array.from(foundDays).sort((a, b) => a - b);
  return result.length === 7 ? [] : result; // If it contains all 7 days, return [] for all days
}
