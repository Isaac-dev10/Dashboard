// Client-safe mock database stub replacing better-sqlite3.
// Native Node C++ addons cause Windows Access Violation crashes during pnpm build
// and cannot run inside a static Tauri webview. Database persistence will be migrated
// to @tauri-apps/plugin-sql or Rust commands later.

export interface MockDbStatement<ResultType = any> {
  all: (...args: any[]) => ResultType[];
  get: (...args: any[]) => ResultType | undefined;
  run: (...args: any[]) => { changes: number; lastInsertRowid: number };
}

export interface MockDatabase {
  prepare: <BindParameters extends any[] = any[], ResultType = any>(
    query: string,
  ) => MockDbStatement<ResultType>;
  exec: (query: string) => void;
  pragma: (query: string) => void;
  transaction: <T extends (...args: any[]) => any>(fn: T) => T;
}

export const db: MockDatabase = {
  prepare: <BindParameters extends any[] = any[], ResultType = any>() => ({
    all: () => [] as ResultType[],
    get: () => undefined as ResultType | undefined,
    run: () => ({ changes: 0, lastInsertRowid: 0 }),
  }),
  exec: () => {},
  pragma: () => {},
  transaction: (fn) => fn,
};

export default db;
