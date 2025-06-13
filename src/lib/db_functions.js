import { supabase } from "./supabase";
import { SupabaseOperators } from "./supabaseOperators";

/**
 * GET FUNCTIONS
 */

/**
 * @param {string} table
 * 
 * Column can be: id, name, etc
 * @param {string} column 
 * 
 * To check by multiple columns: 'some_column,other_column'
 */
export const getTableRowByColumn = async (table, column) => {
  let { data: classes, error } = await supabase
    .from(table)
    .select(column);

  return { classes, error };
};

export const getAllFromTable = async (table) => {
  let { data: classes, error } = await supabase
    .from(table)
    .select('*');

  return { classes, error };
};

/**
 * 
 * @param {string} table
 * @param {string} column 
 * @param {int} rangeStart 
 * @param {int} rangeEnd 
 * @returns 
 */
export const getTableRowByPagination = async (table, column, rangeStart, rangeEnd) => {
  let { data: classes, error } = await supabase
    .from(table)
    .select(column)
    .range(rangeStart, rangeEnd)

  return { classes, error };
};

/**
 * Dynamically applies filters to a Supabase query
 * @param {string} tableName - Name of the table to query
 * @param {Array} filters - Array of filter objects like:
 *   { column: 'level', operator: 'gte', value: 10 }
 * @returns {Promise<{ data: any[], error: any }>}
 */
export const getTableRowByFilters = async (table, filters = []) => {
  let query = supabase.from(table).select('*');

  for (const filter of filters) {
    const { column, operator, value } = filter;

    if (!query[operator]) {
      console.warn(`Unsupported operator: ${operator}`);
      continue;
    }

    if (operator === SupabaseOperators.OR) {
      query = query.or(value);
    }
    else if (operator === SupabaseOperators.NOT && Array.isArray(value)) {
      query = query.not(column, value[0], value[1]);
    }
    else {
      query = query[operator](column, value);
    }
  }

  return await query;
};


/**
 * POST FUNCTIONS
 */


/**
 * Can insert many rows at a table if needed
 * @param {string} table 
 * @param {Array} rowData 
 * 
 * @returns data that was added
 */
export const postRowToTable = async (table, rowData) => {
  const { data, error } = await supabase
    .from(table)
    .insert(rowData)
    .select()

  return { data, error };
};



/**
 * PUT FUNCTIONS
 */

/**
 * table name
 * @param {string} table 
 * 
 * needs to be in object form example: { column: 'newValue' }
 * @param {object} newData 
 * 
 * most likely will always be 'id' but can search by any column in table
 * @param {string} column 
 * 
 * value to check in the column
 * @param {string} columnCheck 
 * 
 * @returns updated data
 */
export const updateRowInTable = async (table, newData, column, columnCheck) => {
  const { data, error } = await supabase
    .from(table)
    .update(newData)
    .eq(column, columnCheck)
    .select();

  return { data, error };
};



/**
 * DELETE FUNCTIONS
 */

/**
 * table name
 * @param {string} table 
 * 
 * most likely will always be 'id' but can search by any column in table
 * @param {string} column 
 * 
 * value to check in the column
 * @param {string} columnCheck 
 */
export const deleteRowInTable = async (table, column, columnCheck) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(column, columnCheck)

  return error;
};