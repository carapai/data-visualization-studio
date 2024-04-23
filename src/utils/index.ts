import { fromPairs, groupBy } from "lodash";
import axiosInstance from "../axios-instance";
import dayjs, { ManipulateType } from "dayjs";
import { evaluate } from "mathjs";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import axios, { AxiosInstance } from "axios";
import { getOr } from "lodash/fp";
import { Authentication, Option } from "@/interfaces";
import { colorSets, ColourTypes } from "./dhis2Utils";

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

export const generatePeriods = (date: string) => {
    const period = dayjs(date);
    const month = period.format("YYYYMM");
    const quarter = period.format("YYYY[Q]Q");
    const year = period.format("YYYY");
    const week = period.format("YYYY[W]W");
    let financialYear = "";
    const currentYear = period.year();
    const nextYear = currentYear + 1;

    const isAfterFinancialYearStart = period.isAfter(
        dayjs().month(5).date(30).subtract(1, "year")
    );
    const isBeforeFinancialYearEnd = period.isBefore(dayjs().month(5).date(30));

    if (isAfterFinancialYearStart && isBeforeFinancialYearEnd) {
        financialYear = `FY ${currentYear - 1}/${currentYear}`;
    } else {
        financialYear = `FY ${currentYear}/${nextYear}`;
    }

    return { month, quarter, year, week, financialYear };
};

const getValue = (value: number) => {
    if (value >= 75) return "a";
    if (value >= 50) return "t";

    return "u";
};

const events = (data: any) => {
    return data.events.flatMap(({ dataValues, eventDate, ...rest }: any) => {
        return dataValues.map((dv: any) => {
            return {
                ...dv,
                ...rest,
                eventDate,
                ...generatePeriods(eventDate),
            };
        });
    });
};

const dataElementGroupElements = (data: any) => {
    const {
        id: dataElementGroupId,
        name: dataElementGroupName,
        code: dataElementGroupCode,
        dataElements,
    } = data;
    return dataElements.flatMap(({ id, name, code, description }: any) => ({
        id,
        name,
        code,
        dataElementGroupId,
        dataElementGroupName,
        dataElementGroupCode,
        description,
    }));
};

const dataElements = (data: any) => {
    return data.dataElements;
};

export const datElementGroupSetsDataElementGroupsWithAttributes = (
    data: any
) => {
    return data.dataElements.map(
        ({
            id,
            name,
            attributeValues: elementAttributes,
            dataElementGroups,
            description,
        }: any) => {
            let subKeyResultArea: string = "";
            let keyResultArea: string = "";
            let attributeName: string = "";
            let deAttributeName = "";
            let deAttributeValue = "";
            let value: string = "";
            let shortName = "";
            let subKeyResultAreaCode: string = "";
            let keyResultAreaCode: string = "";

            if (elementAttributes.length > 0) {
                const [
                    {
                        value: val1,
                        attribute: { name },
                    },
                ] = elementAttributes;
                deAttributeName = name;
                deAttributeValue = val1;
            }

            if (dataElementGroups && dataElementGroups.length > 0) {
                const filtered = dataElementGroups.filter(
                    ({ id }: any) => id !== "ZTv2IkjG5K7"
                );

                if (filtered.length > 0) {
                    const [
                        {
                            name: dataElementGroupName,
                            code: dataElementGroupCode,
                            groupSets,
                            shortName: dataElementGroupShortName,
                        },
                    ] = filtered;

                    subKeyResultArea = dataElementGroupName;
                    shortName = dataElementGroupShortName;
                    subKeyResultAreaCode = dataElementGroupCode;

                    if (groupSets && groupSets.length > 0) {
                        const [
                            {
                                name: dataElementGroupSetName,
                                attributeValues,
                                code: dataElementGroupSetCode,
                            },
                        ] = groupSets;

                        keyResultArea = dataElementGroupSetName;
                        keyResultAreaCode = dataElementGroupSetCode;

                        if (attributeValues.length > 0) {
                            const [
                                {
                                    value: val1,
                                    attribute: { name },
                                },
                            ] = attributeValues;
                            attributeName = name;
                            value = val1;
                        }
                    }
                }
            }
            return {
                id,
                name,
                subKeyResultArea,
                subKeyResultAreaCode,
                shortName,
                keyResultArea,
                keyResultAreaCode,
                description,
                [attributeName]: value,
                [deAttributeName]: deAttributeValue,
            };
        }
    );
};

