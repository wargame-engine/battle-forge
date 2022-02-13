import * as React from "react";
import { useSearchParams } from "react-router-dom";

export default function useQueryParam(
  key,
  defaultValue
) {
  let [searchParams, setSearchParams] = useSearchParams();
  let paramValue = searchParams.get(key);

  let value = React.useMemo(() => paramValue ?? defaultValue ?? 0, [paramValue, defaultValue]);

  let setValue = React.useCallback(
    (newValue, options) => {
      let newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(key, newValue + '');
      setSearchParams(newSearchParams, options);
    },
    [key, searchParams, setSearchParams]
  );

  return [value, setValue];
}