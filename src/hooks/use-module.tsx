import useFetch from "use-http";
import { useLocalStorage } from "./use-localstorage";

export function useModule(moduleId: string) {
  const module = modules[moduleId];
  const { url } = module;
  const { data, loading, error } = useFetch(url, {
    persist: true
  }, []);
  return {
    data,
    loading, 
    error
  };
}