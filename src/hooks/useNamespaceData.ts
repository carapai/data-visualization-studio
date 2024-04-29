import { useQuery } from "@tanstack/react-query";
import { getDHIS2NamespaceData } from "../utils";

export const useNamespaceData = <TData>(namespace: string) => {
    return useQuery<TData[], Error>({
        queryKey: [namespace],
        queryFn: async ({ signal }) => {
            return getDHIS2NamespaceData<TData>(namespace, signal);
        },
    });
};
