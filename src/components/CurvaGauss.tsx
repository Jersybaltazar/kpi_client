import { Box, useMediaQuery, useTheme } from "@mui/material";
import Gauss from "./Gauss";

const CurvaGauss: React.FC<{ data: number[], ctq: any }> = ({ data, ctq }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ height: isMobile ? 350 : 500, width: '100%' }}>
      {ctq && (
        <Gauss
          data={data}
          lsl={ctq.specification.lsl}
          usl={ctq.specification.usl}
        />
      )}
    </Box>
  );
};

export default CurvaGauss;