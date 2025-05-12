import { useEffect, useState } from "react";

const useQuery = ({ search }: { search: string }) => {
  const [query, setQuery] = useState<URLSearchParams | null>();

  useEffect(() => {
    if (!search) return;
    const newQuery = new URLSearchParams(search);
    setQuery(newQuery);
  }, [search]);

  return query;
};

export default useQuery;
