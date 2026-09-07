import { useContext, useState, useCallback, useEffect } from "react";
import { Chip, Grid } from "@mui/material";
import { doI18n } from "pithekos-lib";
import { i18nContext } from "pankosmia-rcl";

import { useNavigate } from "react-router-dom";

function App() {
  const [maxWindowHeight, setMaxWindowHeight] = useState(
    window.innerHeight - 64,
  );
  const handleWindowResize = useCallback((event) => {
    setMaxWindowHeight(window.innerHeight - 64);
  }, []);
  const { i18nRef } = useContext(i18nContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  return (
    <Grid container spacing={2} sx={{ maxHeight: maxWindowHeight }}>
      <Grid size={12}>
        <h1>
          {doI18n(
            "pages:core-contenthandler-bcv_videos:stub_content",
            i18nRef.current,
          )}
        </h1>
      </Grid>
    </Grid>
  );
}

export default App;
