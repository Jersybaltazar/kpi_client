import { Box, useMediaQuery, useTheme } from "@mui/material";
import CapabilityHistogram from "./CapabilityHistogram";
import { adaptStudyResponseToCapabilityData } from "../utils/adaptStudyResponseToCapabilityData";


const AnalisisCapacidad: React.FC<{ results: any, ctq: any }> = ({ results, ctq }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ height: isMobile ? 450 : 600, width: '100%' }}>
      {results && ctq && (
        <CapabilityHistogram
          data={adaptStudyResponseToCapabilityData(
            results,
            ctq,
            ctq.unit
          )}
        />
      )}
    </Box>
  );
};
export default AnalisisCapacidad;
