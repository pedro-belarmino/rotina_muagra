import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha, // Útil para criar transparências baseadas na cor do tema
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Star from "@mui/icons-material/Stars";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const UpgradePlan: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    "Inclusão e evolução das Fases da Trilha do Agradecedor",
    "Inclusão e medição de evolução das suas rotinas pessoais",
    "Histórico completo de todas as ações",
    "Acesso ao Marco de Celebração",
    "Relatório e Gráficos de Evolução",
    "Possibilidade de participar do podcast PodAgradecer(*)",
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
          textAlign: "center",
          // Usa a cor de warning do tema com transparência para a borda
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
          bgcolor: "background.paper", // Garante adaptação ao dark mode
        }}
      >
        <Star sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />

        <Typography
          variant="h5"
          component="h1"
          fontWeight="800"
          color="text.primary"
          gutterBottom
        >
          Acesso Completo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Webapp Trilha do Agradecedor + Gestor Rotinas
        </Typography>

        {/* Box de Preços com fundo dinâmico */}
        <Box
          sx={{
            bgcolor: "action.hover", // Cor neutra que muda conforme o tema (light/dark)
            p: 3,
            borderRadius: 2,
            width: "100%",
            mb: 4,
            border: "1px inset",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "text.disabled" }}
          >
            De R$ 198,80
          </Typography>
          <Typography variant="h4" color="warning.main" fontWeight="bold">
            Por R$ 88,80
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            (ativação e liberação de aulas e materiais)
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "text.disabled" }}
          >
            De R$ 48,80
          </Typography>
          <Typography variant="h5" color="text.primary" fontWeight="bold">
            Por R$ 18,71{" "}
            <Typography component="span" variant="h6">
              /mês
            </Typography>
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            (manutenção e continuidade do acesso)
          </Typography>
        </Box>

        <List sx={{ width: "100%", mb: 4 }}>
          {features.map((feature, index) => (
            <ListItem key={index} disableGutters sx={{ py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  variant: "body2",
                  color: "text.primary",
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          size="large"
          fullWidth
          color="warning"
          onClick={() => window.open("SUA_URL_DE_CHECKOUT", "_blank")}
          sx={{
            py: 2,
            fontWeight: "bold",
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: (theme) =>
              `0 4px 14px 0 ${alpha(theme.palette.warning.main, 0.4)}`,
          }}
        >
          Quero Acesso Completo Agora
        </Button>

        <Button
          variant="text"
          onClick={() => navigate("/home")}
          sx={{
            mt: 2,
            textTransform: "none",
            color: "text.secondary",
            "&:hover": { color: "text.primary" },
          }}
        >
          Voltar para a Home
        </Button>
      </Paper>
    </Container>
  );
};

export default UpgradePlan;
