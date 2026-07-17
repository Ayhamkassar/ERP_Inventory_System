import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { AppRoutes } from "../routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: '"Inter", "DM Sans", system-ui, sans-serif',
                  fontSize: "0.875rem",
                  maxWidth: 400,
                },
                success: {
                  iconTheme: { primary: "#388E3C", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#D32F2F", secondary: "#fff" },
                  duration: 6000,
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
