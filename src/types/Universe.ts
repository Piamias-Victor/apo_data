/**
 * Type représentant une sous-catégorie.
 */
export type SubCategory = {
    sub_category: string;
  };
  
  /**
   * Type représentant une catégorie et ses sous-catégories.
   */
  export type Category = {
    category: string;
    sub_categories: SubCategory[];
  };
  
  /**
   * Type représentant un univers avec ses catégories et sous-catégories.
   */
  export type Universe = {
    universe: string;
    categories: Category[];
  };
  