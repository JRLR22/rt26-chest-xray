import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

const DEFAULT_ERROR = 'No se pudieron cargar los estudios. Revisa que el servidor esté activo.';

/**
 * Carga la lista de estudios. Con `pollMs` la refresca en segundo plano
 * (sin mostrar el cargador ni sustituir la lista por un error).
 */
export function useStudies({ pollMs = 0, errorMessage = DEFAULT_ERROR } = {}) {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    return api.studies()
      .then(data => { setStudies(data); setError(null); })
      .catch(() => { if (!silent) setError(errorMessage); })
      .finally(() => setLoading(false));
  }, [errorMessage]);

  useEffect(() => {
    reload();
    if (!pollMs) return undefined;
    const id = setInterval(() => reload(true), pollMs);
    return () => clearInterval(id);
  }, [reload, pollMs]);

  return { studies, loading, error, setError, reload };
}
