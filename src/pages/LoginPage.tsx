import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, Divider, Chip,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InventoryIcon from "@mui/icons-material/Inventory2";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      {/* Left panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          background: "linear-gradient(145deg, #0D47A1 0%, #1565C0 50%, #00695C 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle at 30% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 80%, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <Box sx={{ position: "relative", textAlign: "center", color: "white" }}>
          <InventoryIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={800} gutterBottom>
            ERP Inventory
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, maxWidth: 340, lineHeight: 1.7 }}>
            Complete inventory management, real-time stock tracking, and business intelligence in one platform.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 4, flexWrap: "wrap" }}>
            {["Products", "Purchases", "Sales", "Transfers", "Reports"].map((t) => (
              <Chip key={t} label={t} sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 500 }} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <InventoryIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h5" fontWeight={700}>ERP Inventory</Typography>
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setServerError(null)}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Username"
              fullWidth
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 2 }}
              autoComplete="username"
              autoFocus
            />
            <TextField
              label="Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              startIcon={<LockOutlinedIcon />}
              sx={{ py: 1.5, fontSize: "1rem" }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.disabled" align="center" display="block">
            © {new Date().getFullYear()} ERP Inventory System. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
