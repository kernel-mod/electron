// Basic in-memory IndexedDB.

type IndexableDBStorage<Structure> = { [id: string]: Structure };

type IndexableDB<Structure> = {
	storage: IndexableDBStorage<Structure>;
	indexes: Map<any, Set<string>>;
};

export default class Indexer<Structure extends object> {
	database: IndexableDB<Structure> = { storage: {}, indexes: new Map() };

	constructor(data?: IndexableDBStorage<Structure>) {
		for (const [key, value] of Object.entries(data)) {
			this.set(key, value);
		}
	}

	set(id: string, item: Structure) {
		this.database.storage[id] = item;
		for (const [key, value] of Object.entries(item)) {
			const indexable = Indexer.hash(value);
			if (!this.database.indexes.get(indexable)) {
				this.database.indexes.set(indexable, new Set([id]));
			} else {
				this.database.indexes.get(indexable).add(id);
			}
		}
	}

	get(id: string): Structure {
		return this.database.storage[id];
	}

	has() {}

	query(filter: () => boolean): any[] {
		const results = [];
		return results;
	}

	static hash(item: any): any {
		switch (typeof item) {
			case "object":
				return JSON.stringify(item);
			case "number":
			case "function":
				return item;
			default:
				return item.toString();
		}
	}
}
