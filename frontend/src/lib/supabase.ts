/**
 * Stub implementation de Supabase para desarrollo sin backend
 * Retorna datos vacíos para permitir el desarrollo del frontend
 */

const makeQueryStub = () => ({
  select: () => makeQueryStub(),
  insert: () => makeQueryStub(),
  update: () => makeQueryStub(),
  delete: () => makeQueryStub(),
  eq: () => makeQueryStub(),
  neq: () => makeQueryStub(),
  gt: () => makeQueryStub(),
  gte: () => makeQueryStub(),
  lt: () => makeQueryStub(),
  lte: () => makeQueryStub(),
  like: () => makeQueryStub(),
  ilike: () => makeQueryStub(),
  is: () => makeQueryStub(),
  in: () => makeQueryStub(),
  contains: () => makeQueryStub(),
  containedBy: () => makeQueryStub(),
  range: () => makeQueryStub(),
  match: () => makeQueryStub(),
  not: () => makeQueryStub(),
  or: () => makeQueryStub(),
  filter: () => makeQueryStub(),
  order: () => makeQueryStub(),
  limit: () => makeQueryStub(),
  single: async () => ({ data: null, error: null }),
  maybeSingle: async () => ({ data: null, error: null }),
  then: async (resolve: any) => resolve({ data: [], error: null }),
});

export const supabase: any = {
  auth: {
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (_table: string) => makeQueryStub(),
  rpc: async () => ({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
  }),
  removeChannel: () => {},
};
