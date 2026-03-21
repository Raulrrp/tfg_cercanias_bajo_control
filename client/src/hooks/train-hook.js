import { useEffect, useRef, useState } from 'react';
import { fetchTrains } from '../services/train-service.js';

const TRAIN_REFRESH_INTERVAL_MS = 20000;

export const useTrains = () => {
	const [trains, setTrains] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		const loadTrains = async () => {
			try {
				const data = await fetchTrains();
				if (!isMountedRef.current) return;

				setTrains(data);
				setError(null);
				setLastUpdatedAt(new Date());
			} catch (err) {
				if (!isMountedRef.current) return;
				setError(err.message);
			} finally {
				if (isMountedRef.current) {
					setLoading(false);
				}
			}
		};

		// First immediate load.
		loadTrains();

		// Keep the client view in sync with the server refresh cadence.
		const intervalId = setInterval(loadTrains, TRAIN_REFRESH_INTERVAL_MS);

		return () => {
			isMountedRef.current = false;
			clearInterval(intervalId);
		};
	}, []);

	return { trains, error, loading, lastUpdatedAt };
};
