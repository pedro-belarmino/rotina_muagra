import { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Box,
  Typography,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  // Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

interface PricingPlan {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  priceOld?: string;
  priceLabel: string;
  priceValue: string;
  priceDescription: string;
  monthlyPrice?: string;
  monthlyLabel?: string;
  benefits: string[];
  buttonText: string;
  buttonUrl?: string;
  type: 'free' | 'planilha' | 'webapp';
  isRecommended?: boolean;
}

export default function PrincingComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedPlan, setExpandedPlan] = useState<string | null>(isMobile ? 'free' : null);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      badge: 'VOCÊ ESTÁ AQUI',
      title: 'Acesso Gratuito! Por que Agradecer não custa nada. E nunca deve custar.',
      subtitle: '',
      priceLabel: 'Investimento',
      priceValue: 'Grátis',
      priceDescription: 'Para sempre, sem compromisso.',
      benefits: [
        'Muagrômetro - Seu contador pessoal de Agradecimentos.',
        'Diário de Agradecimento',
        'Muagrômetro Global - Seu/Nosso contador Universal de Agradecimentos.',
        'Acesso ilimitado e vitalício à essas funções.',
      ],
      buttonText: 'Continuar Gratuito',
      type: 'free',
    },
    {
      id: 'planilha',
      badge: 'ESTRUTURADO',
      title: 'Sua Trilha - Versão Planilha',
      subtitle: 'Trilha Completa + Planilha de Acompanhamento',
      priceOld: 'De R$ 198,80',
      priceLabel: 'Investimento Único',
      priceValue: 'R$ 88,80',
      priceDescription: 'Ativação e liberação de aulas e materiais',
      benefits: [
        'Todos os benefícios da Versão Gratuita +',
        'Trilha Completa (35 dias + Guardião)',
        'Planilha exclusiva (Excel ou Google Sheets)',
        'Selo Agradecedor Verificado (6ª fase Floresta)',
        'Comunidade AgradeciMembros',
        'Encontros ao vivo com Muagra',
        'Vídeo-aulas sobre cada fase',
        'Áudios e meditações guiadas',
        'Materiais exclusivos',
      ],
      buttonText: 'Entrar Agora na Trilha (Versão Planilha)',
      type: 'planilha',
    },
    {
      id: 'webapp',
      badge: '🌟 RECOMENDADO',
      title: 'Sua Trilha - Versão com Webapp exclusivo',
      subtitle: 'Trilha Completa + Webapp Muagra (Gestor de Rotinas e Hábitos)',
      priceOld: 'De R$ 198,80',
      priceLabel: 'Investimento Inicial',
      priceValue: 'R$ 88,80',
      priceDescription: 'Ativação e liberação de aulas e materiais',
      monthlyPrice: 'R$ 18,80/mês',
      monthlyLabel: '(a partir de 30 dias, para manter acesso)',
      benefits: [
        'Todos os benefícios da Versão Planilha +',
        'Marcos de Celebração de Agradecimentos',
        'Webapp exclusivo com interface intuitiva',
        'Além das Fases da Trilha, Crie e acompanhe suas rotinas pessoais',
        'Treine sua disciplina concluindo tarefas diárias simples, mas que rendem resultados compostos',
        'Gestão por tarefa diária, com percentuais e gráficos de evolução em tempo real',
      ],
      buttonText: 'Entrar Agora na Trilha Principal (Versão Webapp Muagra)',
      type: 'webapp',
      isRecommended: true,
    },
  ];

  const togglePlan = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleButtonClick = (plan: PricingPlan) => {
    if (plan.buttonUrl) {
      window.location.href = plan.buttonUrl;
    }
    // URLs vazias para serem preenchidas depois
  };

  const getCardVariant = (type: string) => {
    if (type === 'free') return 'outlined';
    return 'elevation';
  };

  // const getChipColor = (type: string) => {
  //   const colors: Record<string, 'warning' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success'> = {
  //     free: 'default',
  //     planilha: 'default',
  //     webapp: 'warning',
  //   };
  //   return colors[type] || 'default';
  // };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '24px', md: '32px' },
            color: theme.palette.text.primary,
          }}
        >
          Continue Gratuitamente ou Entre na sua Trilha de preferência.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: '700px',
            mx: 'auto',
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            fontSize: { xs: '13px', md: '16px' },
            lineHeight: 1.6,
          }}
        >
          "Ambas, através do Agradecimento, irão te ajudar a te levar sempre para o lugar certo, na hora certa, com as pessoas certas, fazendo o que é certo. Eu garanto por vivência. Muagra"
        </Typography>
      </Box>

      {/* Desktop View - Grid */}
      {!isMobile && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
          {plans.map((plan) => (
            <Box key={plan.id}>
              <Card
                variant={getCardVariant(plan.type)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.isRecommended ? `2px solid ${theme.palette.warning.main}` : undefined,
                  transform: plan.isRecommended ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: plan.isRecommended ? 'scale(1.05)' : 'translateY(-4px)',
                  },
                  background: plan.isRecommended
                    ? `linear-gradient(135deg, ${theme.palette.warning.light}20 0%, ${theme.palette.warning.light}10 100%)`
                    : undefined,
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  {/* Badge */}
                  <Chip
                    label={plan.badge}
                    size="small"
                    color={plan.isRecommended ? 'warning' : 'default'}
                    variant={plan.isRecommended ? 'filled' : 'outlined'}
                    sx={{ mb: 2 }}
                  />

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '16px', md: '20px' },
                      color: theme.palette.text.primary,
                    }}
                  >
                    {plan.title}
                  </Typography>

                  {/* Subtitle */}
                  {plan.subtitle && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                      }}
                    >
                      {plan.subtitle}
                    </Typography>
                  )}

                  {/* Price Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: plan.type === 'free'
                        ? 'transparent'
                        : plan.isRecommended
                          ? `${theme.palette.warning.main}15`
                          : theme.palette.background.default,
                      border: plan.type === 'free' ? `1px solid ${theme.palette.divider}` : 'none',
                    }}
                  >
                    {plan.priceOld && (
                      <Typography
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: theme.palette.text.disabled,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {plan.priceOld}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {plan.priceLabel}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.warning.main,
                        mb: 0.5,
                      }}
                    >
                      {plan.priceValue}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: 'block',
                      }}
                    >
                      {plan.priceDescription}
                    </Typography>
                    {plan.monthlyPrice && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: 'block',
                          mt: 1,
                          pt: 1,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        + <strong style={{ color: theme.palette.warning.main }}>{plan.monthlyPrice}</strong> {plan.monthlyLabel}
                      </Typography>
                    )}
                  </Paper>

                  {/* Benefits */}
                  <List dense sx={{ mb: 2 }}>
                    {plan.benefits.map((benefit, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon
                            sx={{
                              fontSize: '18px',
                              color: plan.type === 'free'
                                ? theme.palette.grey[400]
                                : theme.palette.warning.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: {
                              color: theme.palette.text.primary,
                              fontSize: '13px',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                {/* Button */}
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color={plan.type === 'free' ? 'inherit' : 'warning'}
                    onClick={() => handleButtonClick(plan)}
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '12px',
                      py: 1.5,
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Mobile View - Accordion */}
      {isMobile && (
        <Stack spacing={2}>
          {plans.map((plan) => (
            <Card key={plan.id} variant="outlined">
              <Button
                fullWidth
                onClick={() => togglePlan(plan.id)}
                sx={{
                  justifyContent: 'space-between',
                  p: 2,
                  textAlign: 'left',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    background: theme.palette.action.hover,
                  },
                }}
              >
                <Box>
                  <Chip
                    label={plan.badge}
                    size="small"
                    color={plan.isRecommended ? 'warning' : 'default'}
                    variant={plan.isRecommended ? 'filled' : 'outlined'}
                    sx={{ mb: 1, mr: 1 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {plan.title}
                  </Typography>
                </Box>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedPlan === plan.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    color: plan.isRecommended ? theme.palette.warning.main : theme.palette.text.secondary,
                  }}
                />
              </Button>

              <Collapse in={expandedPlan === plan.id}>
                <CardContent sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                  {plan.subtitle && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                      }}
                    >
                      {plan.subtitle}
                    </Typography>
                  )}

                  {/* Price Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: plan.type === 'free'
                        ? 'transparent'
                        : plan.isRecommended
                          ? `${theme.palette.warning.main}15`
                          : theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {plan.priceOld && (
                      <Typography
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: theme.palette.text.disabled,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {plan.priceOld}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        textTransform: 'uppercase',
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {plan.priceLabel}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.warning.main,
                        mb: 0.5,
                      }}
                    >
                      {plan.priceValue}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: 'block',
                      }}
                    >
                      {plan.priceDescription}
                    </Typography>
                    {plan.monthlyPrice && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: 'block',
                          mt: 1,
                          pt: 1,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        + <strong style={{ color: theme.palette.warning.main }}>{plan.monthlyPrice}</strong> {plan.monthlyLabel}
                      </Typography>
                    )}
                  </Paper>

                  {/* Benefits */}
                  <List dense sx={{ mb: 2 }}>
                    {plan.benefits.map((benefit, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon
                            sx={{
                              fontSize: '18px',
                              color: plan.type === 'free'
                                ? theme.palette.grey[400]
                                : theme.palette.warning.main,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: {
                              color: theme.palette.text.primary,
                              fontSize: '12px',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    color={plan.type === 'free' ? 'inherit' : 'warning'}
                    onClick={() => handleButtonClick(plan)}
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '12px',
                      py: 1.5,
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Collapse>
            </Card>
          ))}
        </Stack>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          color="warning"
          sx={{
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          ← Voltar para a Home
        </Button>
      </Box>
    </Container>
  );
}
