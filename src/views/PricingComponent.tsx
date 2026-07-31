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
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PricingPlan {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  subtitle2: string;
  priceOld?: string;
  priceLabel: string;
  priceValue: string;
  priceDescription: string;
  monthlyPrice?: string;
  monthlyLabel?: string;
  benefits: string[];
  buttonText: string;
  buttonUrl?: string;
  type: 'free' | 'planilha' | 'webapp' | 'renda';
  isRecommended?: boolean;
  textUnderButton: string;
}

export default function PrincingComponent() {
  const theme = useTheme();
  const { isAuthorizedPartial } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedPlan, setExpandedPlan] = useState<string | null>(
    isMobile ? 'free' : null,
  );
  const navigate = useNavigate();

  const plans: PricingPlan[] = [
    {
      id: 'free',
      badge: isAuthorizedPartial ? 'PLANO GRATUITO' : 'VOCÊ ESTÁ AQUI',
      title: 'WebApp Muagra',
      subtitle: 'Poucas pessoas chegam até aqui. Você faz parte.',
      subtitle2: 'Aqui começa o treino do seu olhar.',
      priceLabel: 'Investimento',
      priceValue: 'Gratuito',
      priceDescription: '',
      benefits: [
        'Muagrômetro pessoal.',
        'Diário do Agradecimento',
        'Contador global de agradecimentos.',
        'Primeiro treino de percepção.',
        'Exercícios para criar o hábito diário.',
        'Descubra seu nível atual de gratidão.',
      ],
      buttonText: 'Começar Gratuitamente',
      type: 'free',
      textUnderButton: 'Seu primeiro passo leva menos de 2 minutos.',
    },
    {
      id: 'rendalizado',
      badge: 'RECOMENDADO',
      title: 'Desafio Rendalizado',
      subtitle:
        'Você já começou a enxergar. Agora é hora de equilibrar sua vida.',
      subtitle2:
        'Quando saúde, família e finanças entram em equilíbrio, agradecer deixa de ser esforço e passa a ser consequência.',
      priceOld: 'De R$ 197,80',
      priceLabel: 'Investimento único',
      priceValue: 'R$ 38,80',
      priceDescription: 'ACESSO IMEDIATO',
      benefits: [
        'Método dos 28 dias.',
        'Apenas 28 minutos por dia',
        'Saúde.',
        'Família.',
        'Finanças',
        'Agradecimento conectado aos três pilares.',
        'Checklist diário.',
        'Exercícios práticos.',
        'Criação de hábitos consistentes.',
        'Mais clareza, disciplina e direção.',
        'Preparação para a Trilha do Agradecedor.',
      ],
      buttonText: 'QUERO EQUILIBRAR MINHA VIDA',
      type: 'renda',
      isRecommended: true,
      textUnderButton:
        'O equilíbrio muda o que você vive. O agradecimento muda a forma como você enxerga tudo isso.',
    },
    {
      id: 'planilha',
      badge: isAuthorizedPartial ? '🌟 VOCÊ ESTÁ AQUI' : '',
      title: 'Trilha do Agradecedor Essencial',
      subtitle: 'Sua vida começou a mudar. Agora transforme o agradecimento em quem você é.',
      subtitle2:
        'Aqui o agradecimento deixa de ser uma prática e se torna uma nova forma de viver.',
      priceOld: 'De R$ 298,80',
      priceLabel: 'Investimento Único',
      priceValue: 'R$ 88,80',
      priceDescription: 'Ativação e liberação de aulas e materiais',
      benefits: [
        'Método da Trilha do Agradecedor',
        'Exercícios guiados de percepção',
        'Estrutura para desenvolver o hábito do agradecimento',
        'Treinamento mental para transformar o olhar',
        'Continuidade do treino iniciado no webapp',
      ],
      buttonText: 'Quero treinar meu olhar',
      type: 'planilha',
      textUnderButton:
        'Pessoas agradecidas não apenas pensam diferente. Elas vivem diferente.',
    },
    {
      id: 'webapp',
      badge: '🔒 ACESSO EXCLUSIVO',
      title: 'AgradeceMembros na Trilha do Agradecedor',
      subtitle:
        'Você chegou até aqui. Agora mantenha sua evolução viva todos os dias.',
      subtitle2: 'O crescimento não termina. Ele precisa continuar.',
      priceOld: 'De R$ 298,80',
      priceLabel: 'Assinatura Mensal',
      priceValue: 'R$ 18,80',
      priceDescription: 'Já sou Agradecedor Verificado',
      monthlyPrice: '',
      monthlyLabel: '',
      benefits: [
        'Conteúdos contínuos de aprofundamento',
        'Novos exercícios',
        'Ambiente de evolução constante',
        'Comunidade de pessoas comprometidas',
        'Acompanhamento contínuo',
        'Evolução constante',
        'Desafios mensais',
        'Ambiente para manter a disciplina',
        'Continuação natural da Trilha',
      ],
      isRecommended: false,
      buttonText: 'Quero fazer parte',
      type: 'webapp',
      textUnderButton: 'Quem continua treinando continua crescendo.',
    },
  ];

  const desktopPlans = plans.slice(0, 3);
  const horizontalPlan = plans[3];

  const link =
    'https://muagrauni.hotmart.host/trilha-do-agradecedor-93a92980-d16d-4162-87ce-3d57dc93c09c';

  const link2 = 'https://oito-minutos-equilibrio.lovable.app/';

  const link3 = 'https://trilhadoagradecedor.atoms.world/';

  const togglePlan = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleButtonClick = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      navigate('/home');
      return;
    }
    if (plan.id === 'rendalizado') {
      window.location.href = link2
      return;
    }
    if (plan.id === 'planilha') {
      window.location.href = link3
      return;
    }

    window.location.href = link;
  };

  const getCardVariant = (type: PricingPlan['type']) => {
    if (type === 'free') {
      return 'outlined';
    }

    return 'elevation';
  };

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
          Sua transformação acontece em quatro etapas. Comece de onde você está
          hoje.
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
          "Toda grande mudança começa com um passo. Primeiro você aprende a
          enxergar. Depois fortalece sua vida. Em seguida transforma sua mente.
          E, por fim, mantém essa evolução todos os dias."
        </Typography>
      </Box>

      {/* Desktop */}
      {!isMobile && (
        <Box sx={{ mb: 4 }}>
          {/* Três primeiras colunas */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 3,
              mb: 3,
            }}
          >
            {desktopPlans.map((plan) => (
              <Box key={plan.id}>
                <Card
                  variant={getCardVariant(plan.type)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: plan.isRecommended
                      ? `2px solid ${theme.palette.warning.main}`
                      : undefined,
                    transform: plan.isRecommended
                      ? 'scale(1.05)'
                      : 'scale(1)',
                    transition: 'all 0.3s ease',
                    background: plan.isRecommended
                      ? `linear-gradient(
                          135deg,
                          ${theme.palette.warning.light}20 0%,
                          ${theme.palette.warning.light}10 100%
                        )`
                      : undefined,
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: plan.isRecommended
                        ? 'scale(1.05)'
                        : 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    {plan.badge !== '' && (
                      <Chip
                        label={plan.badge}
                        size="small"
                        color={
                          plan.isRecommended || plan.type === 'webapp'
                            ? 'warning'
                            : 'default'
                        } variant={
                          plan.isRecommended ? 'filled' : 'outlined'
                        }
                        sx={{ mb: 2 }}
                      />
                    )}

                    {plan.id === 'planilha' ? (
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src="/trilhaDoAgradecedor.png"
                          alt="Trilha do Agradecedor"
                          sx={{
                            width: '100%',
                            maxWidth: 350,
                            height: 'auto',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    ) : (
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
                    )}

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

                    {plan.subtitle2 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: 3,
                        }}
                      >
                        {plan.subtitle2}
                      </Typography>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        background:
                          plan.type === 'free'
                            ? 'transparent'
                            : plan.isRecommended
                              ? `${theme.palette.warning.main}15`
                              : theme.palette.background.default,
                        border:
                          plan.type === 'free'
                            ? `1px solid ${theme.palette.divider}`
                            : 'none',
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
                          +{' '}
                          <strong
                            style={{
                              color: theme.palette.warning.main,
                            }}
                          >
                            {plan.monthlyPrice}
                          </strong>{' '}
                          {plan.monthlyLabel}
                        </Typography>
                      )}
                    </Paper>

                    <List dense sx={{ mb: 2 }}>
                      {plan.benefits.map((benefit, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon
                              sx={{
                                fontSize: '18px',
                                color:
                                  plan.type === 'free'
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

                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      color={
                        plan.type === 'free' ? 'inherit' : 'warning'
                      }
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

                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: 'block',
                      m: 2,
                    }}
                  >
                    {plan.textUnderButton}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Quarta coluna horizontal */}
          {horizontalPlan && (
            <Card
              variant={getCardVariant(horizontalPlan.type)}
              sx={{
                width: '100%',
                border: horizontalPlan.isRecommended
                  ? `2px solid ${theme.palette.warning.main}`
                  : undefined,
                transition: 'all 0.3s ease',
                background: horizontalPlan.isRecommended
                  ? `linear-gradient(
                      135deg,
                      ${theme.palette.warning.light}20 0%,
                      ${theme.palette.warning.light}10 100%
                    )`
                  : undefined,
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(220px, 0.9fr) minmax(220px, 0.8fr) minmax(360px, 1.4fr)',
                  gap: 3,
                  alignItems: 'stretch',
                  p: 3,
                  '&:last-child': {
                    pb: 3,
                  },
                }}
              >
                {/* Identificação */}
                <Box>
                  {horizontalPlan.badge !== '' && (
                    <Chip
                      label={horizontalPlan.badge}
                      size="small"
                      color={
                        horizontalPlan.isRecommended || horizontalPlan.type === 'webapp'
                          ? 'warning'
                          : 'default'
                      }
                      variant={
                        horizontalPlan.isRecommended || horizontalPlan.type === 'webapp'
                          ? 'filled'
                          : 'outlined'
                      }
                      sx={{ mb: 1 }}
                    />
                  )}

                  <Box
                    component="img"
                    src="/Agradecimembros v4.png"
                    alt="AgradeceMembros"
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      mb: 2,
                    }}
                  />

                  {horizontalPlan.subtitle && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: horizontalPlan.subtitle2 ? 2 : 0,
                      }}
                    >
                      {horizontalPlan.subtitle}
                    </Typography>
                  )}

                  {horizontalPlan.subtitle2 && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {horizontalPlan.subtitle2}
                    </Typography>
                  )}
                </Box>

                {/* Preço e botão */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: horizontalPlan.isRecommended
                        ? `${theme.palette.warning.main}15`
                        : theme.palette.background.default,
                    }}
                  >
                    {horizontalPlan.priceOld && (
                      <Typography
                        variant="caption"
                        sx={{
                          textDecoration: 'line-through',
                          color: theme.palette.text.disabled,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {horizontalPlan.priceOld}
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
                      {horizontalPlan.priceLabel}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.warning.main,
                        mb: 0.5,
                      }}
                    >
                      {horizontalPlan.priceValue}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: 'block',
                      }}
                    >
                      {horizontalPlan.priceDescription}
                    </Typography>

                    {horizontalPlan.monthlyPrice && (
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
                        +{' '}
                        <strong
                          style={{
                            color: theme.palette.warning.main,
                          }}
                        >
                          {horizontalPlan.monthlyPrice}
                        </strong>{' '}
                        {horizontalPlan.monthlyLabel}
                      </Typography>
                    )}
                  </Paper>

                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={
                        horizontalPlan.type === 'free'
                          ? 'inherit'
                          : 'warning'
                      }
                      onClick={() =>
                        handleButtonClick(horizontalPlan)
                      }
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '12px',
                        py: 1.5,
                      }}
                    >
                      {horizontalPlan.buttonText}
                    </Button>

                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: 'block',
                        mt: 1.5,
                      }}
                    >
                      {horizontalPlan.textUnderButton}
                    </Typography>
                  </Box>
                </Box>

                {/* Benefícios em duas colunas */}
                <List
                  dense
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    columnGap: 2,
                    alignContent: 'start',
                    p: 0,
                    m: 0,
                  }}
                >
                  {horizontalPlan.benefits.map(
                    (benefit, index) => (
                      <ListItem
                        key={index}
                        disableGutters
                        sx={{
                          alignItems: 'flex-start',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            mt: 0.25,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              fontSize: '18px',
                              color:
                                horizontalPlan.type === 'free'
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
                    ),
                  )}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Mobile */}
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
                  {plan.badge !== '' && (
                    <Chip
                      label={plan.badge}
                      size="small"
                      color={
                        plan.isRecommended || plan.type === 'webapp' ? 'warning' : 'default'
                      }
                      variant={
                        plan.isRecommended || plan.type === 'webapp' ? 'filled' : 'outlined'
                      }
                      sx={{
                        mb: plan.id === 'webapp' ? 0 : 1,
                        mr: plan.id === 'webapp' ? 0 : 1,
                      }}
                    />
                  )}

                  {plan.id === 'webapp' ? (
                    <Box
                      component="img"
                      src="/Agradecimembros v4.png"
                      alt="AgradeceMembros"
                      sx={{
                        width: '200%',
                        maxWidth: 300,
                        height: 'auto',
                        display: 'block',
                        mt: 0.5,
                      }}
                    />
                  ) : plan.id === 'planilha' ? (
                    <Box
                      component="img"
                      src="/trilhaDoAgradecedor.png"
                      alt="Trilha do Agradecedor"
                      sx={{
                        width: '200%',
                        maxWidth: 300,
                        height: 'auto',
                        display: 'block',
                        mt: 0.5,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {plan.title}
                    </Typography>
                  )}
                </Box>

                <ExpandMoreIcon
                  sx={{
                    transform:
                      expandedPlan === plan.id
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    color: plan.isRecommended
                      ? theme.palette.warning.main
                      : theme.palette.text.secondary,
                  }}
                />
              </Button>

              <Collapse in={expandedPlan === plan.id}>
                <CardContent
                  sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
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

                  {plan.subtitle2 && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                      }}
                    >
                      {plan.subtitle2}
                    </Typography>
                  )}

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      background:
                        plan.type === 'free'
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
                        +{' '}
                        <strong
                          style={{
                            color: theme.palette.warning.main,
                          }}
                        >
                          {plan.monthlyPrice}
                        </strong>{' '}
                        {plan.monthlyLabel}
                      </Typography>
                    )}
                  </Paper>

                  <List dense sx={{ mb: 2 }}>
                    {plan.benefits.map((benefit, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon
                            sx={{
                              fontSize: '18px',
                              color:
                                plan.type === 'free'
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

                  <Button
                    fullWidth
                    variant="contained"
                    color={
                      plan.type === 'free' ? 'inherit' : 'warning'
                    }
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

                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'block',
                    m: 2,
                  }}
                >
                  {plan.textUnderButton}
                </Typography>
              </Collapse>
            </Card>
          ))}
        </Stack>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          onClick={() => navigate('/home')}
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