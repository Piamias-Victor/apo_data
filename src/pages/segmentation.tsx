import React from "react";
import Tabs from "@/components/old/misc/Tabs";
import SelectedSegmentationList from "@/components/segmentation/SelectedSegmentationList";
import SegmentationDropdown from "@/components/segmentation/SegmentationDropdown";
import { tabItemsSegmentation } from "../components/tabItemsSegmentation";


const SegmentationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Sélectionner un Segment</h1>
      <SegmentationDropdown />
      <SelectedSegmentationList />
      <div className="mt-8">
        <Tabs tabs={tabItemsSegmentation} defaultIndex={0} />
      </div>
    </div>
  );
};

export default SegmentationPage;