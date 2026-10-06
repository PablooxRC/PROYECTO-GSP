import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function usePaginatedList(url, filters = {}, enabled = true) {
  const key = JSON.stringify(filters);
  const [position, setPosition] = useState({ key, page: 1, pageSize: 20 });
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({
    items: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(0);
  const page = position.key === key ? position.page : 1;
  const pageSize = position.pageSize;
  useEffect(() => {
    setPosition(current => current.key === key ? current : {...current, key, page: 1});
    if (!enabled) return;
    const controller = new AbortController();
    const sequence = ++latest.current;
    setLoading(true);
    setError("");
    api
      .get(url, {
        params: { ...JSON.parse(key), page, pageSize },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted && sequence === latest.current)
          setResult(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted && sequence === latest.current)
          setError(
            e.response?.data?.error?.message ||
              e.response?.data?.message ||
              e.message,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted && sequence === latest.current)
          setLoading(false);
      });
    return () => controller.abort();
  }, [url, key, page, pageSize, revision, enabled]);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  return {
    ...result,
    loading,
    error,
    refresh,
    onPageChange: (next) => setPosition({ key, page: next, pageSize }),
    onPageSizeChange: (size) => setPosition({ key, page: 1, pageSize: size }),
  };
}