const dataElementGroupsDataElements = (data: any) => {
    return data.dataElementGroups.flatMap(
        ({
            dataElements,
            id: dataElementGroupId,
            name: dataElementGroupName,
            code: dataElementGroupCode,
        }: any) => {
            return dataElements.map(({ id, name, code, description }: any) => {
                return {
                    id,
                    name,
                    code,
                    dataElementGroupId,
                    dataElementGroupName,
                    dataElementGroupCode,
                    description,
                };
            });
        }
    );
};

export const processDirectives = (data: any) => {
    return Object.entries(groupBy(data, (d) => `${d["dx"]}${d["pe"]}`)).map(
        ([, group]) => {
            const gp = group[0];
            return {
                ...gp,
                label: getValue(Number(gp.value)),
            };
        }
    );
};

const allOptions: Partial<{
    [key: string]: (data: any) => any[];
}> = {
    events,
    dataElementGroupElements,
    datElementGroupSetsDataElementGroupsWithAttributes,
    dataElements,
    dataElementGroupsDataElements,
    processDirectives,
};

export const merge2DataSources = (
    from: any[],
    to: any[],
    fromColumn: string,
    toColumn: string,
    fromFirst: boolean
) => {
    if (fromFirst) {
        return from.flatMap((e) => {
            const filtered = to.filter((ev) => {
                return ev[toColumn] === e[fromColumn];
            });
            if (filtered.length > 0) {
                return filtered.map((f) => {
                    return { ...f, ...e };
                });
            }
            return e;
        });
    }
    return to.flatMap((e) => {
        const filtered = from.filter((ev) => {
            return ev[fromColumn] === e[toColumn];
        });
        if (filtered.length > 0) {
            return filtered.map((f) => {
                return { ...f, ...e };
            });
        }
        return e;
    });
};

export const getDHIS2NamespaceData = async <TData>(
    namespace: string,
    signal?: AbortSignal
): Promise<TData[]> => {
    const { data } = await axiosInstance.get<string[]>(
        `dataStore/${namespace}`
    );
    const request = data.map((key) =>
        axiosInstance.get<TData>(`dataStore/${namespace}/${key}`, { signal })
    );
    const requestData = await Promise.all(request);
    return requestData.map(({ data }) => data);
};

export const divideTargets = (
    data: any,
    { divide, dividingString }: { divide: boolean; dividingString: string }
) => {
    if (divide && dividingString && data) {
        return data.flatMap(({ value, ...rest }: any) => {
            const diviser = dividingString.split(",");

            return diviser.map((s) => ({
                ...rest,
                value: Number(value) / diviser.length,
                c: s,
            }));
        });
    }
    return data;
};

