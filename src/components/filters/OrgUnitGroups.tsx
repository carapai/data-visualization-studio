import { useOrgUnitGroups } from "@/hooks/useOrgUnitGroups";
import { INamed } from "@/interfaces";
import { Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import LoadingIndicator from "../LoadingIndicator";

export default function OrgUnitGroups({
    value,
    onChange,
}: {
    value: string[] | undefined;
    onChange: (value: string[] | undefined) => void;
}) {
    const { error, isError, isLoading, data, isSuccess } = useOrgUnitGroups();
    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <LoadingIndicator />;
    if (isSuccess)
        return (
            <Stack>
                <Text>OrganisationUnit Level</Text>
                <Select<INamed, true, GroupBase<INamed>>
                    value={data.filter(
                        (pt) => value && pt.id && value.indexOf(pt.id) !== -1
                    )}
                    onChange={(e) => onChange(e?.map((a) => a.id))}
                    options={data}
                    isClearable
                    getOptionValue={(x) => String(x.id)}
                    getOptionLabel={(x) => x.name ?? ""}
                    isMulti
                />
            </Stack>
        );

    return null;
}
