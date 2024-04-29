import Dexie, { Table } from "dexie";
import { CategoryCombo, IDashboard } from "./interfaces";
export class DVSDexie extends Dexie {
    dashboards!: Table<IDashboard>;
    categoryCombos!: Table<CategoryCombo>;
    data!: Table<{ visualizationId: string; data: any[] }>;
    constructor() {
        super("dvs");
        this.version(1).stores({
            dashboards: "id",
            categoryCombos: "id",
            data: "visualizationId",
        });
    }
}
export const db = new DVSDexie();
