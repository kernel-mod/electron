export default function deepFreeze<Type extends object | any[]>(
	obj: Type
): Readonly<Type> {
	const frozen: object = Array.isArray(obj) ? [...obj] : { ...obj };
	for (const [key, value] of Object.entries(obj)) {
		if (typeof obj[key] === "object") {
			frozen[key] = deepFreeze(value);
			continue;
		}
		frozen[key] = value;
	}
	return Object.freeze(frozen as Type);
}
