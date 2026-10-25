// Recorded vocabulary audio and synthesized lesson speech share one playback owner.
let currentStop: (() => void) | undefined;

export function claimLessonMedia(stop: () => void): () => void {
	if (currentStop !== stop) {
		const previous = currentStop;
		currentStop = stop;
		previous?.();
	}
	return () => {
		if (currentStop === stop) currentStop = undefined;
	};
}
