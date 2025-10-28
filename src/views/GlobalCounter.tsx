import { Button, Container } from "@mui/material";
import Counter from "../components/GlobalCounter/Counter";
import { useNavigate } from "react-router-dom";

export default function GlobalCouter() {

    const navigate = useNavigate()
    return (
        <Container maxWidth="sm">

            <Counter />
            <Button color="warning" variant="outlined" onClick={() => navigate("/home")} sx={{ width: "100%", }}>Voltar</Button>
        </Container>
    )
}