export const SupabaseOperators = {
  // Basic Comparison
  EQ: 'eq', // equal to
  NEQ: 'neq', // not equal to
  GT: 'gt',  // greater than
  GTE: 'gte', // greater than or equal to
  LT: 'lt', // less than
  LTE: 'lte', // less than or equal to

  // Text Matching
  LIKE: 'like',
  ILIKE: 'ilike',
  NOT_LIKE: 'not.like',
  NOT_ILIKE: 'not.ilike',
  MATCH: 'match',
  NOT_MATCH: 'not.match',

  // Null & Set
  IN: 'in',
  NOT_IN: 'not.in',
  IS: 'is',
  NOT_IS: 'not.is',

  // Array / JSON
  CONTAINS: 'contains',       // or 'cs'
  CONTAINED_BY: 'containedBy', // or 'cd'

  // Negation
  NOT: 'not', // used as: .not(column, operator, value)

  // Logical
  OR: 'or',   // used as: .or('col.eq.val,col2.eq.val')
  AND: 'and', // implicit by default

  // Full-Text Search
  FTS: 'fts',
  PLFTS: 'plfts',
  PHFTS: 'phfts',
  WFTS: 'wfts',

  // Raw/Custom
  FILTER: 'filter'
}
