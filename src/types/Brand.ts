// /types/Segmentation.ts
export type RangeName = {
    range_name: string;
  };
  
  export type BrandLab = {
    brand_lab: string;
    range_names: RangeName[];
  };
  
  export type LabDistributor = {
    lab_distributor: string;
    brand_labs: BrandLab[];
  };