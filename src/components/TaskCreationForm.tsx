import { Button, Container, Select, TextField, Typography } from "@mui/material";

export default function TaskCreationForm() {
    return (
        <Container sx={{ display: 'flex', }}>

            <Typography>Adicione uma Tarefa</Typography>

            <Button color="warning" variant="outlined">Voltar</Button>

            <TextField label='Nome *' />
            <TextField label='Descrição' />
            <Select label='Medida *' />
            <TextField label='Meta Diária *' />
            <TextField label='Meta Geral' />
            <TextField label='Horário *' />

            <Button variant="contained" color="warning">
                Salvar
            </Button>
        </Container>
    )
}