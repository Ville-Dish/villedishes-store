import { useEffect, useState } from "react";

interface UseSearchProps<
  T extends {
    search: string;
    page: number;
  },
> {
  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;
}

export const DEFAULT_PAGE = 1;

export const useSearch = <
  T extends {
    search: string;
    page: number;
  },
>({
  params,
  setParams,
  debounceMs = 500,
}: UseSearchProps<T>) => {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({
        ...params,
        search: "",
        page: DEFAULT_PAGE,
      });
      return;
    }

    const timer = setTimeout(() => {
      if (localSearch !== params.search && localSearch !== "") {
        setParams({
          ...params,
          search: localSearch,
          page: DEFAULT_PAGE,
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, params, setParams, debounceMs]);

  useEffect(() => {
    setLocalSearch(params.search);
  }, []);

  return {
    searchValue: localSearch,
    onSearchChange: setLocalSearch,
  };
};
