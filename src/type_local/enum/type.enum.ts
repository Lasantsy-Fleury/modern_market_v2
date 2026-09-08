function translateType(type: string, lang: 'mg' | 'fr'): string {
  const translations = {
    magasin: { mg: 'fivarotana', fr: 'magasin' },
    restaurant: { mg: 'trano fisakafoanana', fr: 'restaurant' },
    // ...
  };
  return translations[type]?.[lang] || type;
}