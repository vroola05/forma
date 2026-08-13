export class Column {
    label: string;
    type: string;
    fieldName: string;

    constructor(label: string, type: string, fieldName: string) {
        this.label = label;
        this.type = type;
        this.fieldName = fieldName;
    }
}

export class ListDefinition {
    columns: Column[];

    constructor(columns: Column[] = []) {
        this.columns = columns;
    }
}

export class List {
    builderList = document.createElement('div');

    tableDefinition: ListDefinition;
    builderListBody: HTMLElement = document.createElement('div');;
    onClick: ((index: number, row: any) => void) | null = null;

    data: any[] = [];

    constructor(tableDefinition: ListDefinition) {
        this.tableDefinition = tableDefinition;

        this.createContent();
    }

    createContent() {
        this.builderList.className = 'builder-list';
        this.builderList.append(this.createTableHeader());

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

    createHeaderColumn(column: Column) {
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

    setOnClick(onClick: (index: number, row: any) => void) {
        this.onClick = onClick;
    }

    setData(data: any[] = []) {
        this.data = data;
        this.builderListBody.innerHTML = '';

        for (const [index, row] of data.entries()) {
            this.builderListBody.appendChild(this.createDataRow(index, row));
        }
    }

    createDataRow(index: number, row: any) {
        const builderListRow = document.createElement('div');
        builderListRow.className = 'builder-list-row';
        builderListRow.dataset.index = index.toString();
        builderListRow.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.onClick) {
                this.onClick(index, row);
            }
        });

        for (const column of this.tableDefinition.columns) {
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

