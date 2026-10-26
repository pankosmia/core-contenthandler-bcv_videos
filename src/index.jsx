import { createRoot } from "react-dom/client";
import { SpaContainer } from "pankosmia-rcl";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { MaterialDesignContent, SnackbarProvider } from "notistack";
import { styled } from "@mui/material";
import { MuncherTest } from "./pages/MuncherTest";
const router = createHashRouter([
  {
    path: "/",
    element: <MuncherTest />,
  },
]);
function AppLayout() {
  const CustomSnackbarContent = styled(MaterialDesignContent)(() => ({
    "&.notistack-MuiContent-error": {
      backgroundColor: "#FDEDED",
      color: "#D32F2F",
    },
    "&.notistack-MuiContent-info": {
      backgroundColor: "#E5F6FD",
      color: "#0288D1",
    },
    "&.notistack-MuiContent-warning": {
      backgroundColor: "#FFF4E5",
      color: "#EF6C00",
    },
    "&.notistack-MuiContent-success": {
      backgroundColor: "#EDF7ED",
      color: "#2E7D32",
    },
  }));

  return (
    <SnackbarProvider
      Components={{
        error: CustomSnackbarContent,
        info: CustomSnackbarContent,
        warning: CustomSnackbarContent,
        success: CustomSnackbarContent,
      }}
      maxSnack={6}
    >
      <SpaContainer>
        <RouterProvider router={router} />
      </SpaContainer>
    </SnackbarProvider>
  );
}
createRoot(document.getElementById("root")).render(<AppLayout />);