export const getDHIS2NamespaceKeyData = async <TData>(
    namespace: string,
    key: string
) => {
    const { data } = await axiosInstance.get<TData>(
        `dataStore/${namespace}/${key}`
    );
    return data;
};
export const processAnalyticsData = ({
    headers,
    rows,
    metaData,
    options,
}: {
    headers: any[];
    rows: string[][];
    metaData: any;
    options: Partial<{
        includeEmpty: boolean;
        flatteningOption: string;
        valueIfEmpty: string;
    }>;
}) => {
    const finalHeaders = headers.filter((header) => header.meta);
    let values: { [key: string]: string } = {};
    if (rows) {
        values = fromPairs(
            rows.map((r) => [
                r.slice(0, r.length - 1).join(""),
                r[r.length - 1],
            ])
        );
    }

    if (finalHeaders.length === 1) {
        const label1 = finalHeaders[0].name;
        const first = metaData.dimensions[label1] || [];
        const currentData = [];
        for (const item of first) {
            currentData.push({
                [label1]: item,
                [`${label1}-name`]: metaData.items[item]?.name,
                value: values[item] || options.valueIfEmpty,
            });
        }
        return currentData;
    }
    if (finalHeaders.length === 2) {
        const label1 = finalHeaders[0].name;
        const label2 = finalHeaders[1].name;
        const first: string[] = metaData.dimensions[label1] || [];
        const second: string[] = metaData.dimensions[label2] || [];
        const currentData = [];

        for (const item of first) {
            for (const item2 of second) {
                currentData.push({
                    [label1]: item,
                    [label2]: item2,
                    [`${label1}-name`]: metaData.items[item]?.name,
                    [`${label2}-name`]: metaData.items[item2]?.name,
                    value: values[`${item}${item2}`] || options.valueIfEmpty,
                });
            }
        }

        return currentData;
    }
    if (finalHeaders.length === 3) {
        const label0 = finalHeaders[0].name;
        const label1 = finalHeaders[1].name;
        const label2 = finalHeaders[2].name;
        const first: string[] = metaData.dimensions[label0] || [];
        const second: string[] = metaData.dimensions[label1] || [];
        const third: string[] = metaData.dimensions[label2] || [];
        const currentData = [];
        for (const item0 of first) {
            for (const item1 of second) {
                for (const item2 of third) {
                    currentData.push({
                        [label0]: item0,
                        [label1]: item1,
                        [label2]: item2,
                        [`${label0}-name`]: metaData.items[item0]?.name,
                        [`${label1}-name`]: metaData.items[item1]?.name,
                        [`${label2}-name`]: metaData.items[item2]?.name,
                        value:
                            values[`${item0}${item1}${item2}`] ||
                            options.valueIfEmpty,
                    });
                }
            }
        }
        return currentData;
    }

    if (finalHeaders.length === 4) {
        const label0 = finalHeaders[0].name;
        const label1 = finalHeaders[1].name;
        const label2 = finalHeaders[2].name;
        const label3 = finalHeaders[3].name;
        const first: string[] = metaData.dimensions[label0] || [];
        const second: string[] = metaData.dimensions[label1] || [];
        const third: string[] = metaData.dimensions[label2] || [];
        const fourth: string[] = metaData.dimensions[label3] || [];
        const currentData = [];
        for (const item0 of first) {
            for (const item1 of second) {
                for (const item2 of third) {
                    for (const item3 of fourth) {
                        currentData.push({
                            [label0]: item0,
                            [label1]: item1,
                            [label2]: item2,
                            [label3]: item3,
                            [`${label0}-name`]: metaData.items[item0]?.name,
                            [`${label1}-name`]: metaData.items[item1]?.name,
                            [`${label2}-name`]: metaData.items[item2]?.name,
                            [`${label3}-name`]: metaData.items[item3]?.name,
                            value:
                                values[`${item0}${item1}${item2}${item3}`] ||
                                options.valueIfEmpty,
                        });
                    }
                }
            }
        }
        return currentData;
    }
};

export const flattenDHIS2Data = (
    data: any,
    options: Partial<{
        includeEmpty: boolean;
        flatteningOption: string;
        valueIfEmpty: string;
        divide: boolean;
        dividingString: string;
    }>
) => {
    if (data && (data.headers || data.listGrid)) {
        let rows: string[][] = [];
        let headers: any[] = [];

        if (data.listGrid) {
            headers = data.listGrid.headers;
            rows = data.listGrid.rows;
        } else {
            headers = data.headers;
            rows = data.rows;
        }
        if (
            options.includeEmpty &&
            headers !== undefined &&
            data.metaData.dimensions
        ) {
            data = processAnalyticsData({
                headers,
                rows,
                options,
                metaData: data.metaData,
            });
        } else {
            if (headers !== undefined && rows !== undefined) {
                data = rows.map((row: string[]) => {
                    let others = {};

                    if (data.metaData && data.metaData.items) {
                        row.forEach((r, index) => {
                            if (index < row.length - 1) {
                                others = {
                                    ...others,
                                    [`${headers?.[index].name}-name`]:
                                        data.metaData.items[r]?.name || "",
                                };
                            }
                        });
                    }
                    return {
                        ...others,
                        ...fromPairs(
                            row.map((value, index) => {
                                const header = headers?.[index];
                                return [header.name, value];
                            })
                        ),
                    };
                });
            }
        }
    }
    if (options.flatteningOption) {
        return allOptions[options.flatteningOption]?.(data) || data;
    }
    if (options.divide && options.dividingString) {
        return divideTargets(data, {
            divide: options.divide,
            dividingString: options.dividingString,
        });
    }
    return data;
};

