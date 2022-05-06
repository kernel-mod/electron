export default function getStack(): NodeJS.CallSite[] {
	const original = Error.prepareStackTrace;
	Error.prepareStackTrace = (error, stackTraces) => stackTraces;

	// Normally this returns a string, but we patch it to return an array of the CallSites.
	const stack: NodeJS.CallSite[] = (
		new Error().stack as unknown as NodeJS.CallSite[]
	).slice(1);

	Error.prepareStackTrace = original;
	return stack;
}
