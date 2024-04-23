import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { INamed } from "../../interfaces";
import { getDHIS2Resources } from "../../utils";

export const useDHIS2CategoryCombos = (
    isCurrentDHIS2: boolean | undefined | null,
    api: AxiosInstance | undefined | null
) => {
    const params = {
        paging: "false",
        fields: "id,name",
        filter: "dataDimensionType:eq:ATTRIBUTE",
    };

    return useQuery<Array<INamed>, Error>({
        queryKey: ["category-combos"],
        queryFn: async () => {
            return getDHIS2Resources<INamed>({
                isCurrentDHIS2,
                resource: "categoryCombos.json",
                params,
                api,
                resourceKey: "categoryCombos",
            });
        },
    });
};
