import { Progress, Stack } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useDHIS2CategoryCombos } from "../../hooks/useDHIS2CategoryCombos";
import { INamed, MetadataAPI } from "../../interfaces";

export default function CategoryComboFilter({
    value,
    onChange,
}: MetadataAPI & {
    value: string | undefined;
    onChange: (val: string | undefined) => void;
}) {
    const { isLoading, isSuccess, isError, error, data } =
        useDHIS2CategoryCombos();

    if (isError) return <pre>{JSON.stringify(error)}</pre>;

    if (isLoading) return <Progress />;

    if (isSuccess && data)
        return (
            <Stack>
                <Select<INamed, false, GroupBase<INamed>>
                    options={data.categoryCombos}
                    getOptionLabel={(d) => d.name ?? ""}
                    getOptionValue={(d) => d.id}
                    value={data.categoryCombos.find((a) => a.id === value)}
                    onChange={(e) => onChange(e?.id)}
                    menuPlacement="top"
                />
            </Stack>
        );

    return null;
}
