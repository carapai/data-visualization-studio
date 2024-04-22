import { DataNode } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { getDHIS2Resources } from "../../utils";

export const useUserOrganisations = () => {
    return useQuery<DataNode[], Error>({
        queryKey: ["user-organisations"],
        queryFn: async () => {
            return getDHIS2Resources<DataNode>({
                resource: "me.json",
                resourceKey: "dataViewOrganisationUnits",
                isCurrentDHIS2: true,
                params: {
                    fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf~rename(isLeaf),level]",
                },
            });
        },
    });
};
