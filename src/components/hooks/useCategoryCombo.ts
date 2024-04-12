import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { CategoryCombo } from "../../interfaces";
import { getDHIS2Resource } from "../../utils";

export const useDHIS2CategoryCombo = (
    isCurrentDHIS2: boolean | undefined | null,
    api: AxiosInstance | undefined | null,
    id: string
) => {
    const params = {
        fields: "categories[id,name,shortName,categoryOptions[id,name,startDate,endDate]],categoryOptionCombos[id,categoryOptions]",
    };
    return useQuery<CategoryCombo, Error>({
        queryKey: ["category-combo", id],
        queryFn: async () => {
            const categoryCombo = await getDHIS2Resource<CategoryCombo>({
                isCurrentDHIS2,
                params,
                api,
                resource: `categoryCombos/${id}.json`,
            });
            // dashboardCategoryComboApi.set(categoryCombo);

            // categoryCombo.categories.forEach((c) => {
            //     const valid = c.categoryOptions.filter(
            //         (a) => a.endDate === undefined
            //     );
            //     attributionApi.add({
            //         [c.id]: valid.map((e) => e.id).join(","),
            //     });
            // });
            return categoryCombo;
        },
    });
};
