// src/types/Segmentation.ts

/**
 * Type définissant une sous-catégorie unique.
 */
export type SubCategory = {
  sub_category: string;
};

/**
 * Type définissant une catégorie unique.
 */
export type Category = {
  category: string;
  sub_categories: SubCategory[];
};

/**
 * Type définissant une segmentation avec ses catégories uniques.
 */
export type Segmentation = {
  universe: string;
  categories: Category[];
};

/**
 * Type définissant une `range_name` unique.
 */
export type RangeName = {
  range_name: string;
};

/**
 * Type définissant un `lab_distributor` avec ses `brand_labs` uniques.
 */
export type LabDistributor = {
  lab_distributor: string;
  brand_labs: BrandLab[];
};

/**
 * Type définissant un `brand_lab` avec ses `range_names` uniques.
 */
export type BrandLab = {
  brand_lab: string;
  range_names: RangeName[];
};

/**
 * Type définissant une sous-famille unique.
 */
export type SubFamily = {
  sub_family: string;
};

/**
 * Type définissant une famille unique.
 */
export type Family = {
  family: string;
  sub_families: SubFamily[];
};