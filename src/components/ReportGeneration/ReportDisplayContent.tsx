
import {
    Paper,
    Typography,
    Box,
    LinearProgress,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";
import type { Key } from "react";
import { useHistoryDisplayController } from "../HistoryDisplay/HistoryDisplay.controller";
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
 import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
interface ReportDisplayContentProps {
    data: any;
}

export default function ReportDisplayContent({
    data,
}: ReportDisplayContentProps){
    if (!data) return null;

  const {counterTotal} = useHistoryDisplayController()


return (
    <>
        <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                <Typography variant="h6" color="textSecondary">Balanço Geral</Typography>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {data.generalBalance.toFixed(2)}%
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Gráfico de Agradecimentos</Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                    <LineChart
                        xAxis={[{
                            scaleType: 'point',
                            data: data.counters.map((c: { dateKey: any; }) => c.dateKey)
                        }]}
                        series={[{
                            data: data.counters.map((c: { value: any; }) => c.value),
                            color: '#ed6c02'
                        }]}
                        height={300}
                    />
                </Box>
                <Paper sx={{p: 3, borderRadius: 2}} elevation={5}>
                    <Typography variant="body2" color="textSecondary">
                        Muagradecimentos: {counterTotal}
                    </Typography>
<Paper sx={{ p: 2, m: 2 }}>
  {[
    { value: 100, label: "100 agradecimentos", max: 500 },
    { value: 500, label: "500 agradecimentos", max: 1000 },
    { value: 1000, label: "1.000 agradecimentos", max: 5000 },
    { value: 5000, label: "5.000 agradecimentos", max: 10000 },
    { value: 10000, label: "10.000 agradecimentos", max: 25000 },
    { value: 25000, label: "25.000 agradecimentos", max: 50000 },
    { value: 50000, label: "50.000 agradecimentos", max: 100000 },
    { value: 100000, label: "100.000 agradecimentos+", max: Infinity },
  ].map(({ value, label, max }) => {
    const active = counterTotal >= value && counterTotal < max;
    const checked = counterTotal >= value;

    return (
      <Box
        key={value}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
        }}
      >
        {/* Ícone esquerda */}
        {checked ? (
          <CheckBoxOutlinedIcon />
        ) : (
          <CheckBoxOutlineBlankOutlinedIcon fontSize="small" />
        )}

        {/* Preenchimento tracejado */}
        <Box
          sx={{
            flexGrow: 1,
            mx: 1,
            borderBottom: active
              ? "2px dashed currentColor"
              : "1px dashed rgba(0,0,0,0.3)",
          }}
        />

        {/* Texto direita */}
        <Typography
          variant={active ? "body1" : "subtitle2"}
          sx={{
            fontWeight: active ? "bold" : "normal",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  })}
</Paper>
                
                </Paper>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Balanço por Tarefa</Typography>

                <Box
                    sx={{
                        mt: 2,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                    }}
                >
                    {data.taskBalances.map((task: {
                        id: Key | null | undefined;
                        name: any;
                        totalGoal: any;
                        totalDone: any;
                        percentage: number;
                    }) => (
                        <Paper
                            key={task.id}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {task.name}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Meta: <strong>{task.totalGoal}</strong>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Feito: <strong>{task.totalDone}</strong>
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Progresso</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {task.percentage.toFixed(2)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    color="warning"
                                    variant="determinate"
                                    value={Math.min(100, Number(task.percentage.toFixed(2)))}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Paper>
        </>
    );
}
