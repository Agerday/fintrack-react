// Next bundles Route Handlers and Server Components separately, and each bundle evaluates its own
// copy of a module: a plain `export const store = {...}` would exist twice, and a page rendered on
// the server would never see what an API call changed. globalThis is shared by the whole Node
// process, so every bundle gets the same object. It also survives dev hot reloads.
// Like a Spring singleton bean: one instance per application, whoever injects it
const registryKey = Symbol.for('fintrack.stores');

type Registry = Map<string, unknown>;

function registry(): Registry {
    const root = globalThis as typeof globalThis & { [registryKey]?: Registry };
    root[registryKey] ??= new Map();
    return root[registryKey];
}

// Returns the store registered under `name`, creating it with `create` the first time
export function sharedStore<T>(name: string, create: () => T): T {
    const stores = registry();
    if (!stores.has(name)) stores.set(name, create());
    return stores.get(name) as T;
}

// Tests only: every test file starts from freshly seeded stores, as with module-level stores
export function clearSharedStores() {
    registry().clear();
}
