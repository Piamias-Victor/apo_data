import type { AppProps } from 'next/app';
import "@/styles/globals.css"
import { SalesProvider } from '@/contexts/sales';
import { StructureProvider } from '@/contexts/structure';
import { SegmentationProvider } from '@/contexts/segmentation';
import { LabDistributorsProvider } from '@/contexts/labDistributors';
import { FamiliesProvider } from '@/contexts/familiesContext';
import { SpecificitiesProvider } from '@/contexts/specificitiesContext';

export default function MyApp({ Component, pageProps }: AppProps) {
    return <>
        <StructureProvider>
            <SegmentationProvider>
                <LabDistributorsProvider>
                    <FamiliesProvider>
                        <SpecificitiesProvider>
                            <SalesProvider>
                                <Component {...pageProps} />
                            </SalesProvider>
                        </SpecificitiesProvider>
                    </FamiliesProvider>
                </LabDistributorsProvider>
            </SegmentationProvider>
        </StructureProvider>
    </>
}