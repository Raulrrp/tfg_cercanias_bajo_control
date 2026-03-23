import { useState, useEffect } from 'react';
import { fetchUpdates } from '../services/update-service.js';

export const useUpdates = () => {
    const [updates, setUpdates] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUpdates = async () => {
            try {
                const data = await fetchUpdates();
                setUpdates(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setUpdates([]);
            } finally {
                setLoading(false);
            }
        };
        loadUpdates();
    }, []);

    return { updates, error, loading };
}