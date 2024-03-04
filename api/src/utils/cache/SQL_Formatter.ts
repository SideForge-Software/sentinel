
/**
 * THIS CODE IS NOT THE BEST, BUT IT WORKS SORT OF !!!!!
 */

/**
 * Format an object into a SQL query string
 * @param object 
 */
 export function objectToSqlInsertMethod(object: any): any {

    const identifiers = JSON.parse(object.identifiers);
    const instructions = JSON.parse(object.instructions);

    const table_name: string = identifiers.table_name;
    const value_numbers: Array<string> = Object.keys(instructions).map((value: string, index: number) => {
        return `$${index + 1}`;
    });
    const key_names: String = Object.keys(instructions).map((value: string) => { return value }).join(",");
    const ascended_values: Array<any> = Object.keys(instructions).map((value: string, index: number) => {
        return instructions[value]
    });

    const query = `INSERT INTO ${table_name} (${key_names}) VALUES (${value_numbers});`

    return {
        query: query,
        ascended_values: ascended_values
    }

}

/**
 * Update certain things in a table
 * @param object
 */
export function objectToSqlUpdateMethod(object: any): any {

    console.log(object);
    const identifiers: any = JSON.parse(object.identifiers);
    const instructions: any = JSON.parse(object.instructions);
    // const filter: any = object.filter;

    const table_name: string = identifiers.table_name;
    // const key_names: String = Object.keys(instructions).map((value: string) => { return value }).join(",");
    const ascended_values: Array<any> = Object.keys(instructions).map((value: string, index: number) => {
        return instructions[value]
    });

    const update_commands: Array<string> = Object.keys(instructions).map((value: string, index: number) => {
        return `${value}=$${index+1}`
    })
    const update_query: string = `UPDATE ${table_name} SET ${update_commands.join(", ")}`; // ${filter ? `WHERE ${filter}` : ''}
    console.log(update_query);
    console.log(ascended_values);
    return {
        query: update_query,
        ascended_values: ascended_values
    }

}

/**
 * Get something from a table 
 * @param object 
 */
export function objectToSqlFetchMethod(object: any): any {

    const identifiers: any = JSON.parse(object.identifiers);
    const instructions: any = JSON.parse(object.instructions);
    const table_name: string = identifiers.table_name;
    const filters: string = instructions.filters;
    const values: Array<any> = instructions.values;
    // console.log(`SELECT * FROM ${table_name} ${filters ? `WHERE ${filters}` : ''}`)
    return {
        query: `SELECT * FROM ${table_name} ${filters ? `WHERE ${filters}` : ''}`,
        ascended_values: values
    }

}