export const deriveSingleValues = (
    data: { [key: string]: any },
    expression?: string
) => {
    if (expression !== undefined) {
        let finalExpression = expression;
        const all = expression.match(/#{\w+.?\w*}/g);
        if (all) {
            all.forEach((s) => {
                const val =
                    data[
                        s.replace("#", "").replace("{", "").replace("}", "")
                    ] || 0;
                finalExpression = finalExpression.replace(s, val);
            });
        }
        try {
            const evaluation = evaluate(finalExpression);
            return [{ value: evaluation }];
        } catch (error) {
            return [{ value: "" }];
        }
    }
};

export const getDHIS2Resource = async <T>({
    isCurrentDHIS2,
    params,
    resource,
    api,
}: Partial<{
    params: { [key: string]: string };
    resource: string;
    isCurrentDHIS2: boolean | undefined | null;
    api: AxiosInstance | undefined | null;
}>) => {
    if (isCurrentDHIS2 && resource) {
        const { data } = await axiosInstance.get<T>(resource, { params });

        return data;
    } else if (api && resource) {
        const { data } = await api.get<T>(resource, {
            params,
        });
        return data;
    }
    return {} as T;
};

export const getDHIS2Resources = async <T>({
    isCurrentDHIS2,
    params,
    resource,
    resourceKey,
    api,
}: Partial<{
    params: { [key: string]: string };
    resource: string;
    isCurrentDHIS2: boolean | undefined | null;
    resourceKey: string;
    api: AxiosInstance | undefined | null;
    engine: any;
}>) => {
    if (isCurrentDHIS2 && resource && resourceKey) {
        const { data } = await axiosInstance.get<{ [key: string]: T[] }>(
            resource,
            { params }
        );
        return getOr([], resourceKey, data);
    } else if (isCurrentDHIS2 && resource) {
        const { data } = await axiosInstance.get<T[]>(resource, { params });
        return data;
    } else if (api && resource && resourceKey) {
        const { data } = await api.get<{ [key: string]: T[] }>(resource, {
            params,
        });
        return data[resourceKey];
    } else if (api && resource) {
        const { data } = await api.get<T[]>(resource, {
            params,
        });
        return data;
    }
    return [];
};

export const createAxios = (authentication: Authentication | undefined) => {
    if (authentication) {
        return axios.create({
            baseURL: `${authentication.url}/api/`,
            auth: {
                username: authentication.username,
                password: authentication.password,
            },
        });
    }
    return undefined;
};

export const findParameters = (visualization: any) => {
    const colors =
        colorSets[visualization.colorSet as ColourTypes]?.colors ||
        colorSets["DEFAULT"].colors;
    switch (visualization.type) {
        case "COLUMN":
            return {
                type: "bar",
                ["data.orientation"]: "v",
                category:
                    visualization.rows.length > 0
                        ? `${visualization.rows[0].dimension}-name`
                        : undefined,
                series:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                ["layout.colorway"]: colors,
                summarize: false,
            };
        case "LINE":
            return {
                type: "line",
                category:
                    visualization.rows.length > 0
                        ? `${visualization.rows[0].dimension}-name`
                        : undefined,
                series:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                ["layout.colorway"]: colors,
                summarize: false,
            };
        case "STACKED_COLUMN":
            return {
                type: "bar",
                ["layout.barmode"]: "stack",
                ["data.orientation"]: "v",
                category:
                    visualization.rows.length > 0
                        ? `${visualization.rows[0].dimension}-name`
                        : undefined,
                series:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                ["layout.colorway"]: colors,
                summarize: false,
            };
        case "BAR":
            return {
                type: "bar",
                ["data.orientation"]: "h",
                category:
                    visualization.rows.length > 0
                        ? `${visualization.rows[0].dimension}-name`
                        : undefined,
                series:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                ["layout.colorway"]: colors,
                summarize: false,
            };
        case "STACKED_BAR":
            return {
                type: "bar",
                ["layout.barmode"]: "stack",
                ["data.orientation"]: "h",
                category:
                    visualization.rows.length > 0
                        ? `${visualization.rows[0].dimension}-name`
                        : undefined,
                series:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                ["layout.colorway"]: colors,
                summarize: false,
            };
        case "AREA":
            return { type: "area" };
        case "STACKED_AREA":
            return { type: "bar" };
        case "PIE":
            return {
                type: "pie",
                summarize: false,
                labels:
                    visualization.columns.length > 0
                        ? `${visualization.columns[0].dimension}-name`
                        : undefined,
                values: "value",
            };
        case "RADAR":
            return { type: "bar" };
        case "GAUGE":
            return { type: "gauge" };
        case "YEAR_OVER_YEAR_LINE":
            return { type: "line" };
        case "YEAR_OVER_YEAR_COLUMN":
            return { type: "bar" };
        case "SCATTER":
            return { type: "line" };
        case "BUBBLE":
            return { type: "line" };
        case "SINGLE_VALUE":
            return { type: "single" };
        case "PIVOT_TABLE":
            return {
                type: "tables",
                rows: visualization.rows
                    .map((row: any) => `${row.dimension}-name`)
                    .join(","),
                columns: visualization.columns
                    .map((column: any) => `${column.dimension}-name`)
                    .join(","),
                showHeaders: true,
                summarize: true,
                aggregation: "sum",
                aggregationColumn: "value",
                cellHeight: "sm",
            };

        default:
            return {};
    }
};

export const createOptions = (options: string[]) => {
    return options.map((option: string) => {
        return { label: option, value: option };
    });
};

export const createOptions2 = (labels: string[], values: string[]) => {
    if (labels.length === values.length) {
        return labels.map((label, index) => {
            return {
                label,
                value: values[index],
            };
        });
    }
    return [];
};

const lastNPeriods = (
    n: number,
    periodType: ManipulateType,
    includeCurrent: boolean = false
) => {
    /*The momentjs fomarts for the periodsTypes*/
    const dateFormats: { [key: string]: string } = {
        days: "YYYYMMDD",
        weeks: "YYYY[W]W",
        months: "YYYYMM",
        years: "YYYY",
        quarters: "YYYY[Q]Q",
    };

    const periods = new Set<string>();
    /* toLocaleUpperCase() is added because of special treatment to quarters formating*/
    if (n === 0) {
        periods.add(dayjs().format(dateFormats[periodType]));
        return Array.from(periods);
    }
    for (let i = n; i >= 1; i--) {
        periods.add(
            dayjs().subtract(i, periodType).format(dateFormats[periodType])
        );
    }
    if (includeCurrent) {
        periods.add(dayjs().format(dateFormats[periodType]));
    }
    return Array.from(periods);
};

export const relativePeriods: { [key: string]: Option[] } = {
    DAILY: [
        { value: "TODAY", label: "Today" },
        { value: "YESTERDAY", label: "Yesterday" },
        { value: "LAST_3_DAYS", label: "Last 3 days" },
        { value: "LAST_7_DAYS", label: "Last 7 days" },
        { value: "LAST_14_DAYS", label: "Last 14 days" },
        { value: "LAST_30_DAYS", label: "Last 30 days" },
        { value: "LAST_60_DAYS", label: "Last 60 days" },
        { value: "LAST_90_DAYS", label: "Last 90 days" },
        { value: "LAST_180_DAYS", label: "Last 180 days" },
    ],
    WEEKLY: [
        { value: "THIS_WEEK", label: "This week" },
        { value: "LAST_WEEK", label: "Last week" },
        { value: "LAST_4_WEEKS", label: "Last 4 weeks" },
        { value: "LAST_12_WEEKS", label: "Last 12 weeks" },
        { value: "LAST_52_WEEKS", label: "Last 52 weeks" },
        { value: "WEEKS_THIS_YEAR", label: "Weeks this year" },
    ],
    BIWEEKLY: [
        { value: "THIS_BIWEEK", label: "This bi-week" },
        { value: "LAST_BIWEEK", label: "Last bi-week" },
        { value: "LAST_4_BIWEEKS", label: "Last 4 bi-weeks" },
    ],
    MONTHLY: [
        { value: "THIS_MONTH", label: "This month" },
        { value: "LAST_MONTH", label: "Last month" },
        { value: "LAST_3_MONTHS", label: "Last 3 months" },
        { value: "LAST_6_MONTHS", label: "Last 6 months" },
        { value: "LAST_12_MONTHS", label: "Last 12 months" },
        {
            value: "MONTHS_THIS_YEAR",
            label: "Months this year",
        },
    ],
    BIMONTHLY: [
        { value: "THIS_BIMONTH", label: "This bi-month" },
        { value: "LAST_BIMONTH", label: "Last bi-month" },
        {
            value: "LAST_6_BIMONTHS",
            label: "Last 6 bi-months",
        },
        {
            value: "BIMONTHS_THIS_YEAR",
            label: "Bi-months this year",
        },
    ],
    QUARTERLY: [
        { value: "THIS_QUARTER", label: "This quarter" },
        { value: "LAST_QUARTER", label: "Last quarter" },
        { value: "LAST_4_QUARTERS", label: "Last 4 quarters" },
        {
            value: "QUARTERS_THIS_YEAR",
            label: "Quarters this year",
        },
    ],
    SIXMONTHLY: [
        { value: "THIS_SIX_MONTH", label: "This six-month" },
        { value: "LAST_SIX_MONTH", label: "Last six-month" },
        {
            value: "LAST_2_SIXMONTHS",
            label: "Last 2 six-month",
        },
    ],
    FINANCIAL: [
        {
            value: "THIS_FINANCIAL_YEAR",
            label: "This financial year",
        },
        {
            value: "LAST_FINANCIAL_YEAR",
            label: "Last financial year",
        },
        {
            value: "LAST_5_FINANCIAL_YEARS",
            label: "Last 5 financial years",
        },
    ],
    YEARLY: [
        { value: "THIS_YEAR", label: "This year" },
        { value: "LAST_YEAR", label: "Last year" },
        { value: "LAST_5_YEARS", label: "Last 5 years" },
        { value: "LAST_10_YEARS", label: "Last 10 years" },
    ],
};

export const relativePeriods2: any = {
    TODAY: lastNPeriods(0, "days"),
    YESTERDAY: lastNPeriods(1, "days"),
    LAST_3_DAYS: lastNPeriods(3, "days"),
    LAST_7_DAYS: lastNPeriods(7, "days"),
    LAST_14_DAYS: lastNPeriods(14, "days"),
    LAST_30_DAYS: lastNPeriods(30, "days"),
    LAST_60_DAYS: lastNPeriods(60, "days"),
    LAST_90_DAYS: lastNPeriods(90, "days"),
    LAST_180_DAYS: lastNPeriods(180, "days"),
    THIS_WEEK: lastNPeriods(0, "weeks"),
    LAST_WEEK: lastNPeriods(1, "weeks"),
    LAST_4_WEEKS: lastNPeriods(4, "weeks"),
    LAST_12_WEEKS: lastNPeriods(12, "weeks"),
    LAST_52_WEEKS: lastNPeriods(52, "weeks"),
    WEEKS_THIS_YEAR: lastNPeriods(dayjs().isoWeek() - 1, "weeks", true),
    THIS_MONTH: lastNPeriods(0, "months"),
    LAST_MONTH: lastNPeriods(1, "months"),
    LAST_3_MONTHS: lastNPeriods(3, "months"),
    LAST_6_MONTHS: lastNPeriods(6, "months"),
    LAST_12_MONTHS: lastNPeriods(12, "months"),
    MONTHS_THIS_YEAR: lastNPeriods(dayjs().month(), "months", true),
    THIS_YEAR: lastNPeriods(0, "years"),
    LAST_YEAR: lastNPeriods(1, "years"),
    LAST_5_YEARS: lastNPeriods(5, "years"),
    LAST_10_YEARS: lastNPeriods(10, "years"),
    THIS_QUARTER: lastNPeriods(0, "months"),
    LAST_QUARTER: lastNPeriods(1 * 3, "months"),
    LAST_4_QUARTERS: lastNPeriods(4 * 3, "months"),
    QUARTERS_THIS_YEAR: lastNPeriods(
        (dayjs().quarter() - 1) * 3,
        "months",
        true
    ),
};

export const fixedPeriods = [
    "DAILY",
    "WEEKLY",
    "WEEKLYWED",
    "WEEKLYTHU",
    "WEEKLYSAT",
    "WEEKLYSUN",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "QUARTERLYNOV",
    "SIXMONTHLY",
    "SIXMONTHLYAPR",
    "SIXMONTHLYNOV",
    "YEARLY",
    "FYNOV",
    "FYOCT",
    "FYJUL",
    "FYAPR",
];
