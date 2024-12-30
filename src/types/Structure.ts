/**
 * Type définissant la structure d'une colonne de table.
 */
export type Column = {
    column_name: string;
    data_type: string;
    character_maximum_length: number | null;
    is_nullable: string;
  };
  
/**
 * Type définissant la structure d'une table avec ses colonnes.
 */
export  type TableStructure = {
[tableName: string]: Column[];
};