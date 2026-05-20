import { Router } from '../services/router.js';
import { EventService } from '../services/event-service.js';
import { Lang } from '../services/lang.js';
import { FormButton } from '../form-components/components/form-button.js';

export class Column {
    constructor(label, type, fieldName) {
        this.label = label;
        this.type = label;
        this.fieldName = fieldName;
    }
}

export class ListDefinition {

    constructor(columns = []) {
        this.columns = columns;
    }
}

export class List {
    builderList = document.createElement('div');

    constructor(tableDefinition) {
        this.tableDefinition = tableDefinition;

        this.createContent();
    }

    createContent() {
        this.builderList.className = 'builder-list';
        this.builderList.append(this.createTableHeader());

        this.builderListBody = document.createElement('div');
        this.builderListBody.className = 'builder-list-body';
        this.builderList.appendChild(this.builderListBody);
    }

    createTableHeader() {
        const builderListHeader = document.createElement('div');
        builderListHeader.className = 'builder-list-header';

        for (const column of this.tableDefinition?.columns) {
            builderListHeader.append(this.createHeaderColumn(column));
        }

        return builderListHeader;
    }

    createHeaderColumn(column) {
        const builderListHeaderColumn = document.createElement('div');
        builderListHeaderColumn.className = 'builder-list-header-column';

        const builderListHeaderColumnLabel = document.createElement('div');
        builderListHeaderColumnLabel.className = 'builder-list-header-column-label';
        builderListHeaderColumnLabel.textContent = column.label;

        const builderListHeaderColumnFilter = document.createElement('div');
        builderListHeaderColumnFilter.className = 'builder-list-header-column-filter';

        const builderListHeaderColumnOrder = document.createElement('div');
        builderListHeaderColumnOrder.className = 'builder-list-header-column-order';

        builderListHeaderColumn.append(builderListHeaderColumnLabel, builderListHeaderColumnFilter, builderListHeaderColumnOrder);
        return builderListHeaderColumn;
    }

    getContent() {
        return this.builderList;
    }

    setData(data = []) {
        this.builderListBody.innerHTML = '';

        for (const row of data) {
            this.builderListBody.appendChild(this.createDataRow(row));
        }
    }

    createDataRow(row) {
        const builderListRow = document.createElement('div');
        builderListRow.className = 'builder-list-row';
        console.log(this.tableDefinition.columns);
        for (const column of this.tableDefinition.columns) {
            console.log(column.fieldName in row)
            if (column.fieldName in row) {
                const builderListCol = document.createElement('div');
                builderListCol.className = 'builder-list-column';
                builderListCol.innerHTML = row[column.fieldName];
                builderListRow.append(builderListCol);
            }
        }
        

        return builderListRow;
    }
}

